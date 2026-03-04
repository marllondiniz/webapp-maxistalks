'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  FormEvent,
  ChangeEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { UploadCloud, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import type { ProfileRecord } from '@/lib/profile'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPhoneBR, getPhoneDigits } from '@/lib/phone'

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
  'w-full rounded-xl border border-slate-600/40 bg-[var(--brand-surface-alt)] px-4 py-3 text-sm text-[#f5f5f5] placeholder:text-[#54545b] focus:border-slate-500/50 focus:outline-none'

const TOTAL_STEPS = 4

type SelectOption = { value: string; label: string }

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  closeLabel = 'Fechar',
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  closeLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  const handleOpen = () => {
    const mobile = window.innerWidth < 640
    // toggle: se já estiver aberto no mesmo modo, fecha
    if (open && isMobile === mobile) {
      setOpen(false)
      return
    }
    setIsMobile(mobile)
    if (!mobile && triggerRef.current) {
      setDropdownRect(triggerRef.current.getBoundingClientRect())
    }
    setOpen(true)
  }

  // Fechar ao clicar fora (desktop)
  useEffect(() => {
    if (!open || isMobile) return
    const handler = (e: PointerEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    const timer = setTimeout(() => document.addEventListener('pointerdown', handler), 80)
    return () => { clearTimeout(timer); document.removeEventListener('pointerdown', handler) }
  }, [open, isMobile])

  // Fechar dropdown de select no desktop ao rolar a página
  useEffect(() => {
    if (!open || isMobile) return
    const onScroll = () => setOpen(false)
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [open, isMobile])

  const mobileSheet = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}
      onPointerDown={() => setOpen(false)}
    >
      <div
        style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
        className="rounded-t-2xl bg-[var(--brand-surface)]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <span className="text-sm font-semibold text-white">{label ?? placeholder}</span>
          <button type="button" onPointerDown={(e) => { e.stopPropagation(); setOpen(false) }} className="rounded-lg px-3 py-1 text-sm font-medium text-[var(--brand-primary)]">
            {closeLabel}
          </button>
        </div>
        <div className="overflow-y-auto pb-8">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onPointerDown={(e) => { e.stopPropagation(); onChange(opt.value); setOpen(false) }}
              className={`flex w-full items-center justify-between border-b border-slate-700/40 px-4 py-4 text-left text-sm active:bg-white/10 ${opt.value === value ? 'text-[var(--brand-primary)]' : 'text-[#f5f5f5]'}`}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check className="h-4 w-4 shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const desktopDropdown = dropdownRect ? (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: dropdownRect.bottom + 4,
        left: dropdownRect.left,
        width: dropdownRect.width,
        maxHeight: 280,
        overflowY: 'auto',
        zIndex: 9999,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        border: '1px solid rgba(100,116,139,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false) }}
          style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', textAlign: 'left', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: opt.value === value ? '#3b82f6' : '#f5f5f5' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.07)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
        >
          <span>{opt.label}</span>
          {opt.value === value && <Check style={{ width: 14, height: 14, flexShrink: 0 }} />}
        </button>
      ))}
    </div>
  ) : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onPointerDown={handleOpen}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={selected ? 'text-[#f5f5f5]' : 'text-[#54545b]'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[var(--brand-text-muted)]" />
      </button>

      {open && createPortal(isMobile ? mobileSheet : desktopDropdown, document.body)}
    </>
  )
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecionar',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhum resultado',
  disabled = false,
  loading = false,
  loadingText = 'Carregando...',
}: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  loading?: boolean
  loadingText?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    )
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const triggerLabel = loading
    ? loadingText
    : selected
    ? selected.label
    : placeholder

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          if (!disabled && !loading) {
            setOpen((o) => !o)
            setQuery('')
          }
        }}
        className={`${inputClass} flex w-full items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className={selected ? 'text-[#f5f5f5]' : 'text-[#54545b]'}>
          {triggerLabel}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 shrink-0 text-[var(--brand-text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-600/40 bg-[var(--brand-surface)] shadow-2xl shadow-black/50">
          <div className="border-b border-slate-700/60 p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg bg-slate-700/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div className="max-h-52 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="px-4 py-5 text-center text-sm text-[var(--brand-text-muted)]">{emptyText}</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`flex w-full items-center justify-between border-b border-slate-700/30 px-4 py-3 text-left text-sm transition last:border-0 hover:bg-white/5 active:bg-white/10 ${
                    value === opt.value ? 'font-semibold text-blue-400' : 'text-[#f5f5f5]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0 text-blue-400" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const ESTADOS_BR = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

function parseCidadeEstado(value: string | null | undefined): { cidade: string; estado: string } {
  if (!value) return { cidade: '', estado: '' }
  const raw = value.trim()
  if (!raw) return { cidade: '', estado: '' }

  // tenta encontrar um UF conhecido no final do texto (Cidade / UF, Cidade-UF, etc.)
  const upper = raw.toUpperCase()
  const ufCodes = ESTADOS_BR.map((e) => e.value)
  const foundUf = ufCodes.find(
    (uf) =>
      upper.endsWith(` ${uf}`) ||
      upper.endsWith(`/${uf}`) ||
      upper.endsWith(` - ${uf}`) ||
      upper.endsWith(`- ${uf}`)
  )
  if (foundUf) {
    const index = upper.lastIndexOf(foundUf)
    const cidadePart = raw.slice(0, index).replace(/[\s,/\-]+$/g, '').trim()
    return { cidade: cidadePart, estado: foundUf }
  }

  // fallback: considera tudo como cidade; remove barras/espacos no final (ex: "Guarapari / /" -> "Guarapari")
  const cidadeOnly = raw.replace(/\s*\/\s*\/?\s*$/g, '').trim()
  return { cidade: cidadeOnly, estado: '' }
}

function toggleMultiSelect<T>(arr: T[], item: T, max: number): T[] {
  if (arr.includes(item)) return arr.filter((x) => x !== item)
  if (arr.length >= max) return arr
  return [...arr, item]
}

export function ProfileForm({ profile, email, onProfileUpdated }: ProfileFormProps) {
  const t = useTranslations('Profile')
  const router = useRouter()
  const [step, setStep] = useState(1)
  const parsedCidade = parseCidadeEstado(profile?.cidade_estado ?? '')
  const [formData, setFormData] = useState({
    nome: profile?.nome ?? '',
    bio: profile?.bio ?? '',
    telefone: formatPhoneBR(profile?.telefone ?? ''),
    cidade: parsedCidade.cidade,
    estado: parsedCidade.estado,
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
  const [cidadesDoEstado, setCidadesDoEstado] = useState<string[]>([])
  const [cidadesLoading, setCidadesLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const step4Ref = useRef<HTMLDivElement | null>(null)
  const supabase = getSupabaseClient()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)

  const isEmpreendedor = formData.posicao_mercado === 'empreendedor'
  const isLider = formData.posicao_mercado === 'lider'
  const isEditMode = profile?.is_complete === true
  const [expandedEditSection, setExpandedEditSection] = useState<number>(1)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
    }
  }, [localPreviewUrl])

  useEffect(() => {
    if (isEditMode) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (step === 4) {
      step4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [step, isEditMode])

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

  // Carrega cidades do estado selecionado (API IBGE)
  useEffect(() => {
    if (!formData.estado) {
      setCidadesDoEstado([])
      return
    }
    let cancelled = false
    setCidadesLoading(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios`)
      .then((res) => res.json())
      .then((data: { nome: string }[]) => {
        if (cancelled) return
        const nomes = (data ?? []).map((m) => m.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'))
        setCidadesDoEstado(nomes)
      })
      .catch(() => {
        if (!cancelled) setCidadesDoEstado([])
      })
      .finally(() => {
        if (!cancelled) setCidadesLoading(false)
      })
    return () => { cancelled = true }
  }, [formData.estado])

  const cidadesOptions = useMemo(() => {
    if (!formData.cidade || cidadesDoEstado.includes(formData.cidade)) return cidadesDoEstado
    return [formData.cidade, ...cidadesDoEstado]
  }, [cidadesDoEstado, formData.cidade])

  const updateField = (key: keyof typeof formData, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const phoneDigits = getPhoneDigits(formData.telefone)

  const canProceedStep1 =
    formData.nome.trim() &&
    phoneDigits.length >= 10 &&
    formData.cidade.trim() &&
    formData.estado.trim()

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
        setFeedback({ type: 'error', message: t('sessionExpired') })
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
          setFeedback({ type: 'error', message: t('uploadError') })
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
        cidade_estado:
          formData.cidade && formData.estado
            ? `${formData.cidade.trim()} / ${formData.estado.trim()}`
            : formData.cidade.trim() || null,
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
        setFeedback({ type: 'error', message: error.message || t('saveError') })
        return
      }

      setFeedback({ type: 'success', message: t('saveSuccess') })
      onProfileUpdated?.({
        ...profile!,
        ...payload,
      } as ProfileRecord)

      window.dispatchEvent(new CustomEvent('profile-completed'))
      if (!isEditMode) setSavedSuccess(true)
    })
  }

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_AVATAR_SIZE) {
      setFeedback({ type: 'error', message: t('fileTooBig') })
      event.target.value = ''
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setFeedback({ type: 'error', message: t('useJpegPng') })
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
          <h3 className="mb-2 text-lg font-bold text-emerald-200">{t('completedTitle')}</h3>
          <p className="mb-6 text-sm text-slate-300">
            {t('completedMessage')}
          </p>
          <button
            type="button"
            onClick={() => router.replace('/inicio')}
            className="w-full rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
          >
            {t('goToHome')}
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
      <div className="rounded-xl border border-slate-600/30 bg-[var(--brand-surface)]/80 shadow-xl overflow-hidden">
        <div className="border-b border-white/10 bg-[var(--brand-surface-alt)]/50 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {isEditMode ? t('editProfile') : t('signupTitle')}
            </h2>
            {!isEditMode && (
              <span className="text-sm text-[var(--brand-text-muted)]">
                {t('stepOf', { step: String(step), total: String(TOTAL_STEPS) })}
              </span>
            )}
          </div>
          {!isEditMode && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {/* Etapa 1: Básico */}
          {(step === 1 || isEditMode) && (
            <div className={isEditMode ? 'rounded-xl border border-slate-600/30 bg-[var(--brand-surface-alt)]/30 overflow-hidden' : ''}>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setExpandedEditSection((s) => (s === 1 ? 0 : 1))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/5 transition"
                >
                  {t('sectionBasic')}
                  {expandedEditSection === 1 ? <ChevronDown className="h-4 w-4 text-[var(--brand-text-muted)]" /> : <ChevronRight className="h-4 w-4 text-[var(--brand-text-muted)]" />}
                </button>
              )}
              {(!isEditMode || expandedEditSection === 1) && (
            <div className={`space-y-4 ${isEditMode ? 'border-t border-slate-600/30 px-4 pb-4 pt-3' : ''}`}>
              {!isEditMode && <h3 className="text-sm font-semibold text-slate-300">{t('sectionBasic')}</h3>}
              <div className="flex justify-center pb-2">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-600/40 bg-[var(--brand-surface-alt)]"
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
                <span className="text-sm font-medium text-white">{t('fullName')}</span>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  className={inputClass}
                  required
                />
              </label>
              {email && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-white">{t('email')}</span>
                  <input type="email" value={email} className={inputClass} readOnly disabled />
                </label>
              )}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white">{t('whatsapp')}</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={formData.telefone}
                  onChange={(e) => updateField('telefone', formatPhoneBR(e.target.value))}
                  placeholder={t('phonePlaceholder')}
                  className={inputClass}
                  maxLength={16}
                  required
                />
                {phoneDigits.length > 0 && phoneDigits.length < 10 && (
                  <span className="text-xs text-amber-400">{t('phoneHint')}</span>
                )}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white">{t('location')}</span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.2fr]">
                  <SearchableSelect
                    value={formData.estado}
                    onChange={(uf) => setFormData((prev) => ({ ...prev, estado: uf, cidade: '' }))}
                    options={ESTADOS_BR.map((uf) => ({ value: uf.value, label: `${uf.label} (${uf.value})` }))}
                    placeholder={t('statePlaceholder')}
                    searchPlaceholder={t('searchState')}
                    emptyText={t('stateNotFound')}
                  />
                  <SearchableSelect
                    value={formData.cidade}
                    onChange={(v) => updateField('cidade', v)}
                    options={cidadesOptions.map((nome) => ({ value: nome, label: nome }))}
                    placeholder={!formData.estado ? t('selectStateFirst') : t('searchCity')}
                    searchPlaceholder={t('searchCity')}
                    emptyText={t('cityNotFound')}
                    disabled={!formData.estado}
                    loading={cidadesLoading}
                    loadingText={t('loadingCities')}
                  />
                </div>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--brand-text-muted)]">{t('instagramOptional')}</span>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder={t('instagramPlaceholder')}
                  className={inputClass}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--brand-text-muted)]">{t('linkedinOptional')}</span>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder={t('linkedinPlaceholder')}
                  className={inputClass}
                />
              </label>
            </div>
              )}
            </div>
          )}

          {/* Etapa 2: Perfil (segmentação) */}
          {(step === 2 || isEditMode) && (
            <div className={isEditMode ? 'rounded-xl border border-slate-600/30 bg-[var(--brand-surface-alt)]/30 overflow-hidden mt-3' : `space-y-4 ${isEditMode ? 'border-t border-slate-600/30 pt-6 mt-6' : ''}`}>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setExpandedEditSection((s) => (s === 2 ? 0 : 2))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/5 transition"
                >
                  {t('sectionProfile')}
                  {expandedEditSection === 2 ? <ChevronDown className="h-4 w-4 text-[var(--brand-text-muted)]" /> : <ChevronRight className="h-4 w-4 text-[var(--brand-text-muted)]" />}
                </button>
              )}
              {(!isEditMode || expandedEditSection === 2) && (
            <div className={`space-y-4 ${isEditMode ? 'border-t border-slate-600/30 px-4 pb-4 pt-3' : ''}`}>
              {!isEditMode && <h3 className="text-sm font-semibold text-slate-300">{t('sectionProfile')}</h3>}
              <div>
                <span className="block text-sm font-medium text-white mb-3">{t('positionQuestion')}</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('posicao_mercado', 'empreendedor')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      isEmpreendedor
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                        : 'border-slate-600/40 bg-[var(--brand-surface-alt)]/50 text-[var(--brand-text-muted)] hover:border-slate-500'
                    }`}
                  >
                    {t('entrepreneur')}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('posicao_mercado', 'lider')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      isLider
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                        : 'border-slate-600/40 bg-[var(--brand-surface-alt)]/50 text-[var(--brand-text-muted)] hover:border-slate-500'
                    }`}
                  >
                    {t('leader')}
                  </button>
                </div>
              </div>

              {isEmpreendedor && (
                <div className="mt-4 space-y-4 border-t border-slate-600/30 pt-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white">{t('companyName')}</span>
                    <input
                      type="text"
                      value={formData.empresa_projeto}
                      onChange={(e) => updateField('empresa_projeto', e.target.value)}
                      placeholder={t('companyPlaceholder')}
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-[var(--brand-text-muted)]">{t('siteOptional')}</span>
                    <input
                      type="url"
                      value={formData.site}
                      onChange={(e) => updateField('site', e.target.value)}
                      placeholder={t('urlPlaceholder')}
                      className={inputClass}
                    />
                  </label>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">{t('segmentLabel')}</span>
                    <SelectField
                      label={t('segmentLabel')}
                      value={formData.segmento_negocio}
                      onChange={(v) => updateField('segmento_negocio', v)}
                      options={SEGMENTO_NEGOCIO.map((s) => ({ value: s, label: t(`options.segmento.${s}`) }))}
                      placeholder={t('selectPlaceholder')}
                      closeLabel={t('close')}
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">{t('audienceLabel')}</span>
                    <SelectField
                      label={t('audienceLabel')}
                      value={formData.publico_atende}
                      onChange={(v) => updateField('publico_atende', v)}
                      options={PUBLICO_ATENDE.map((o) => ({ value: o.value, label: t(`options.publico.${o.value}`) }))}
                      placeholder={t('selectPlaceholder')}
                      closeLabel={t('close')}
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">{t('revenueLabel')}</span>
                    <SelectField
                      label={t('revenueLabel')}
                      value={formData.faixa_faturamento}
                      onChange={(v) => updateField('faixa_faturamento', v)}
                      options={FAIXA_FATURAMENTO.map((f) => ({ value: f, label: t(`options.faixa.${f}`) }))}
                      placeholder={t('selectPlaceholder')}
                      closeLabel={t('close')}
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">{t('ticketLabel')}</span>
                    <SelectField
                      label={t('ticketLabel')}
                      value={formData.ticket_medio}
                      onChange={(v) => updateField('ticket_medio', v)}
                      options={TICKET_MEDIO.map((o) => ({ value: o.value, label: t(`options.ticket.${o.value}`) }))}
                      placeholder={t('selectPlaceholder')}
                      closeLabel={t('close')}
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">{t('collaboratorsLabel')}</span>
                    <SelectField
                      label={t('collaboratorsLabel')}
                      value={formData.num_colaboradores}
                      onChange={(v) => updateField('num_colaboradores', v)}
                      options={NUM_COLABORADORES.map((o) => ({ value: o.value, label: t(`options.numColab.${o.value}`) }))}
                      placeholder={t('selectPlaceholder')}
                      closeLabel={t('close')}
                    />
                  </div>
                </div>
              )}

              {isLider && (
                <div className="mt-4 space-y-4 border-t border-slate-600/30 pt-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white">{t('currentRole')}</span>
                    <input
                      type="text"
                      value={formData.cargo_atual}
                      onChange={(e) => updateField('cargo_atual', e.target.value)}
                      placeholder={t('rolePlaceholder')}
                      className={inputClass}
                    />
                  </label>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">{t('areaLabel')}</span>
                    <SelectField
                      label={t('areaLabel')}
                      value={formData.area_gestao}
                      onChange={(v) => updateField('area_gestao', v)}
                      options={AREA_GESTAO.map((a) => ({ value: a, label: t(`options.area.${a}`) }))}
                      placeholder={t('selectPlaceholder')}
                      closeLabel={t('close')}
                    />
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white">{t('companyWhereWork')}</span>
                    <input
                      type="text"
                      value={formData.empresa_atual}
                      onChange={(e) => updateField('empresa_atual', e.target.value)}
                      placeholder={t('companyNamePlaceholder')}
                      className={inputClass}
                    />
                  </label>
                  <div>
                    <span className="block text-sm font-medium text-white mb-2">{t('companySizeLabel')}</span>
                    <SelectField
                      label={t('companySizeLabel')}
                      value={formData.tamanho_empresa}
                      onChange={(v) => updateField('tamanho_empresa', v)}
                      options={TAMANHO_EMPRESA.map((o) => ({ value: o.value, label: t(`options.tamanho.${o.value}`) }))}
                      placeholder={t('selectPlaceholder')}
                      closeLabel={t('close')}
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-3">{t('leadTeamQuestion')}</span>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => updateField('lidera_time', true)}
                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          formData.lidera_time === true
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                            : 'border-slate-600/40 bg-[var(--brand-surface-alt)]/50 text-[var(--brand-text-muted)] hover:border-slate-500'
                        }`}
                      >
                        {t('yes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('lidera_time', false)}
                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          formData.lidera_time === false
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                            : 'border-slate-600/40 bg-[var(--brand-surface-alt)]/50 text-[var(--brand-text-muted)] hover:border-slate-500'
                        }`}
                      >
                        {t('no')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white mb-3">{t('challengesLabel')}</span>
                    <div className="flex flex-wrap gap-2">
                      {DESAFIOS_DETALHADOS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDesafiosDetalhados((prev) => toggleMultiSelect(prev, d, 2))}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                            desafiosDetalhados.includes(d)
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                              : 'border-slate-600/40 bg-[var(--brand-surface-alt)]/50 text-[var(--brand-text-muted)] hover:border-slate-500'
                          }`}
                        >
                          {t(`options.desafios.${d}`)}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{t('selectUpTo2')}</p>
                  </div>
                </div>
              )}
            </div>
              )}
            </div>
          )}

          {/* Etapa 3: Intenção */}
          {(step === 3 || isEditMode) && (
            <div className={isEditMode ? 'rounded-xl border border-slate-600/30 bg-[var(--brand-surface-alt)]/30 overflow-hidden mt-3' : ''}>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setExpandedEditSection((s) => (s === 3 ? 0 : 3))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/5 transition"
                >
                  {t('sectionIntention')}
                  {expandedEditSection === 3 ? <ChevronDown className="h-4 w-4 text-[var(--brand-text-muted)]" /> : <ChevronRight className="h-4 w-4 text-[var(--brand-text-muted)]" />}
                </button>
              )}
              {(!isEditMode || expandedEditSection === 3) && (
            <div className={`space-y-4 ${isEditMode ? 'border-t border-slate-600/30 px-4 pb-4 pt-3' : ''}`}>
              {!isEditMode && <h3 className="text-sm font-semibold text-slate-300">{t('sectionIntention')}</h3>}
              <div>
                <span className="block text-sm font-medium text-white mb-3">{t('whatYouSeekLabel')}</span>
                <div className="flex flex-wrap gap-2">
                  {BUSCA_MAXISTALKS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBuscaMaxistalks((prev) => toggleMultiSelect(prev, b, 2))}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        buscaMaxistalks.includes(b)
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                          : 'border-slate-600/40 bg-[var(--brand-surface-alt)]/50 text-[var(--brand-text-muted)] hover:border-slate-500'
                      }`}
                    >
                      {t(`options.busca.${b}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-white mb-3">{t('whatYouWantToLearnLabel')}</span>
                <div className="flex flex-wrap gap-2">
                  {O_QUE_QUER_APRENDER.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOQueQuerAprender((prev) => toggleMultiSelect(prev, o, 3))}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        oQueQuerAprender.includes(o)
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                          : 'border-slate-600/40 bg-[var(--brand-surface-alt)]/50 text-[var(--brand-text-muted)] hover:border-slate-500'
                      }`}
                    >
                      {t(`options.aprender.${o}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-white mb-3">{t('mainDifficultyLabel')}</span>
                <div className="flex flex-wrap gap-2">
                  {MAIOR_DIFICULDADE.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateField('maior_dificuldade', m)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        formData.maior_dificuldade === m
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                          : 'border-slate-600/40 bg-[var(--brand-surface-alt)]/50 text-[var(--brand-text-muted)] hover:border-slate-500'
                      }`}
                    >
                      {t(`options.dificuldade.${m}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
              )}
            </div>
          )}

          {/* Etapa 4: Finalização */}
          {(step === 4 || isEditMode) && (
            <div className={isEditMode ? 'rounded-xl border border-slate-600/30 bg-[var(--brand-surface-alt)]/30 overflow-hidden mt-3' : ''}>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setExpandedEditSection((s) => (s === 4 ? 0 : 4))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/5 transition"
                >
                  {t('sectionFinal')}
                  {expandedEditSection === 4 ? <ChevronDown className="h-4 w-4 text-[var(--brand-text-muted)]" /> : <ChevronRight className="h-4 w-4 text-[var(--brand-text-muted)]" />}
                </button>
              )}
              {(!isEditMode || expandedEditSection === 4) && (
            <div ref={!isEditMode ? step4Ref : undefined} className={`space-y-4 ${isEditMode ? 'border-t border-slate-600/30 px-4 pb-4 pt-3' : ''}`}>
              {!isEditMode && <h3 className="text-sm font-semibold text-slate-300">{t('sectionFinal')}</h3>}
              <label className="flex items-start gap-3 rounded-xl border border-slate-600/40 bg-[var(--brand-surface-alt)]/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.ciente_evento_online}
                  onChange={(e) => updateField('ciente_evento_online', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm text-white">
                  {t('eventAwareLabel')}
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-slate-600/40 bg-[var(--brand-surface-alt)]/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.aceite_lgpd}
                  onChange={(e) => updateField('aceite_lgpd', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm text-white">
                  {t('consentPrefix')}<Link href="/politica-de-privacidade" className="text-[var(--brand-primary)] underline hover:no-underline">{t('consentPrivacyLink')}</Link>{t('consentMiddle')}<Link href="/termos-de-uso" className="text-[var(--brand-primary)] underline hover:no-underline">{t('consentTermsLink')}</Link>{t('consentSuffix')}
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-slate-600/40 bg-[var(--brand-surface-alt)]/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.recebe_beneficios}
                  onChange={(e) => updateField('recebe_beneficios', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm text-[var(--brand-text-muted)]">
                  {t('receiveCommsLabel')}
                </span>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--brand-text-muted)]">{t('bioOptional')}</span>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={3}
                  placeholder={t('bioPlaceholder')}
                  className={inputClass}
                />
              </label>
            </div>
              )}
            </div>
          )}

          {/* Navegação */}
          <div className="mt-6 flex gap-3">
            {isEditMode ? (
              <button
                type="button"
                disabled={isPending || !canProceedStep4}
                onClick={(e) => {
                  e.preventDefault()
                  handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
                }}
                className="w-full rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? t('saving') : t('save')}
              </button>
            ) : (
              <>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="flex-1 rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    {t('back')}
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
                    className="flex-1 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('next')}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isPending || !canProceedStep4}
                    onClick={(e) => {
                      e.preventDefault()
                      handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
                    }}
                    className="flex-1 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? t('saving') : t('finishSignup')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {feedbackNode}
    </form>
  )
}
