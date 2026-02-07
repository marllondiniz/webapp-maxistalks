'use client'

import { useEffect, useState } from 'react'
import { PartyPopper, Trophy } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useRitmoPoints } from '@/lib/useRitmoPoints'
import { formatarPontos, gerarInsightSemanal } from '@/lib/ritmo-points'

export function RitmoPointsPanel() {
  const supabase = getSupabaseClient()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    fetchUser()
  }, [supabase])

  const { saldoAtual, crescimentoSemanal, metaSemanal, progressoSemanal, streak, badges, loading } =
    useRitmoPoints(userId)

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Card Ritmo Points */}
        <div className="relative overflow-hidden rounded-lg border border-slate-600/30 bg-slate-800/80 p-5 shadow-lg">
          <div className="absolute right-3 top-3 rounded-full bg-slate-700/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9a9aa2]">
            Carregando...
          </div>
          <h3 className="text-base font-semibold uppercase tracking-wide text-[#f5f5f5]">
            Ritmo Points Acumulados
          </h3>
          <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-700/60" />
        </div>

        {/* Card Desafio */}
        <div className="relative overflow-hidden rounded-lg border border-slate-600/30 bg-slate-800/80 p-5 shadow-lg">
          <div className="absolute right-3 top-3 rounded-full bg-slate-700/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9a9aa2]">
            Em breve
          </div>
          <h3 className="text-base font-semibold uppercase tracking-wide text-[#f5f5f5]">
            Desafio da Semana
          </h3>
          <p className="mt-2 text-sm text-[#c9c9d2]">Novos desafios chegam toda semana.</p>
        </div>
      </div>
    )
  }

  const faltamPontos = metaSemanal - (saldoAtual % metaSemanal)
  const pontosSemanais = saldoAtual % metaSemanal

  return (
    <div className="space-y-4">
      {/* Card Ritmo Points Acumulados */}
      <div className="relative overflow-hidden rounded-lg border border-slate-600/30 bg-slate-800/80 p-5 shadow-lg md:p-6">
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 shadow-lg">
            Em breve
          </span>
          {badges.length > 0 && !badges[0].visualizado && (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200 shadow-lg">
              <PartyPopper className="h-3 w-3" />
              Novo badge
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold uppercase tracking-wide text-[#f5f5f5]">
          Ritmo Points Acumulados
        </h3>

        <div className="mt-4 flex items-end gap-3">
          <p className="text-4xl font-black tracking-tight text-[#f5f5f5]">
            {formatarPontos(saldoAtual)}
          </p>
          {crescimentoSemanal !== 0 && (
            <span
              className={`mb-1.5 text-sm font-semibold ${
                crescimentoSemanal > 0 ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {crescimentoSemanal > 0 ? '+' : ''}
              {crescimentoSemanal} pts esta semana
            </span>
          )}
        </div>

        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#73737c]">
          Em breve: recompensas e ranking gamificado
        </p>

        {streak > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-300">
            <span>🔥</span>
            <span>
              {streak} {streak === 1 ? 'dia' : 'dias'} de sequência
            </span>
          </div>
        )}

        {/* Barra de progresso semanal */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#f5f5f5]">Meta Semanal</span>
            <span className="text-[#9a9aa2]">
              {pontosSemanais}/{metaSemanal} pts • {progressoSemanal}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all duration-500"
              style={{ width: `${progressoSemanal}%` }}
            />
          </div>
          {progressoSemanal < 100 && (
            <p className="text-xs text-[#9a9aa2]">
              Faltam <span className="font-semibold text-[#f5f5f5]">{faltamPontos} pontos</span> para
              completar a meta desta semana
            </p>
          )}
          {progressoSemanal >= 100 && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Trophy className="h-3.5 w-3.5 shrink-0" />
              Meta semanal alcançada! Continue assim!
            </p>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.slice(0, 5).map((userBadge) => (
              <div
                key={userBadge.badge_id}
                className="flex items-center gap-1.5 rounded-full bg-slate-700/60 px-3 py-1.5 text-xs"
                title={userBadge.badge.descricao}
              >
                <span>{userBadge.badge.icone}</span>
                <span className="font-semibold text-[#f5f5f5]">{userBadge.badge.nome}</span>
              </div>
            ))}
            {badges.length > 5 && (
              <div className="flex items-center gap-1.5 rounded-full bg-slate-700/60 px-3 py-1.5 text-xs font-semibold text-[#9a9aa2]">
                +{badges.length - 5}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="mt-4 inline-flex text-xs font-semibold uppercase tracking-wider text-[#f5f5f5] transition hover:text-emerald-300"
        >
          Ver ranking
        </button>
      </div>

      {/* Card Desafio da Semana */}
      <div className="relative overflow-hidden rounded-lg border border-slate-600/30 bg-slate-800/80 p-5 shadow-lg">
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 shadow-lg">
            Em breve
          </span>
        </div>

        <h3 className="text-base font-semibold uppercase tracking-wide text-[#f5f5f5]">
          Desafio da Semana
        </h3>

        <p className="mt-2 text-sm text-[#c9c9d2]">Novos desafios chegam toda semana.</p>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#73737c]">
          Suas missões aparecerão aqui em breve
        </p>

        <button
          type="button"
          className="mt-4 inline-flex text-xs font-semibold uppercase tracking-wider text-[#f5f5f5] opacity-50"
          disabled
        >
          Ver desafios
        </button>
      </div>
    </div>
  )
}

