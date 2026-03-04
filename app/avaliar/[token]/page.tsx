'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Star, CheckCircle2, AlertCircle, Loader2, Home, ChevronRight, ChevronLeft, Sparkles, Send } from 'lucide-react'

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

const STEP_ICONS = ['🎯', '📋', '🤝', '⭐']

function ScaleSelector({
  value,
  onChange,
  label,
  description,
}: {
  value: number | null
  onChange: (v: number) => void
  label: string
  description?: string
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => {
          const isSelected = value === n
          const colorClass = isSelected
            ? n <= 3
              ? 'border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/25'
              : n <= 6
                ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
            : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-200 ${colorClass}`}
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-600">
        <span>Muito ruim</span>
        <span>Excelente</span>
      </div>
    </div>
  )
}

function OptionSelector({
  options,
  value,
  onChange,
  label,
  description,
}: {
  options: { value: string; label: string; emoji?: string }[]
  value: string
  onChange: (v: string) => void
  label: string
  description?: string
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
              value === opt.value
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10'
                : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/15 hover:bg-white/[0.04]'
            }`}
          >
            {opt.emoji && <span className="text-base">{opt.emoji}</span>}
            <span>{opt.label}</span>
            {value === opt.value && <CheckCircle2 className="ml-auto h-4 w-4 text-blue-400" />}
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
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-3 text-sm text-slate-500">Carregando avaliação...</p>
        </div>
      </div>
    )
  }

  if (alreadySubmitted || submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060c1f] px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white">
            {submitted ? 'Obrigado!' : 'Avaliação já enviada'}
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-slate-400">
            {submitted
              ? 'Sua avaliação foi registrada com sucesso. Sua opinião é muito importante e nos ajuda a melhorar cada vez mais.'
              : 'Você já respondeu esta avaliação anteriormente. Agradecemos sua participação!'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
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
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-white">Link inválido</h1>
          <p className="mb-8 text-sm text-slate-400">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"
          >
            <Home className="h-4 w-4" />
            Ir para o início
          </Link>
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
      subtitle: 'Avalie sua experiência geral e o espaço do evento.',
      content: (
        <div className="space-y-10">
          <ScaleSelector
            label="De 0 a 10, qual sua nota geral do evento?"
            value={form.nota_geral}
            onChange={(v) => setForm((f) => ({ ...f, nota_geral: v }))}
          />
          <ScaleSelector
            label="De 0 a 10, como você avalia o ambiente?"
            description="Estrutura, conforto, som e clima do espaço"
            value={form.nota_ambiente}
            onChange={(v) => setForm((f) => ({ ...f, nota_ambiente: v }))}
          />
        </div>
      ),
      valid: form.nota_geral !== null && form.nota_ambiente !== null,
    },
    {
      title: 'Organização e conteúdo',
      subtitle: 'Como foi a experiência de organização e os temas abordados.',
      content: (
        <div className="space-y-8">
          <OptionSelector
            label="A organização foi:"
            description="Check-in, recepção, pontualidade e fluxo"
            options={[
              { value: 'ruim', label: 'Ruim', emoji: '😕' },
              { value: 'ok', label: 'Ok', emoji: '😐' },
              { value: 'boa', label: 'Boa', emoji: '🙂' },
              { value: 'excelente', label: 'Excelente', emoji: '🤩' },
            ]}
            value={form.organizacao}
            onChange={(v) => setForm((f) => ({ ...f, organizacao: v }))}
          />
          <OptionSelector
            label="O conteúdo foi aplicável para sua realidade?"
            options={[
              { value: 'nada', label: 'Nada', emoji: '❌' },
              { value: 'pouco', label: 'Pouco', emoji: '🤏' },
              { value: 'medio', label: 'Médio', emoji: '⚖️' },
              { value: 'muito', label: 'Muito', emoji: '💡' },
              { value: 'totalmente', label: 'Totalmente', emoji: '🚀' },
            ]}
            value={form.conteudo_aplicavel}
            onChange={(v) => setForm((f) => ({ ...f, conteudo_aplicavel: v }))}
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">
              Qual foi o insight mais útil que você levou?
            </p>
            <p className="text-xs text-slate-500">Opcional, mas adoramos saber!</p>
            <textarea
              value={form.insight_util}
              onChange={(e) => setForm((f) => ({ ...f, insight_util: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.05]"
              rows={3}
              placeholder="Ex: A estratégia de funil que o palestrante apresentou..."
            />
          </div>
        </div>
      ),
      valid: !!form.organizacao && !!form.conteudo_aplicavel,
    },
    {
      title: 'Networking e tempo',
      subtitle: 'Sobre as pessoas, conexões e duração do evento.',
      content: (
        <div className="space-y-8">
          <OptionSelector
            label="O nível dos convidados e das conversas foi:"
            options={[
              { value: 'fraco', label: 'Fraco', emoji: '👎' },
              { value: 'ok', label: 'Ok', emoji: '👌' },
              { value: 'bom', label: 'Bom', emoji: '👍' },
              { value: 'excelente', label: 'Excelente', emoji: '🔥' },
            ]}
            value={form.nivel_convidados}
            onChange={(v) => setForm((f) => ({ ...f, nivel_convidados: v }))}
          />
          <OptionSelector
            label="Você fez conexões relevantes?"
            options={[
              { value: 'nao', label: 'Não', emoji: '😔' },
              { value: 'poucas', label: 'Sim, poucas (1–2)', emoji: '🤝' },
              { value: 'varias', label: 'Sim, várias (3+)', emoji: '🎉' },
            ]}
            value={form.conexoes}
            onChange={(v) => setForm((f) => ({ ...f, conexoes: v }))}
          />
          <OptionSelector
            label="O tempo do evento foi:"
            options={[
              { value: 'curto', label: 'Curto demais', emoji: '⏩' },
              { value: 'ideal', label: 'Ideal', emoji: '✅' },
              { value: 'longo', label: 'Longo demais', emoji: '⏳' },
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
      subtitle: 'Última etapa! Nos ajude a fazer o próximo evento ainda melhor.',
      content: (
        <div className="space-y-10">
          <ScaleSelector
            label="De 0 a 10, o quanto recomendaria este evento?"
            description="Para outro empreendedor ou líder"
            value={form.nota_recomendacao}
            onChange={(v) => setForm((f) => ({ ...f, nota_recomendacao: v }))}
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">
              O que você mudaria para o próximo ser 10/10?
            </p>
            <p className="text-xs text-slate-500">Sua sugestão vale ouro para nós.</p>
            <textarea
              value={form.sugestao_melhoria}
              onChange={(e) => setForm((f) => ({ ...f, sugestao_melhoria: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.05]"
              rows={3}
              placeholder="Ex: Mais tempo para networking, coffee break melhor..."
            />
          </div>
        </div>
      ),
      valid: form.nota_recomendacao !== null,
    },
  ]

  const currentStep = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-[#060c1f]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Avaliação do Evento</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{info?.eventTitle}</h1>
          {eventDate && (
            <p className="text-sm text-slate-500">{eventDate}</p>
          )}
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i < step || (i === step + 1 && currentStep.valid)) {
                  setError(null)
                  setStep(i)
                }
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-base transition-all duration-300 ${
                i === step
                  ? 'scale-110 bg-blue-500 shadow-lg shadow-blue-500/30'
                  : i < step
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/[0.04] text-slate-600'
              }`}
            >
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : STEP_ICONS[i]}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-600">
            <span>Etapa {step + 1} de {steps.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">{currentStep.title}</h2>
          <p className="mt-1 text-xs text-slate-500">{currentStep.subtitle}</p>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-6 shadow-2xl shadow-black/20 sm:p-8">
          {currentStep.content}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => { setStep((s) => s - 1); setError(null) }}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronLeft className="h-4 w-4" />
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
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !currentStep.valid}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-[11px] text-slate-700">
          Suas respostas são confidenciais e serão usadas apenas para melhorar os próximos eventos.
        </p>
      </div>
    </div>
  )
}
