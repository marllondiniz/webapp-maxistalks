import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfigFromRequest } from '@/lib/brand'

export async function POST(request: Request) {
  try {
    const { id, email, ref: refReferrerId } = await request.json()

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Dados inválidos: id e email são obrigatórios.' },
        { status: 400 }
      )
    }

    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabaseAdmin = getSupabaseAdmin()

    const existing = await supabaseAdmin.from('profiles').select('id').eq('id', id).maybeSingle()
    const isNewProfile = !existing.data

    let invitedByUserId: string | null = null
    if (isNewProfile && refReferrerId && typeof refReferrerId === 'string') {
      const referrerId = refReferrerId.trim()
      if (referrerId && referrerId !== id) {
        const { data: referrer } = await supabaseAdmin.from('profiles').select('id').eq('id', referrerId).maybeSingle()
        if (referrer) invitedByUserId = referrer.id
      }
    }

    const payload: { id: string; email: string; is_complete: boolean; tenant_id?: string; invited_by_user_id?: string | null } = {
      id,
      email,
      is_complete: false,
    }
    if (tenantId) payload.tenant_id = tenantId
    if (invitedByUserId !== null) payload.invited_by_user_id = invitedByUserId

    const { error } = await supabaseAdmin.from('profiles').upsert(
      payload,
      { onConflict: 'id' }
    )

    if (error) {
      console.error('Erro ao criar perfil:', error)
      return NextResponse.json({ error: 'Erro ao criar perfil.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro inesperado ao criar perfil:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
