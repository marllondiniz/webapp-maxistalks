'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Send,
  BarChart3,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquareText,
  Star,
  Users,
  TrendingUp,
  Lightbulb,
  CalendarDays,
  MapPin,
  Clock,
  UserCircle2,
  ThumbsUp,
  Zap,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'

type EventRecord = {
  id: string
  titulo: string
  data_horario: string
  local_nome?: string
}

type InsightItem = { text: string; responder_nome: string | null; responder_email: string | null }
type EvaluationRow = {
  responder_nome: string | null
  responder_email: string | null
  submitted_at: string
  nota_geral?: number
  nota_ambiente?: number
  nota_recomendacao?: number
  organizacao?: string
  conteudo_aplicavel?: string
  nivel_convidados?: string
  conexoes?: string
  tempo_evento?: string
}

type ResultsData = {
  eventTitle: string | null
  eventDate: string | null
  eventLocal: string | null
  totalSent: number
  totalResponses: number
  avgNotaGeral: number
  avgNotaAmbiente: number
  avgNotaRecomendacao: number
  organizacao: Record<string, number>
  conteudoAplicavel: Record<string, number>
  nivelConvidados: Record<string, number>
  conexoes: Record<string, number>
  tempoEvento: Record<string, number>
  insights: InsightItem[]
  sugestoes: InsightItem[]
  evaluations: EvaluationRow[]
}

const LABELS: Record<string, Record<string, string>> = {
  organizacao: { ruim: 'Ruim', ok: 'Ok', boa: 'Boa', excelente: 'Excelente' },
  conteudoAplicavel: { nada: 'Nada', pouco: 'Pouco', medio: 'Médio', muito: 'Muito', totalmente: 'Totalmente' },
  nivelConvidados: { fraco: 'Fraco', ok: 'Ok', bom: 'Bom', excelente: 'Excelente' },
  conexoes: { nao: 'Não', poucas: 'Sim, poucas', varias: 'Sim, várias' },
  tempoEvento: { curto: 'Curto', ideal: 'Ideal', longo: 'Longo' },
}

const BAR_COLORS: Record<string, string> = {
  organizacao: 'bg-blue-500',
  conteudoAplicavel: 'bg-emerald-500',
  nivelConvidados: 'bg-purple-500',
  conexoes: 'bg-amber-500',
  tempoEvento: 'bg-cyan-500',
}

