'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { UserPlus, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Indicado = {
  id: string
  nome: string | null
  updated_at: string | null
}

function formatDate(v: string | null) {
  if (!v) return ''
  return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function MinhasIndicacoes({ userId }: { userId: string }) {
  const t = useTranslations('UserIndicacoes')
  const supabase = getSupabaseClient()
  const [indicados, setIndicados] = useState<Indicado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, nome, updated_at')
          .eq('invited_by_user_id', userId)
          .order('updated_at', { ascending: false })

        setIndicados(
          (data ?? []).map((p: { id: string; nome: string | null; updated_at: string | null }) => ({
            id: p.id,
            nome: p.nome ?? null,
            updated_at: p.updated_at ?? null,
          }))
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId, supabase])

  if (loading) return null

  return (
    <div className="rounded-xl border border-slate-600/30 bg-slate-800/60 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-600/30 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-400">
          <UserPlus className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{t('title')}</h3>
          <p className="text-xs text-slate-400">
            {indicados.length > 0
              ? t('youReferred', { count: indicados.length })
              : t('noReferrals')}
          </p>
        </div>
        {indicados.length > 0 && (
          <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
            {indicados.length}
          </span>
        )}
      </div>

      {indicados.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-slate-600" />
          <p className="text-xs text-slate-500">{t('shareHint')}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-700/30 max-h-[240px] overflow-y-auto">
          {indicados.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  idx === 0
                    ? 'bg-amber-400/20 text-amber-400'
                    : 'bg-cyan-500/15 text-cyan-300'
                }`}
              >
                {(p.nome ?? '?')[0].toUpperCase()}
              </span>
              <p className="flex-1 text-sm text-white">{p.nome ?? '—'}</p>
              {p.updated_at && (
                <p className="shrink-0 text-xs text-slate-500">{formatDate(p.updated_at)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
