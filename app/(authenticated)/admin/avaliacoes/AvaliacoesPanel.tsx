'use client'

import { useState, useCallback, useEffect } from 'react'
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
} from 'lucide-react'

type EventRecord = {
  id: string
  titulo: string
  data_horario: string
  local_nome?: string
}

type ResultsData = {
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
  insights: string[]
  sugestoes: string[]
}

const LABELS: Record<string, Record<string, string>> = {
  organizacao: { ruim: 'Ruim', ok: 'Ok', boa: 'Boa', excelente: 'Excelente' },
  conteudoAplicavel: { nada: 'Nada', pouco: 'Pouco', medio: 'Médio', muito: 'Muito', totalmente: 'Totalmente' },
  nivelConvidados: { fraco: 'Fraco', ok: 'Ok', bom: 'Bom', excelente: 'Excelente' },
  conexoes: { nao: 'Não', poucas: 'Sim, poucas (1–2)', varias: 'Sim, várias (3+)' },
  tempoEvento: { curto: 'Curto', ideal: 'Ideal', longo: 'Longo' },
}

function BarDistribution({
  title,
  data,
  labels,
  total,
}: {
  title: string
  data: Record<string, number>
  labels: Record<string, string>
  total: number
}) {
  const orderedKeys = Object.keys(labels)
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="space-y-2">
        {orderedKeys.map((key) => {
          const count = data[key] || 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-300">{labels[key]}</span>
                <span className="text-slate-500">{count} ({Math.round(pct)}%)</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
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

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
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
      if (res.ok) {
        setResults(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingResults(false)
    }
  }, [selectedEventId])

  useEffect(() => {
    if (tab === 'results' && selectedEventId) {
      loadResults()
    }
  }, [tab, selectedEventId, loadResults])

  const eventDate = selectedEvent
    ? new Date(selectedEvent.data_horario).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

  return (
    <div className="space-y-6">
      {/* Event selector */}
      <div className="rounded-xl border border-white/10 bg-[var(--brand-surface)] p-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Evento
        </label>
        <div className="relative">
          <select
            value={selectedEventId}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-blue-500/50"
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

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('send')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            tab === 'send'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Send className="h-4 w-4" />
          Enviar avaliação
        </button>
        <button
          type="button"
          onClick={() => setTab('results')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            tab === 'results'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Resultados
        </button>
      </div>

      {/* Send tab */}
      {tab === 'send' && (
        <div className="rounded-xl border border-white/10 bg-[var(--brand-surface)] p-6">
          <div className="mb-6 space-y-2">
            <h3 className="text-lg font-semibold text-white">Disparar avaliação por e-mail</h3>
            <p className="text-sm text-slate-400">
              O e-mail será enviado apenas para os <strong className="text-slate-200">convidados selecionados</strong> do evento{' '}
              <strong className="text-white">{selectedEvent?.titulo}</strong>
              {eventDate ? ` (${eventDate})` : ''}.
            </p>
            <p className="text-xs text-slate-500">
              Cada convidado receberá um link único para responder a pesquisa. Quem já recebeu não será enviado novamente.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={sending || sendingTest || !selectedEventId}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? 'Enviando...' : 'Enviar avaliação para convidados'}
          </button>

          {/* Enviar teste */}
          <div className="mt-6 border-t border-white/[0.06] pt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Enviar e-mail de teste
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Envie uma prévia do e-mail para seu endereço antes de disparar para todos os convidados.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50"
              />
              <button
                type="button"
                onClick={() => handleSend(testEmail)}
                disabled={sendingTest || sending || !testEmail.trim() || !selectedEventId}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {sendingTest ? 'Enviando...' : 'Enviar teste'}
              </button>
            </div>
          </div>

          {sendResult && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-lg border px-4 py-3 ${
                sendResult.success
                  ? 'border-emerald-500/20 bg-emerald-500/10'
                  : 'border-red-500/20 bg-red-500/10'
              }`}
            >
              {sendResult.success ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              )}
              <p className={`text-sm ${sendResult.success ? 'text-emerald-300' : 'text-red-300'}`}>
                {sendResult.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results tab */}
      {tab === 'results' && (
        <div className="space-y-6">
          {loadingResults ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : !results ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Selecione um evento para ver os resultados.
            </div>
          ) : results.totalResponses === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[var(--brand-surface)] p-8 text-center">
              <MessageSquareText className="mx-auto mb-3 h-12 w-12 text-slate-600" />
              <p className="text-sm text-slate-400">
                Nenhuma resposta recebida ainda.
                {results.totalSent > 0 && ` ${results.totalSent} e-mail(s) enviado(s).`}
              </p>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  icon={Send}
                  label="E-mails enviados"
                  value={results.totalSent}
                  color="bg-blue-500"
                />
                <KpiCard
                  icon={Users}
                  label="Respostas"
                  value={`${results.totalResponses} (${results.totalSent > 0 ? Math.round((results.totalResponses / results.totalSent) * 100) : 0}%)`}
                  color="bg-emerald-500"
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

              {/* Score card */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                  <p className="mb-1 text-xs font-medium text-slate-400">Nota Geral</p>
                  <p className="text-3xl font-bold text-white">{results.avgNotaGeral}</p>
                  <p className="text-xs text-slate-500">de 10</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                  <p className="mb-1 text-xs font-medium text-slate-400">Ambiente</p>
                  <p className="text-3xl font-bold text-white">{results.avgNotaAmbiente}</p>
                  <p className="text-xs text-slate-500">de 10</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                  <p className="mb-1 text-xs font-medium text-slate-400">Recomendação</p>
                  <p className="text-3xl font-bold text-white">{results.avgNotaRecomendacao}</p>
                  <p className="text-xs text-slate-500">de 10</p>
                </div>
              </div>

              {/* Distributions */}
              <div className="grid gap-4 sm:grid-cols-2">
                <BarDistribution
                  title="Organização"
                  data={results.organizacao}
                  labels={LABELS.organizacao}
                  total={results.totalResponses}
                />
                <BarDistribution
                  title="Conteúdo aplicável"
                  data={results.conteudoAplicavel}
                  labels={LABELS.conteudoAplicavel}
                  total={results.totalResponses}
                />
                <BarDistribution
                  title="Nível dos convidados"
                  data={results.nivelConvidados}
                  labels={LABELS.nivelConvidados}
                  total={results.totalResponses}
                />
                <BarDistribution
                  title="Conexões relevantes"
                  data={results.conexoes}
                  labels={LABELS.conexoes}
                  total={results.totalResponses}
                />
                <BarDistribution
                  title="Tempo do evento"
                  data={results.tempoEvento}
                  labels={LABELS.tempoEvento}
                  total={results.totalResponses}
                />
              </div>

              {/* Text responses */}
              {results.insights.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Insights mais úteis
                  </p>
                  <div className="space-y-2">
                    {results.insights.map((text, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3"
                      >
                        <p className="text-sm text-slate-300">"{text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.sugestoes.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sugestões de melhoria
                  </p>
                  <div className="space-y-2">
                    {results.sugestoes.map((text, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3"
                      >
                        <p className="text-sm text-slate-300">"{text}"</p>
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
