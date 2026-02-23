'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { Calendar, MapPin, CheckCircle2, Clock, ExternalLink, Layers } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

type Inscricao = {
  event_id: string
  created_at: string
  convidado_selecionado: boolean
  convite_enviado_em: string | null
  ticket_url: string | null
  event_titulo: string
  event_data_horario: string
  event_local_nome: string
}

function formatEventDate(v: string) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MinhasInscricoes({ userId }: { userId: string }) {
  const t = useTranslations('UserInscricoes')
  const supabase = getSupabaseClient()
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: regs } = await supabase
          .from('event_registrations')
          .select('event_id, created_at, convidado_selecionado, convite_enviado_em, ticket_url')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!regs?.length) return

        const eventIds = (regs as { event_id: string }[]).map((r) => r.event_id)
        const { data: events } = await supabase
          .from('events')
          .select('id, titulo, data_horario, local_nome')
          .in('id', eventIds)

        const eventsMap = new Map(
          (events ?? []).map((e: { id: string; titulo: string; data_horario: string; local_nome: string }) => [e.id, e])
        )

        setInscricoes(
          (regs as {
            event_id: string
            created_at: string | null
            convidado_selecionado: boolean | null
            convite_enviado_em: string | null
            ticket_url: string | null
          }[]).map((r) => {
            const ev = eventsMap.get(r.event_id)
            return {
              event_id: r.event_id,
              created_at: r.created_at ?? '',
              convidado_selecionado: r.convidado_selecionado ?? false,
              convite_enviado_em: r.convite_enviado_em ?? null,
              ticket_url: r.ticket_url ?? null,
              event_titulo: ev?.titulo ?? '—',
              event_data_horario: ev?.data_horario ?? '',
              event_local_nome: ev?.local_nome ?? '—',
            }
          })
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId, supabase])

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-600/30 bg-slate-800/60 p-4 text-center text-sm text-slate-400">
        {t('loading')}
      </div>
    )
  }

  if (inscricoes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-600/30 bg-slate-800/60 p-6 text-center">
        <Layers className="mx-auto mb-3 h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-400">{t('empty')}</p>
        <Link
          href="/eventos"
          className="mt-3 inline-block text-sm text-[var(--brand-primary)] hover:underline"
        >
          {t('viewEvents')}
        </Link>
      </div>
    )
  }

  const proximos = inscricoes.filter((i) => i.event_data_horario > new Date().toISOString())
  const passados = inscricoes.filter((i) => !i.event_data_horario || i.event_data_horario <= new Date().toISOString())

  return (
    <div className="rounded-xl border border-slate-600/30 bg-slate-800/60 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-600/30 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
          <Calendar className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{t('myEvents')}</h3>
          <p className="text-xs text-slate-400">{t('countInterest', { count: inscricoes.length })}</p>
        </div>
      </div>

      <div className="divide-y divide-slate-700/30 max-h-[340px] overflow-y-auto">
        {proximos.length > 0 && (
          <>
            <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400/70 bg-emerald-500/5">
              {t('upcoming')}
            </p>
            {proximos.map((i) => <InscricaoRow key={i.event_id} item={i} t={t} />)}
          </>
        )}
        {passados.length > 0 && (
          <>
            <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-white/5">
              {t('past')}
            </p>
            {passados.map((i) => <InscricaoRow key={i.event_id} item={i} t={t} />)}
          </>
        )}
      </div>
    </div>
  )
}

function InscricaoRow({ item: i, t }: { item: Inscricao; t: ReturnType<typeof useTranslations<'UserInscricoes'>> }) {
  const isFuture = i.event_data_horario > new Date().toISOString()

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isFuture ? 'bg-emerald-400' : 'bg-slate-600'}`}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-white text-sm leading-snug">{i.event_titulo}</p>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
          {i.event_data_horario && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatEventDate(i.event_data_horario)}
            </span>
          )}
          {i.event_local_nome && (
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <MapPin className="h-3 w-3 shrink-0" />
              {i.event_local_nome}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {i.convite_enviado_em ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-400">
            <CheckCircle2 className="h-3 w-3" /> {t('invited')}
          </span>
        ) : i.convidado_selecionado ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
            {t('selected')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
            {t('interest')}
          </span>
        )}
        {i.ticket_url && (
          <a
            href={i.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--brand-primary)] hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> {t('ticket')}
          </a>
        )}
      </div>
    </div>
  )
}
