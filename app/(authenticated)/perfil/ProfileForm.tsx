'use client'

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  FormEvent,
  ChangeEvent,
} from 'react'
import { UploadCloud, Check, AlertCircle } from 'lucide-react'
import type { ProfileRecord } from '@/lib/profile'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ProfileFormProps = {
  profile: ProfileRecord | null
  email: string | null
  onProfileUpdated?: (profile: ProfileRecord) => void
}

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB

const SEGMENTO_NEGOCIO = [
  'Consultoria', 'E-commerce', 'SaaS', 'Serviços', 'Educação', 'Saúde',
  'Tecnologia', 'Marketing', 'Criativo', 'Financeiro', 'Outro',
]

const PUBLICO_ATENDE = [
  { value: 'B2B', label: 'B2B' },
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B2C', label: 'B2B2C' },
  { value: 'Outro', label: 'Outro' },
]

const FAIXA_FATURAMENTO = [
  'R$0–20k', 'R$20k–50k', 'R$50k–100k', 'R$100k–300k', 'R$300k–1M', 'R$1M+', 'Prefiro não informar',
]

const TICKET_MEDIO = [
  { value: 'ate_500', label: 'até 500' },
  { value: '500_2k', label: '500–2k' },
  { value: '2k_10k', label: '2k–10k' },
  { value: '10k_mais', label: '10k+' },
]

const NUM_COLABORADORES = [
  { value: '1', label: '1' },
  { value: '2_5', label: '2–5' },
  { value: '6_15', label: '6–15' },
  { value: '16_50', label: '16–50' },
  { value: '50_mais', label: '50+' },
]

const AREA_GESTAO = [
  'Vendas', 'Marketing', 'Operações', 'RH', 'Financeiro', 'Produto', 'Tecnologia', 'Comercial', 'Outro',
]

const TAMANHO_EMPRESA = [
  { value: '1_10', label: '1–10' },
  { value: '11_50', label: '11–50' },
  { value: '51_200', label: '51–200' },
  { value: '201_1000', label: '201–1000' },
  { value: '1000_mais', label: '1000+' },
]

const DESAFIOS_DETALHADOS = [
  'Crescer receita/performance',
  'Melhorar conversão/vendas',
  'Marketing e geração de demanda',
  'Processos e operação',
  'Gestão de time/contratação',
  'Produto/entrega',
  'Finanças e metas',
  'Produtividade/foco',
]

const BUSCA_MAXISTALKS = [
  'Novos leads/clientes',
  'Networking e parcerias',
  'Aprendizado prático',
  'Contratar talentos',
  'Visibilidade/marca pessoal',
  'Investimento/captação',
]

const O_QUE_QUER_APRENDER = [
  'Vendas',
  'Marketing',
  'Conteúdo',
  'Tráfego pago',
  'Automação',
  'Funil e lançamentos',
  'Produto',
  'Gestão & Time',
  'Finanças',
  'IA & Tech',
  'Networking e parcerias',
]

const MAIOR_DIFICULDADE = [
  'Falta de leads',
  'Conversão/vendas',
  'Oferta/posicionamento',
  'Conteúdo/constância',
  'Tráfego pago',
  'Processos/time',
  'Finanças',
  'Produtividade/foco',
]

const inputClass =
  'w-full rounded-xl border border-slate-600/40 bg-slate-900 px-4 py-3 text-sm text-[#f5f5f5] placeholder:text-[#54545b] focus:border-slate-500/50 focus:outline-none'

const TOTAL_STEPS = 4

function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function getPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

function toggleMultiSelect<T>(arr: T[], item: T, max: number): T[] {
  if (arr.includes(item)) return arr.filter((x) => x !== item)
  if (arr.length >= max) return arr
  return [...arr, item]
}

