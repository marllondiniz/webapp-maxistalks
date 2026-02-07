'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { obterCorIntensidade, gerarInsightSemanal } from '@/lib/ritmo-points'

type ActivityDay = {
  data: string
  dia: string
  tipo: string | null
  intensidade: number
  pontos: number
}

export function ActivityHeatmap() {
  const supabase = getSupabaseClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [activities, setActivities] = useState<ActivityDay[]>([])
  const [totalTreinos, setTotalTreinos] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    fetchUser()
  }, [supabase])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchActivities = async () => {
      // Alinhar para começar na segunda-feira de quatro semanas atrás
      const hoje = new Date()
      const mondayThisWeek = new Date(hoje)
      const dayOfWeek = mondayThisWeek.getDay() // 0 (domingo) - 6 (sábado)
      const diffToMonday = (dayOfWeek + 6) % 7 // transforma domingo (0) em 6, segunda (1) em 0...
      mondayThisWeek.setDate(mondayThisWeek.getDate() - diffToMonday)

      const start = new Date(mondayThisWeek)
      start.setDate(start.getDate() - 21) // 3 semanas antes da segunda atual -> total 4 semanas

      const end = new Date(start)
      end.setDate(start.getDate() + 27) // total de 28 dias

      const { data: workouts } = await supabase
        .from('user_workouts')
        .select('activity_date, activity_type, duration_minutes')
        .eq('user_id', userId)
        .gte('activity_date', start.toISOString().slice(0, 10))
        .lte('activity_date', end.toISOString().slice(0, 10))

      // Gerar array com os 28 dias
      const days: ActivityDay[] = []
      const diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

      for (let i = 0; i < 28; i++) {
        const data = new Date(start)
        data.setDate(start.getDate() + i)
        const dataStr = data.toISOString().slice(0, 10)
        const indiceDia = (data.getDay() + 6) % 7
        const diaSemana = diasSemana[indiceDia]

        const workout = workouts?.find((w) => w.activity_date === dataStr)

        days.push({
          data: dataStr,
          dia: diaSemana,
          tipo: workout?.activity_type ?? null,
          intensidade: workout ? Math.min(100, (workout.duration_minutes ?? 0) * 2) : 0,
          pontos: workout ? 10 : 0,
        })
      }

      const total = days.filter((d) => d.tipo !== null).length

      setActivities(days)
      setTotalTreinos(total)
      setLoading(false)
    }

    fetchActivities()
  }, [userId, supabase])

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-600/30 bg-slate-800/80 p-5 shadow-lg md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[#9a9aa2]">Sua constância</span>
            <h3 className="mt-2 text-lg font-semibold text-[#f5f5f5]">Ritmo das últimas 4 semanas</h3>
          </div>
          <div className="h-8 w-20 animate-pulse rounded-full bg-slate-700/60" />
        </div>
      </div>
    )
  }

  const insight = gerarInsightSemanal(totalTreinos)

  return (
    <div className="rounded-lg border border-slate-600/30 bg-slate-800/80 p-5 shadow-lg md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#9a9aa2]">Sua constância</span>
          <h3 className="mt-2 text-lg font-semibold text-[#f5f5f5]">Ritmo das últimas 4 semanas</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-[#f5f5f5]">
            {totalTreinos} {totalTreinos === 1 ? 'treino' : 'treinos'}
          </span>
          <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 shadow-lg">
            Em breve
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-emerald-300">{insight}</p>
      <p className="text-[11px] uppercase tracking-[0.3em] text-[#73737c]">
        Em breve: histórico completo e sincronização automática
      </p>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {activities.map((day, index) => {
          const corIntensidade = obterCorIntensidade(day.intensidade)
          const isAtivo = day.tipo !== null

          return (
            <div
              key={`${day.data}-${index}`}
              className={`group relative flex h-14 flex-col items-center justify-center rounded-lg border transition-all ${
                isAtivo
                  ? `${corIntensidade} border-emerald-400/30 hover:scale-105`
                  : 'border-slate-600/40 bg-slate-800/80 hover:border-slate-500/40'
              }`}
              title={
                isAtivo
                  ? `${day.data} - ${day.tipo} (${day.pontos} pts)`
                  : `${day.data} - Sem atividade`
              }
            >
              <span
                className={`text-xs font-semibold uppercase ${
                  isAtivo ? 'text-[#0f0f10]' : 'text-[#9a9aa2]'
                }`}
              >
                {day.dia}
              </span>
              {isAtivo && (
                <span className="text-[9px] font-medium text-[#0f0f10]">{day.tipo}</span>
              )}

              {/* Tooltip */}
              {isAtivo && (
                <div className="pointer-events-none absolute -top-12 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-[#f5f5f5] shadow-xl group-hover:block">
                  <div>{new Date(day.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                  <div className="text-emerald-300">+{day.pontos} pts</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-[#9a9aa2]">
        <span>Menos</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded bg-slate-700/60" />
          <div className="h-3 w-3 rounded bg-emerald-100" />
          <div className="h-3 w-3 rounded bg-emerald-200" />
          <div className="h-3 w-3 rounded bg-emerald-300" />
          <div className="h-3 w-3 rounded bg-emerald-400" />
        </div>
        <span>Mais</span>
      </div>
    </div>
  )
}