function BarDistribution({
  title,
  data,
  labels,
  total,
  colorKey,
}: {
  title: string
  data: Record<string, number>
  labels: Record<string, string>
  total: number
  colorKey: string
}) {
  const orderedKeys = Object.keys(labels)
  const barColor = BAR_COLORS[colorKey] || 'bg-blue-500'
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <div className="space-y-3">
        {orderedKeys.map((key) => {
          const count = data[key] || 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">{labels[key]}</span>
                <span className="tabular-nums text-slate-500">{count} ({Math.round(pct)}%)</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ScoreRing({
  value,
  label,
  color,
}: {
  value: number
  label: string
  color: string
}) {
  const pct = (value / 10) * 100
  const circumference = 2 * Math.PI * 40
  const dashOffset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  trend?: string
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  )
}

export function AvaliacoesPanel({ events }: { events: EventRecord[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEventId = searchParams.get('evento') ?? events[0]?.id ?? ''

  const [selectedEventId, setSelectedEventId] = useState(initialEventId)
  const [sending, setSending] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null)
  const [results, setResults] = useState<ResultsData | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)
  const [tab, setTab] = useState<'send' | 'results'>('send')

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null

  const handleEventChange = useCallback(
    (eventId: string) => {
      setSelectedEventId(eventId)
      setSendResult(null)
      setResults(null)
      router.push(`/admin/avaliacoes?evento=${eventId}`, { scroll: false })
    },
    [router]
  )

  const handleSend = useCallback(async (email?: string) => {
    if (!selectedEventId) return
    const isTest = Boolean(email?.trim())
    if (isTest) setSendingTest(true)
    else setSending(true)
    setSendResult(null)
    try {
      const payload: Record<string, string> = { eventId: selectedEventId }
      if (isTest) payload.testEmail = email!.trim()
      const res = await fetch('/api/admin/evaluations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setSendResult({ success: false, message: data.error || 'Erro ao enviar.' })
        return
      }
      const msg = isTest
        ? `E-mail de teste enviado para ${email}!`
        : data.message || `${data.sent} e-mail(s) enviado(s) com sucesso!`
      setSendResult({ success: true, message: msg })
    } catch {
      setSendResult({ success: false, message: 'Erro de rede ao enviar.' })
    } finally {
      setSending(false)
      setSendingTest(false)
    }
  }, [selectedEventId])

  const loadResults = useCallback(async () => {
    if (!selectedEventId) return
    setLoadingResults(true)
    try {
      const res = await fetch(`/api/admin/evaluations/results?eventId=${selectedEventId}`)
      const data = await res.json()
      if (res.ok) setResults(data)
    } catch {
      /* silently fail */
    } finally {
      setLoadingResults(false)
    }
  }, [selectedEventId])

  useEffect(() => {
    if (tab === 'results' && selectedEventId) loadResults()
  }, [tab, selectedEventId, loadResults])

  const eventDate = selectedEvent
    ? new Date(selectedEvent.data_horario).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const responseRate = useMemo(() => {
    if (!results || results.totalSent === 0) return 0
    return Math.round((results.totalResponses / results.totalSent) * 100)
  }, [results])

  return (
    <div className="space-y-6">
      {/* Event selector */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
              Selecionar evento
            </label>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 pr-10 text-sm font-medium text-white outline-none transition focus:border-blue-500/40"
              >
                {events.map((ev) => {
                  const d = new Date(ev.data_horario).toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })
                  return (
                    <option key={ev.id} value={ev.id} className="bg-slate-900">
                      {ev.titulo} — {d}
                    </option>
                  )
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {selectedEvent && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {eventDate}
              </span>
              {selectedEvent.local_nome && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedEvent.local_nome}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white/[0.03] p-1">
        <button
          type="button"
          onClick={() => setTab('send')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
            tab === 'send'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="h-4 w-4" />
          Enviar avaliação
        </button>
        <button
          type="button"
          onClick={() => setTab('results')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
            tab === 'results'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Resultados
        </button>
      </div>

      {/* ====== Send tab ====== */}
      {tab === 'send' && (
        <div className="space-y-6">
          {/* Send card */}
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                <Send className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Disparar avaliação por e-mail</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Será enviado para os <strong className="text-slate-200">convidados com convite enviado</strong> do evento{' '}
                  <strong className="text-white">{selectedEvent?.titulo}</strong>
                  {eventDate ? ` (${eventDate})` : ''}.
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Cada convidado receberá um link único. Quem já recebeu não será enviado novamente.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={sending || sendingTest || !selectedEventId}
              className="flex items-center gap-2.5 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? 'Enviando...' : 'Enviar avaliação para convidados'}
            </button>
          </div>

          {/* Test email card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
                <Zap className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">E-mail de teste</p>
                <p className="text-xs text-slate-600">Visualize o e-mail antes de disparar para todos.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-500/40"
              />
              <button
                type="button"
                onClick={() => handleSend(testEmail)}
                disabled={sendingTest || sending || !testEmail.trim() || !selectedEventId}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {sendingTest ? 'Enviando...' : 'Enviar teste'}
              </button>
            </div>
          </div>

          {/* Send result */}
          {sendResult && (
            <div
              className={`flex items-start gap-3 rounded-xl border px-5 py-4 ${
                sendResult.success
                  ? 'border-emerald-500/20 bg-emerald-500/10'
                  : 'border-red-500/20 bg-red-500/10'
              }`}
            >
              {sendResult.success ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              )}
              <p className={`text-sm font-medium ${sendResult.success ? 'text-emerald-300' : 'text-red-300'}`}>
                {sendResult.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ====== Results tab ====== */}
      {tab === 'results' && (
        <div className="space-y-6">
          {loadingResults ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                <p className="mt-3 text-xs text-slate-500">Carregando resultados...</p>
              </div>
            </div>
          ) : !results ? (
            <div className="py-20 text-center text-sm text-slate-500">
              Selecione um evento para ver os resultados.
            </div>
          ) : results.totalResponses === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
              <MessageSquareText className="mx-auto mb-4 h-14 w-14 text-slate-700" />
              <h3 className="mb-2 text-lg font-semibold text-white">Nenhuma resposta ainda</h3>
              <p className="text-sm text-slate-500">
                {results.totalSent > 0
                  ? `${results.totalSent} e-mail(s) enviado(s). Aguardando respostas dos convidados.`
                  : 'Nenhum e-mail de avaliação foi enviado para este evento ainda.'}
              </p>
            </div>
          ) : (
            <>
              {/* Event info banner */}
              <div className="rounded-2xl border border-blue-500/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                      Resultados da avaliação
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      {results.eventTitle || selectedEvent?.titulo}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {results.eventDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(results.eventDate).toLocaleDateString('pt-BR', {
                            timeZone: 'America/Sao_Paulo',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      {results.eventLocal && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {results.eventLocal}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => loadResults()}
                      disabled={loadingResults}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loadingResults ? 'animate-spin' : ''}`} />
                      Atualizar
                    </button>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">{responseRate}%</p>
                      <p className="text-xs text-slate-500">taxa de resposta</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  icon={Send}
                  label="E-mails enviados"
                  value={results.totalSent}
                  color="bg-blue-500"
                />
                <KpiCard
                  icon={Users}
                  label="Respostas recebidas"
                  value={results.totalResponses}
                  color="bg-emerald-500"
                  trend={`${responseRate}%`}
                />
                <KpiCard
                  icon={Star}
                  label="Nota geral média"
                  value={results.avgNotaGeral}
                  color="bg-amber-500"
                />
                <KpiCard
                  icon={TrendingUp}
                  label="NPS (recomendação)"
                  value={results.avgNotaRecomendacao}
                  color="bg-purple-500"
                />
              </div>

              {/* Score rings */}
              <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
                <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  Médias das notas
                </p>
                <div className="flex flex-wrap items-center justify-center gap-10">
                  <ScoreRing value={results.avgNotaGeral} label="Nota Geral" color="#3b82f6" />
                  <ScoreRing value={results.avgNotaAmbiente} label="Ambiente" color="#10b981" />
                  <ScoreRing value={results.avgNotaRecomendacao} label="Recomendação" color="#a855f7" />
                </div>
              </div>

              {/* Who evaluated */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4 text-slate-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Quem avaliou ({results.evaluations.length})
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nome</th>
                        <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500">E-mail</th>
                        <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500">Data</th>
                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.evaluations.map((ev, i) => (
                        <tr key={i} className="border-b border-white/[0.03] last:border-0">
                          <td className="py-3 pr-4">
                            <span className="font-medium text-slate-200">
                              {ev.responder_nome ?? '—'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-slate-500">{ev.responder_email ?? '—'}</td>
                          <td className="py-3 pr-4 text-slate-500">
                            {ev.submitted_at
                              ? new Date(ev.submitted_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>
                          <td className="py-3">
                            {ev.nota_geral != null ? (
                              <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                                ev.nota_geral >= 8
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : ev.nota_geral >= 5
                                    ? 'bg-amber-500/15 text-amber-400'
                                    : 'bg-red-500/15 text-red-400'
                              }`}>
                                <Star className="h-3 w-3" />
                                {ev.nota_geral}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Distributions */}
              <div className="grid gap-4 sm:grid-cols-2">
                <BarDistribution
                  title="Organização"
                  data={results.organizacao}
                  labels={LABELS.organizacao}
                  total={results.totalResponses}
                  colorKey="organizacao"
                />
                <BarDistribution
                  title="Conteúdo aplicável"
                  data={results.conteudoAplicavel}
                  labels={LABELS.conteudoAplicavel}
                  total={results.totalResponses}
                  colorKey="conteudoAplicavel"
                />
                <BarDistribution
                  title="Nível dos convidados"
                  data={results.nivelConvidados}
                  labels={LABELS.nivelConvidados}
                  total={results.totalResponses}
                  colorKey="nivelConvidados"
                />
                <BarDistribution
                  title="Conexões relevantes"
                  data={results.conexoes}
                  labels={LABELS.conexoes}
                  total={results.totalResponses}
                  colorKey="conexoes"
                />
              </div>

              <BarDistribution
                title="Tempo do evento"
                data={results.tempoEvento}
                labels={LABELS.tempoEvento}
                total={results.totalResponses}
                colorKey="tempoEvento"
              />

              {/* Insights */}
              {results.insights.length > 0 && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Insights mais úteis ({results.insights.length})
                    </p>
                  </div>
                  <div className="space-y-3">
                    {results.insights.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4"
                      >
                        <p className="text-sm leading-relaxed text-slate-200">&ldquo;{item.text}&rdquo;</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <UserCircle2 className="h-3 w-3" />
                          <span>{item.responder_nome || item.responder_email || 'Anônimo'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões */}
              {results.sugestoes.length > 0 && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Sugestões de melhoria ({results.sugestoes.length})
                    </p>
                  </div>
                  <div className="space-y-3">
                    {results.sugestoes.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4"
                      >
                        <p className="text-sm leading-relaxed text-slate-200">&ldquo;{item.text}&rdquo;</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <UserCircle2 className="h-3 w-3" />
                          <span>{item.responder_nome || item.responder_email || 'Anônimo'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
