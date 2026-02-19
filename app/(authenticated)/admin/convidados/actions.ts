'use server'

import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export type SaveSelectionPayload = {
  eventId: string
  selectedUserIds: string[]
}

export async function saveGuestSelection({ eventId, selectedUserIds }: SaveSelectionPayload) {
  const supabase = getSupabaseAdmin()

  // Busca todos os interessados do evento
  const { data: all, error: fetchErr } = await supabase
    .from('event_registrations')
    .select('user_id')
    .eq('event_id', eventId)

  if (fetchErr) return { error: fetchErr.message }

  const allUserIds = (all ?? []).map((r: { user_id: string }) => r.user_id)
  const selectedSet = new Set(selectedUserIds)

  // Atualiza todos em lote (dois updates: marca selecionados e desmarca os demais)
  const toSelect = allUserIds.filter((id) => selectedSet.has(id))
  const toDeselect = allUserIds.filter((id) => !selectedSet.has(id))

  const promises: Promise<unknown>[] = []

  if (toSelect.length > 0) {
    promises.push(
      supabase
        .from('event_registrations')
        .update({ convidado_selecionado: true })
        .eq('event_id', eventId)
        .in('user_id', toSelect)
        .then(() => ({})) as Promise<unknown>
    )
  }

  if (toDeselect.length > 0) {
    promises.push(
      supabase
        .from('event_registrations')
        .update({ convidado_selecionado: false })
        .eq('event_id', eventId)
        .in('user_id', toDeselect)
        .then(() => ({})) as Promise<unknown>
    )
  }

  await Promise.all(promises)
  return { error: null }
}

export type MarkSentPayload = {
  eventId: string
  userIds: string[]
}

export async function markInvitesSent({ eventId, userIds }: MarkSentPayload) {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('event_registrations')
    .update({ convite_enviado_em: now })
    .eq('event_id', eventId)
    .in('user_id', userIds)

  return { error: error?.message ?? null }
}

export async function markInvitesUnsent({ eventId, userIds }: MarkSentPayload) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('event_registrations')
    .update({ convite_enviado_em: null })
    .eq('event_id', eventId)
    .in('user_id', userIds)

  return { error: error?.message ?? null }
}
