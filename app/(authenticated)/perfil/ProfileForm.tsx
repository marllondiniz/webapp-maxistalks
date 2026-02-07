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

type ProfileFormProps = {
  profile: ProfileRecord | null
  email: string | null
  onProfileUpdated?: (profile: ProfileRecord) => void
}

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB

const O_QUE_VENDE_OPCOES = [
  'Serviço',
  'Produto digital',
  'Produto físico',
  'Assinatura',
  'Mentoria',
]

const DESAFIOS_OPCOES = [
  'Gerar leads qualificados',
  'Converter mais vendas',
  'Aumentar ticket médio',
  'Melhorar retenção',
  'Escalar operação',
  'Construir equipe',
  'Criar autoridade',
  'Automatizar processos',
]

const inputClass =
  'w-full rounded-xl border border-slate-600/40 bg-slate-900 px-4 py-3 text-sm text-[#f5f5f5] placeholder:text-[#54545b] focus:border-slate-500/50 focus:outline-none'

const TOTAL_STEPS = 5

/** Formata e limita o telefone no padrão BR: (XX) XXXXX-XXXX (até 11 dígitos) */
function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function getPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function ProfileForm({ profile, email, onProfileUpdated }: ProfileFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nome: profile?.nome ?? '',
    bio: profile?.bio ?? '',
    telefone: formatPhoneBR(profile?.telefone ?? ''),
    cidade_estado: profile?.cidade_estado ?? '',
    empresa_projeto: profile?.empresa_projeto ?? '',
    tem_empresa: (profile?.empresa_projeto ?? '').trim() ? 'sim' : 'nao',
    area_principal: profile?.area_principal ?? '',
    estagio_negocio: profile?.estagio_negocio ?? '',
    objetivo_mes: profile?.objetivo_mes ?? '',
    principal_desafio: (profile?.principais_desafios ?? [])[0] ?? '',
    o_que_vende: profile?.o_que_vende ?? '',
    participar_eventos: profile?.participar_eventos ?? false,
    recebe_beneficios: profile?.recebe_beneficios ?? true,
    linkedin: profile?.linkedin ?? '',
    instagram: profile?.instagram ?? '',
    site: profile?.site ?? '',
  })
  const [principaisDesafios, setPrincipaisDesafios] = useState<string[]>(
    profile?.principais_desafios ?? []
  )
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const step5Ref = useRef<HTMLDivElement | null>(null)
  const supabase = getSupabaseClient()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
    }
  }, [localPreviewUrl])

  useEffect(() => {
    if (step === 5) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      step5Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const updateField = (key: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleDesafio = (item: string) => {
    setPrincipaisDesafios((prev) => {
      if (prev.includes(item)) return prev.filter((x) => x !== item)
      if (prev.length >= 3) return prev
      return [...prev, item]
    })
  }

  const phoneDigits = getPhoneDigits(formData.telefone)
  const canProceedStep1 =
    formData.nome.trim() &&
    phoneDigits.length >= 10 &&
    formData.cidade_estado.trim()
  const canProceedStep2 = formData.area_principal && formData.estagio_negocio && (formData.tem_empresa === 'nao' || formData.empresa_projeto.trim())
  const canProceedStep3 = formData.objetivo_mes && principaisDesafios.length > 0
  const canProceedStep4 = true

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

      const payload = {
        id: user.id,
        nome: formData.nome.trim() || null,
        bio: formData.bio.trim() || null,
        telefone: formData.telefone.trim() || null,
        cidade_estado: formData.cidade_estado.trim() || null,
        empresa_projeto: formData.tem_empresa === 'sim' ? formData.empresa_projeto.trim() || null : null,
        area_principal: formData.area_principal || null,
        estagio_negocio: formData.estagio_negocio || null,
        objetivo_mes: formData.objetivo_mes || null,
        participar_eventos: formData.participar_eventos,
        o_que_vende: formData.o_que_vende || null,
        principais_desafios: principaisDesafios.length ? principaisDesafios : null,
        recebe_beneficios: formData.recebe_beneficios,
        linkedin: formData.linkedin.trim() || null,
        instagram: formData.instagram.trim() || null,
        site: formData.site.trim() || null,
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
      })

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
          <h3 className="mb-2 text-lg font-bold text-emerald-200">Perfil concluído!</h3>
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
      {/* Card com etapas */}
      <div className="rounded-xl border border-slate-600/30 bg-slate-800/80 shadow-xl overflow-hidden">
        {/* Header com progresso */}
        <div className="border-b border-white/10 bg-slate-900/50 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Complete seu perfil</h2>
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
          {/* Etapa 1: Dados básicos */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Dados básicos</h3>
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
                  <span className="text-xs text-amber-400">
                    Digite o DDD + número com 10 ou 11 dígitos
                  </span>
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
            </div>
          )}

          {/* Etapa 2: Perfil profissional */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Perfil profissional</h3>
              <div>
                <span className="block text-sm font-medium text-white mb-3">Você tem empresa? *</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('tem_empresa', 'sim')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      formData.tem_empresa === 'sim'
                        ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                        : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('tem_empresa', 'nao')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      formData.tem_empresa === 'nao'
                        ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                        : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>
              {formData.tem_empresa === 'sim' && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-white">Nome da empresa/projeto *</span>
                  <input
                    type="text"
                    value={formData.empresa_projeto}
                    onChange={(e) => updateField('empresa_projeto', e.target.value)}
                    placeholder="Sua empresa ou projeto"
                    className={inputClass}
                  />
                </label>
              )}
              <div>
                <span className="block text-sm font-medium text-white mb-3">Área principal *</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'tecnologia', label: 'Tecnologia' },
                    { value: 'marketing', label: 'Marketing' },
                    { value: 'vendas', label: 'Vendas' },
                    { value: 'consultoria', label: 'Consultoria' },
                    { value: 'criativo', label: 'Criativo' },
                    { value: 'outro', label: 'Outro' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('area_principal', opt.value)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        formData.area_principal === opt.value
                          ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-white mb-3">Estágio do negócio *</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'ideia', label: 'Ideia' },
                    { value: 'validacao', label: 'Validação' },
                    { value: 'tracao', label: 'Tração' },
                    { value: 'escala', label: 'Escala' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('estagio_negocio', opt.value)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        formData.estagio_negocio === opt.value
                          ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3: Objetivo e desafio */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Objetivo e desafio</h3>
              <div>
                <span className="block text-sm font-medium text-white mb-3">Por que você quer participar? *</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'leads', label: 'Gerar leads' },
                    { value: 'vendas', label: 'Aumentar vendas' },
                    { value: 'parcerias', label: 'Fechar parcerias' },
                    { value: 'visibilidade', label: 'Ganhar visibilidade' },
                    { value: 'aprendizado', label: 'Aprender' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('objetivo_mes', opt.value)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        formData.objetivo_mes === opt.value
                          ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-white mb-3">Qual seu principal desafio hoje? *</span>
                <div className="flex flex-wrap gap-2">
                  {DESAFIOS_OPCOES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        const next = principaisDesafios.includes(item)
                          ? principaisDesafios.filter((x) => x !== item)
                          : [item, ...principaisDesafios].slice(0, 3)
                        setPrincipaisDesafios(next)
                      }}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        principaisDesafios.includes(item) && principaisDesafios[0] === item
                          ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">Selecione até 3 (o primeiro é o principal)</p>
              </div>
            </div>
          )}

          {/* Etapa 4: Preferências */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Preferências</h3>
              <div>
                <span className="block text-sm font-medium text-white mb-3">O que você vende hoje?</span>
                <div className="flex flex-wrap gap-2">
                  {O_QUE_VENDE_OPCOES.map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => updateField('o_que_vende', op)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        formData.o_que_vende === op
                          ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'border-slate-600/40 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-slate-600/40 bg-slate-900/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.participar_eventos}
                  onChange={(e) => updateField('participar_eventos', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm font-medium text-white">
                  Quero participar dos eventos do MaxisTalks
                </span>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-600/40 bg-slate-900/50 px-4 py-3">
                <span className="text-sm font-medium text-white">Receber benefícios e novidades</span>
                <button
                  type="button"
                  onClick={() => updateField('recebe_beneficios', !formData.recebe_beneficios)}
                  className={`relative flex h-6 w-11 items-center rounded-full transition ${
                    formData.recebe_beneficios ? 'bg-[#3b82f6]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute left-1 h-4 w-4 rounded-full bg-white transition ${
                      formData.recebe_beneficios ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            </div>
          )}

          {/* Etapa 5: Finalização */}
          {step === 5 && (
            <div ref={step5Ref} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Finalização</h3>
              <p className="text-xs text-slate-500">LinkedIn, Instagram e site são opcionais.</p>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white">LinkedIn</span>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/..."
                  className={inputClass}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white">Instagram</span>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="@seuuser"
                  className={inputClass}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white">Site</span>
                <input
                  type="url"
                  value={formData.site}
                  onChange={(e) => updateField('site', e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white">Bio curta (opcional)</span>
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
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault()
                  handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
                }}
                className="flex-1 rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Salvando...' : 'Concluir'}
              </button>
            )}
          </div>
        </div>
      </div>

      {feedbackNode}
    </form>
  )
}