export function ProfileForm({ profile, email, onProfileUpdated }: ProfileFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nome: profile?.nome ?? '',
    bio: profile?.bio ?? '',
    telefone: formatPhoneBR(profile?.telefone ?? ''),
    cidade_estado: profile?.cidade_estado ?? '',
    linkedin: profile?.linkedin ?? '',
    instagram: profile?.instagram ?? '',
    posicao_mercado: profile?.posicao_mercado ?? '',
    empresa_projeto: profile?.empresa_projeto ?? '',
    site: profile?.site ?? '',
    segmento_negocio: profile?.segmento_negocio ?? '',
    publico_atende: profile?.publico_atende ?? '',
    faixa_faturamento: profile?.faixa_faturamento ?? '',
    ticket_medio: profile?.ticket_medio ?? '',
    num_colaboradores: profile?.num_colaboradores ?? '',
    cargo_atual: profile?.cargo_atual ?? '',
    area_gestao: profile?.area_gestao ?? '',
    empresa_atual: profile?.empresa_atual ?? '',
    tamanho_empresa: profile?.tamanho_empresa ?? '',
    lidera_time: profile?.lidera_time ?? null as boolean | null,
    recebe_beneficios: profile?.recebe_beneficios ?? true,
    ciente_evento_online: profile?.ciente_evento_online ?? false,
    aceite_lgpd: profile?.aceite_lgpd ?? false,
    maior_dificuldade: profile?.maior_dificuldade ?? '',
  })
  const [desafiosDetalhados, setDesafiosDetalhados] = useState<string[]>(
    profile?.desafios_detalhados ?? []
  )
  const [buscaMaxistalks, setBuscaMaxistalks] = useState<string[]>(
    profile?.busca_maxistalks ?? []
  )
  const [oQueQuerAprender, setOQueQuerAprender] = useState<string[]>(
    profile?.o_que_quer_aprender ?? []
  )
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const step4Ref = useRef<HTMLDivElement | null>(null)
  const supabase = getSupabaseClient()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)

  const isEmpreendedor = formData.posicao_mercado === 'empreendedor'
  const isLider = formData.posicao_mercado === 'lider'

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
    }
  }, [localPreviewUrl])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (step === 4) {
      step4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [step])

  useEffect(() => {
    if (avatarFile) return
    if (profile?.avatar_url) {
      if (profile.avatar_url.startsWith('http')) {
        setAvatarPreview(profile.avatar_url)
        setLocalPreviewUrl(null)
        return
      }
      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(profile.avatar_url)
      if (data?.publicUrl) {
        setAvatarPreview(data.publicUrl)
        setLocalPreviewUrl(null)
      }
    } else {
      setAvatarPreview(null)
    }
  }, [avatarFile, profile?.avatar_url, supabase])

  const updateField = (key: keyof typeof formData, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const phoneDigits = getPhoneDigits(formData.telefone)

  const canProceedStep1 =
    formData.nome.trim() &&
    phoneDigits.length >= 10 &&
    formData.cidade_estado.trim()

  const canProceedStep2 = (() => {
    if (!formData.posicao_mercado) return false
    if (isEmpreendedor) {
      return Boolean(
        formData.empresa_projeto?.trim() &&
        formData.segmento_negocio &&
        formData.publico_atende &&
        formData.faixa_faturamento &&
        formData.ticket_medio &&
        formData.num_colaboradores
      )
    }
    if (isLider) {
      return Boolean(
        formData.cargo_atual?.trim() &&
        formData.area_gestao &&
        formData.empresa_atual?.trim() &&
        formData.tamanho_empresa &&
        formData.lidera_time !== null &&
        desafiosDetalhados.length >= 1 &&
        desafiosDetalhados.length <= 2
      )
    }
    return false
  })()

  const canProceedStep3 =
    buscaMaxistalks.length >= 1 &&
    buscaMaxistalks.length <= 2 &&
    oQueQuerAprender.length >= 1 &&
    oQueQuerAprender.length <= 3 &&
    formData.maior_dificuldade?.trim()

  const canProceedStep4 = formData.ciente_evento_online && formData.aceite_lgpd

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' })
        return
      }

      let avatarPath = profile?.avatar_url ?? null

      if (avatarFile) {
        const fileExtension = avatarFile.name.split('.').pop()?.toLowerCase() || 'png'
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`

        const { error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: avatarFile.type,
          })

        if (uploadError) {
          setFeedback({ type: 'error', message: 'Não foi possível enviar sua foto. Tente novamente.' })
          return
        }

        if (avatarPath && !avatarPath.startsWith('http')) {
          await supabase.storage.from(AVATAR_BUCKET).remove([avatarPath])
        }
        avatarPath = filePath
      }

      const payload: Record<string, unknown> = {
        id: user.id,
        nome: formData.nome.trim() || null,
        bio: formData.bio.trim() || null,
        telefone: formData.telefone.trim() || null,
        cidade_estado: formData.cidade_estado.trim() || null,
        linkedin: formData.linkedin.trim() || null,
        instagram: formData.instagram.trim() || null,
        site: formData.site.trim() || null,
        posicao_mercado: formData.posicao_mercado || null,
        segmento_negocio: formData.segmento_negocio || null,
        publico_atende: formData.publico_atende || null,
        faixa_faturamento: formData.faixa_faturamento || null,
        ticket_medio: formData.ticket_medio || null,
        num_colaboradores: formData.num_colaboradores || null,
        cargo_atual: formData.cargo_atual?.trim() || null,
        area_gestao: formData.area_gestao || null,
        empresa_atual: formData.empresa_atual?.trim() || null,
        tamanho_empresa: formData.tamanho_empresa || null,
        lidera_time: formData.lidera_time,
        empresa_projeto: formData.empresa_projeto?.trim() || null,
        desafios_detalhados: desafiosDetalhados.length ? desafiosDetalhados : null,
        busca_maxistalks: buscaMaxistalks.length ? buscaMaxistalks : null,
        o_que_quer_aprender: oQueQuerAprender.length ? oQueQuerAprender : null,
        maior_dificuldade: formData.maior_dificuldade?.trim() || null,
        ciente_evento_online: formData.ciente_evento_online,
        aceite_lgpd: formData.aceite_lgpd,
        recebe_beneficios: formData.recebe_beneficios,
        avatar_url: avatarPath,
        updated_at: new Date().toISOString(),
        is_complete: true,
      }

      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })

      if (error) {
        console.error('Erro ao salvar perfil:', error)
        setFeedback({ type: 'error', message: error.message || 'Não foi possível salvar.' })
        return
      }

      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso!' })
      onProfileUpdated?.({
        ...profile!,
        ...payload,
      } as ProfileRecord)

      window.dispatchEvent(new CustomEvent('profile-completed'))
      setSavedSuccess(true)
    })
  }

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_AVATAR_SIZE) {
      setFeedback({ type: 'error', message: 'Arquivo maior que 2MB.' })
      event.target.value = ''
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setFeedback({ type: 'error', message: 'Use JPEG ou PNG.' })
      event.target.value = ''
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setAvatarFile(file)
    setAvatarPreview(objectUrl)
    setLocalPreviewUrl(objectUrl)
  }

  const feedbackNode = feedback ? (
    <div
      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
        feedback.type === 'success'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          : 'border-red-500/40 bg-red-500/10 text-red-200'
      }`}
    >
      {feedback.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {feedback.message}
    </div>
  ) : null

  if (savedSuccess) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-emerald-200">Cadastro concluído!</h3>
          <p className="mb-6 text-sm text-slate-300">
            Seus dados foram salvos com sucesso. Clique no botão abaixo para acessar o app.
          </p>
          <button
            type="button"
            onClick={() => router.replace('/inicio')}
            className="w-full rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
          >
            Ir para Início
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
          e.preventDefault()
        }
      }}
      encType="multipart/form-data"
      className="space-y-6"
    >
      <div className="rounded-xl border border-slate-600/30 bg-slate-800/80 shadow-xl overflow-hidden">
        <div className="border-b border-white/10 bg-slate-900/50 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">MaxisTalks — Cadastro</h2>
            <span className="text-sm text-slate-400">
              Etapa {step} de {TOTAL_STEPS}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-[#3b82f6] transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Etapa 1: Básico */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Etapa 1 — Básico</h3>
              <div className="flex justify-center pb-2">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-600/40 bg-slate-900"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Foto" className="h-full w-full object-cover" />
                  ) : (
                    <UploadCloud className="h-8 w-8 text-slate-500" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="sr-only" onChange={handleFileChange} />
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white">Nome completo *</span>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  placeholder="Seu nome completo"
                  className={inputClass}
                  required
                />
              </label>
              {email && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-white">Email *</span>
                  <input type="email" value={email} className={inputClass} readOnly disabled />
                </label>
              )}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white">WhatsApp *</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={formData.telefone}
                  onChange={(e) => updateField('telefone', formatPhoneBR(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className={inputClass}
                  maxLength={16}
                  required
                />
                {phoneDigits.length > 0 && phoneDigits.length < 10 && (
                  <span className="text-xs text-amber-400">Digite o DDD + número com 10 ou 11 dígitos</span>
                )}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white">Cidade/Estado *</span>
                <input
                  type="text"
                  value={formData.cidade_estado}
                  onChange={(e) => updateField('cidade_estado', e.target.value)}
                  placeholder="Ex: São Paulo/SP"
                  className={inputClass}
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-400">Instagram (opcional)</span>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="@seuuser"
                  className={inputClass}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-400">LinkedIn (opcional)</span>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/..."
                  className={inputClass}
                />
              </label>
            </div>
          )}

          {/* Etapa 2: Perfil (segmentação) */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Etapa 2 — Perfil</h3>
              <div>
                <span className="block text-sm font-medium text-white mb-3">Qual é sua posição no mercado hoje? *</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('posicao_mercado', 'empreendedor')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      isEmpreendedor
                        ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                        : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    Empreendedor(a)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('posicao_mercado', 'lider')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      isLider
                        ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                        : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    Líder/gestor(a)
                  </button>
                </div>
              </div>

              {isEmpreendedor && (
                <div className="mt-4 space-y-4 border-t border-slate-600/30 pt-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white">Nome da empresa *</span>
                    <input
                      type="text"
                      value={formData.empresa_projeto}
                      onChange={(e) => updateField('empresa_projeto', e.target.value)}
                      placeholder="Sua empresa"
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-400">Site (opcional, recomendado)</span>
                    <input
                      type="url"
                      value={formData.site}
                      onChange={(e) => updateField('site', e.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </label>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">Segmento do negócio *</span>
                    <select
                      value={formData.segmento_negocio}
                      onChange={(e) => updateField('segmento_negocio', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Selecione</option>
                      {SEGMENTO_NEGOCIO.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">Público que atende *</span>
                    <select
                      value={formData.publico_atende}
                      onChange={(e) => updateField('publico_atende', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Selecione</option>
                      {PUBLICO_ATENDE.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">Faixa de faturamento mensal *</span>
                    <select
                      value={formData.faixa_faturamento}
                      onChange={(e) => updateField('faixa_faturamento', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Selecione</option>
                      {FAIXA_FATURAMENTO.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">Ticket médio *</span>
                    <select
                      value={formData.ticket_medio}
                      onChange={(e) => updateField('ticket_medio', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Selecione</option>
                      {TICKET_MEDIO.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">Nº de colaboradores *</span>
                    <select
                      value={formData.num_colaboradores}
                      onChange={(e) => updateField('num_colaboradores', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Selecione</option>
                      {NUM_COLABORADORES.map((n) => (
                        <option key={n.value} value={n.value}>{n.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {isLider && (
                <div className="mt-4 space-y-4 border-t border-slate-600/30 pt-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white">Cargo atual *</span>
                    <input
                      type="text"
                      value={formData.cargo_atual}
                      onChange={(e) => updateField('cargo_atual', e.target.value)}
                      placeholder="Ex: Gerente de Vendas"
                      className={inputClass}
                    />
                  </label>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">Área *</span>
                    <select
                      value={formData.area_gestao}
                      onChange={(e) => updateField('area_gestao', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Selecione</option>
                      {AREA_GESTAO.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white">Empresa onde trabalha *</span>
                    <input
                      type="text"
                      value={formData.empresa_atual}
                      onChange={(e) => updateField('empresa_atual', e.target.value)}
                      placeholder="Nome da empresa"
                      className={inputClass}
                    />
                  </label>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">Tamanho da empresa *</span>
                    <select
                      value={formData.tamanho_empresa}
                      onChange={(e) => updateField('tamanho_empresa', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Selecione</option>
                      {TAMANHO_EMPRESA.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-3">Você lidera time? *</span>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => updateField('lidera_time', true)}
                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          formData.lidera_time === true
                            ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                            : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('lidera_time', false)}
                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          formData.lidera_time === false
                            ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                            : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-3">Desafios detalhados (até 2) *</span>
                    <div className="flex flex-wrap gap-2">
                      {DESAFIOS_DETALHADOS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDesafiosDetalhados((prev) => toggleMultiSelect(prev, d, 2))}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                            desafiosDetalhados.includes(d)
                              ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                              : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Selecione até 2</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Etapa 3: Intenção */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Etapa 3 — Intenção</h3>
              <div>
                <span className="block text-sm font-medium text-white mb-3">O que você busca no MaxisTalks? (até 2) *</span>
                <div className="flex flex-wrap gap-2">
                  {BUSCA_MAXISTALKS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBuscaMaxistalks((prev) => toggleMultiSelect(prev, b, 2))}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        buscaMaxistalks.includes(b)
                          ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-white mb-3">O que você mais quer aprender agora? (até 3) *</span>
                <div className="flex flex-wrap gap-2">
                  {O_QUE_QUER_APRENDER.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOQueQuerAprender((prev) => toggleMultiSelect(prev, o, 3))}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        oQueQuerAprender.includes(o)
                          ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-white mb-3">Sua maior dificuldade hoje? (escolha 1) *</span>
                <div className="flex flex-wrap gap-2">
                  {MAIOR_DIFICULDADE.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateField('maior_dificuldade', m)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        formData.maior_dificuldade === m
                          ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Etapa 4: Finalização */}
          {step === 4 && (
            <div ref={step4Ref} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Finalização</h3>
              <label className="flex items-start gap-3 rounded-xl border border-slate-600/40 bg-slate-900/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.ciente_evento_online}
                  onChange={(e) => updateField('ciente_evento_online', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm text-white">
                  Estou ciente de que o evento presencial é limitado a 30 pessoas e, caso eu não seja selecionado(a) para o presencial, tenho disponibilidade para assistir online. *
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-slate-600/40 bg-slate-900/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.aceite_lgpd}
                  onChange={(e) => updateField('aceite_lgpd', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm text-white">
                  Li e concordo com a <Link href="/politica-de-privacidade" className="text-[#3b82f6] underline hover:no-underline">Política de Privacidade</Link> e com os <Link href="/termos-de-uso" className="text-[#3b82f6] underline hover:no-underline">Termos de Uso</Link> (LGPD). *
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-slate-600/40 bg-slate-900/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.recebe_beneficios}
                  onChange={(e) => updateField('recebe_beneficios', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm text-slate-400">
                  Autorizo receber comunicações do MaxisTalks/MaxisPlus por WhatsApp e e-mail. (opcional)
                </span>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-400">Bio curta (opcional)</span>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={3}
                  placeholder="Conte um pouco sobre você..."
                  className={inputClass}
                />
              </label>
            </div>
          )}

          {/* Navegação */}
          <div className="mt-6 flex gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Voltar
              </button>
            ) : (
              <div className="flex-1" />
            )}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !canProceedStep1) return
                  if (step === 2 && !canProceedStep2) return
                  if (step === 3 && !canProceedStep3) return
                  setStep((s) => s + 1)
                }}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
                className="flex-1 rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending || !canProceedStep4}
                onClick={(e) => {
                  e.preventDefault()
                  handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
                }}
                className="flex-1 rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Salvando...' : 'Finalizar cadastro'}
              </button>
            )}
          </div>
        </div>
      </div>

      {feedbackNode}
    </form>
  )
}
