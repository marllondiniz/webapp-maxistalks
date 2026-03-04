'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Star, CheckCircle2, AlertCircle, Loader2, Home } from 'lucide-react'

type EvalInfo = {
  evaluationId: string
  eventTitle: string
  eventDate: string | null
}

type FormData = {
  nota_geral: number | null
  nota_ambiente: number | null
  organizacao: string
  conteudo_aplicavel: string
  insight_util: string
  nivel_convidados: string
  conexoes: string
  tempo_evento: string
  nota_recomendacao: number | null
  sugestao_melhoria: string
}

const INITIAL_FORM: FormData = {
  nota_geral: null,
  nota_ambiente: null,
  organizacao: '',
  conteudo_aplicavel: '',
  insight_util: '',
  nivel_convidados: '',
  conexoes: '',
  tempo_evento: '',
  nota_recomendacao: null,
  sugestao_melhoria: '',
}

function ScaleSelector({
  value,
  onChange,
  label,
}: {
  value: number | null
  onChange: (v: number) => void
  label: string
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-200">{label}</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${
              value === n
                ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function OptionSelector({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-200">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
              value === opt.value
                ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AvaliarPage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [info, setInfo] = useState<EvalInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/evaluations/submit?token=${token}`)
        const data = await res.json()
        if (!res.ok) {
          if (data.alreadySubmitted) {
            setAlreadySubmitted(true)
          } else {
            setError(data.error || 'Link inválido ou expirado.')
          }
          return
        }
        setInfo(data)
      } catch {
        setError('Erro ao carregar avaliação.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleSubmit = useCallback(async () => {
    if (
      form.nota_geral === null ||
      form.nota_ambiente === null ||
      !form.organizacao ||
      !form.conteudo_aplicavel ||
      !form.nivel_convidados ||
      !form.conexoes ||
      !form.tempo_evento ||
      form.nota_recomendacao === null
    ) {
      setError('Por favor, responda todas as perguntas obrigatórias.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/evaluations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao enviar avaliação.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Erro de rede ao enviar avaliação.')
    } finally {
      setSubmitting(false)
    }
  }, [form, token])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060c1f]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (alreadySubmitted || submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060c1f] px-4">
        <div className="max-w-md text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
          <h1 className="mb-2 text-2xl font-bold text-white">
            {submitted ? 'Obrigado pela sua avaliação!' : 'Avaliação já enviada'}
          </h1>
          <p className="mb-6 text-sm text-slate-400">
            {submitted
              ? 'Sua opinião é muito importante e nos ajuda a melhorar cada vez mais.'
              : 'Você já respondeu esta avaliação. Obrigado!'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
          >
            <Home className="h-4 w-4" />
            Ir para o início
          </Link>
        </div>
      </div>
    )
  }

  if (error && !info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060c1f] px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-white">Link inválido</h1>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  const eventDate = info?.eventDate
    ? new Date(info.eventDate).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const steps = [
    {
      title: 'Nota geral e ambiente',
      content: (
        <div className="space-y-8">
          <ScaleSelector
            label="1. De 0 a 10, qual sua nota geral do evento?"
            value={form.nota_geral}
            onChange={(v) => setForm((f) => ({ ...f, nota_geral: v }))}
          />
          <ScaleSelector
            label="2. De 0 a 10, como você avalia o ambiente (estrutura, conforto, som e clima do espaço)?"
            value={form.nota_ambiente}
            onChange={(v) => setForm((f) => ({ ...f, nota_ambiente: v }))}
          />
        </div>
      ),
      valid: form.nota_geral !== null && form.nota_ambiente !== null,
    },
    {
      title: 'Organização e conteúdo',
      content: (
        <div className="space-y-8">
          <OptionSelector
            label="3. A organização (check-in, recepção, pontualidade e fluxo) foi:"
            options={[
              { value: 'ruim', label: 'Ruim' },
              { value: 'ok', label: 'Ok' },
              { value: 'boa', label: 'Boa' },
              { value: 'excelente', label: 'Excelente' },
            ]}
            value={form.organizacao}
            onChange={(v) => setForm((f) => ({ ...f, organizacao: v }))}
          />
          <OptionSelector
            label="4. O conteúdo foi aplicável para sua realidade de negócio?"
            options={[
              { value: 'nada', label: 'Nada' },
              { value: 'pouco', label: 'Pouco' },
              { value: 'medio', label: 'Médio' },
              { value: 'muito', label: 'Muito' },
              { value: 'totalmente', label: 'Totalmente' },
            ]}
            value={form.conteudo_aplicavel}
            onChange={(v) => setForm((f) => ({ ...f, conteudo_aplicavel: v }))}
          />
          <div>
            <p className="mb-3 text-sm font-medium text-slate-200">
              5. Qual foi o insight mais útil que você levou?
            </p>
            <textarea
              value={form.insight_util}
              onChange={(e) => setForm((f) => ({ ...f, insight_util: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50"
              rows={3}
              placeholder="Descreva brevemente..."
            />
          </div>
        </div>
      ),
      valid: !!form.organizacao && !!form.conteudo_aplicavel,
    },
    {
      title: 'Networking e tempo',
      content: (
        <div className="space-y-8">
          <OptionSelector
            label="6. O nível dos convidados e das conversas foi:"
            options={[
              { value: 'fraco', label: 'Fraco' },
              { value: 'ok', label: 'Ok' },
              { value: 'bom', label: 'Bom' },
              { value: 'excelente', label: 'Excelente' },
            ]}
            value={form.nivel_convidados}
            onChange={(v) => setForm((f) => ({ ...f, nivel_convidados: v }))}
          />
          <OptionSelector
            label="7. Você fez conexões relevantes?"
            options={[
              { value: 'nao', label: 'Não' },
              { value: 'poucas', label: 'Sim, poucas (1–2)' },
              { value: 'varias', label: 'Sim, várias (3+)' },
            ]}
            value={form.conexoes}
            onChange={(v) => setForm((f) => ({ ...f, conexoes: v }))}
          />
          <OptionSelector
            label="8. O tempo do evento foi:"
            options={[
              { value: 'curto', label: 'Curto' },
              { value: 'ideal', label: 'Ideal' },
              { value: 'longo', label: 'Longo' },
            ]}
            value={form.tempo_evento}
            onChange={(v) => setForm((f) => ({ ...f, tempo_evento: v }))}
          />
        </div>
      ),
      valid: !!form.nivel_convidados && !!form.conexoes && !!form.tempo_evento,
    },
    {
      title: 'Recomendação e sugestões',
      content: (
        <div className="space-y-8">
          <ScaleSelector
            label="9. De 0 a 10, o quanto você recomendaria o evento para outro empreendedor/líder?"
            value={form.nota_recomendacao}
            onChange={(v) => setForm((f) => ({ ...f, nota_recomendacao: v }))}
          />
          <div>
            <p className="mb-3 text-sm font-medium text-slate-200">
              10. O que você mudaria para o próximo ser 10/10?
            </p>
            <textarea
              value={form.sugestao_melhoria}
              onChange={(e) => setForm((f) => ({ ...f, sugestao_melhoria: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50"
              rows={3}
              placeholder="Sua sugestão..."
            />
          </div>
        </div>
      ),
      valid: form.nota_recomendacao !== null,
    },
  ]

  const currentStep = steps[step]

  return (
    <div className="min-h-screen bg-[#060c1f]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5">
            <Star className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400">Avaliação do Evento</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">{info?.eventTitle}</h1>
          {eventDate && <p className="text-sm text-slate-400">{eventDate}</p>}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Etapa {step + 1} de {steps.length}</span>
            <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step title */}
        <h2 className="mb-6 text-lg font-semibold text-white">{currentStep.title}</h2>

        {/* Content */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          {currentStep.content}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => { setStep((s) => s - 1); setError(null) }}
            disabled={step === 0}
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Voltar
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (!currentStep.valid) {
                  setError('Responda todas as perguntas obrigatórias para continuar.')
                  return
                }
                setError(null)
                setStep((s) => s + 1)
              }}
              className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
            >
              Próximo
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !currentStep.valid}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
