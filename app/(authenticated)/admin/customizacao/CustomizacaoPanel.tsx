'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Save, Loader2, CheckCircle, AlertCircle, Globe, MapPin, Info,
  Layout, Upload, X, ImageIcon, Paintbrush, Eye, EyeOff,
  ChevronRight, Sparkles, Layers, Type, Link2,
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useTranslations } from 'next-intl'
import LivePreview from './LivePreview'

const TENANT_BUCKET = 'event-banners'
const MAX_FILE_SIZE = 2 * 1024 * 1024

export type TenantData = {
  name: string
  tagline: string
  logo_url: string
  favicon_url: string
  og_image_url: string
  primary_color: string
  primary_color_hover: string
  support_email: string
  address_line1: string
  address_line2: string
  address_cep: string
  local_subheading: string
  map_embed_url: string
  map_link_url: string
  about_logo_url: string
  about_short_text: string
  about_long_text: string
  about_button_label: string
  about_button_url: string
  what_is_heading: string
  what_is_image_url: string
  footer_logo_url: string
  instagram_url: string
  youtube_url: string
  footer_copyright_name: string
  background_color: string
  surface_color: string
  surface_alt_color: string
  text_muted_color: string
  heading_color: string
  body_text_color: string
  link_color: string
  link_hover_color: string
  accent_color: string
  button_text_color: string
}

const EMPTY: TenantData = {
  name: '', tagline: '', logo_url: '', favicon_url: '', og_image_url: '',
  primary_color: '', primary_color_hover: '', support_email: '',
  address_line1: '', address_line2: '', address_cep: '', local_subheading: '',
  map_embed_url: '', map_link_url: '',
  about_logo_url: '', about_short_text: '', about_long_text: '',
  about_button_label: '', about_button_url: '',
  what_is_heading: '', what_is_image_url: '',
  footer_logo_url: '', instagram_url: '', youtube_url: '', footer_copyright_name: '',
  background_color: '', surface_color: '', surface_alt_color: '', text_muted_color: '',
  heading_color: '', body_text_color: '', link_color: '', link_hover_color: '', accent_color: '',
  button_text_color: '',
}

type NavGroup = {
  groupLabel: string
  items: { id: string; icon: React.ElementType; labelKey: string }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: 'navGroupIdentity',
    items: [
      { id: 'brand', icon: Globe, labelKey: 'sectionBrand' },
      { id: 'appearance', icon: Paintbrush, labelKey: 'sectionAppearance' },
    ],
  },
  {
    groupLabel: 'navGroupSections',
    items: [
      { id: 'what-is', icon: ImageIcon, labelKey: 'sectionWhatIs' },
      { id: 'location', icon: MapPin, labelKey: 'sectionLocation' },
      { id: 'about', icon: Info, labelKey: 'sectionAbout' },
      { id: 'footer', icon: Layout, labelKey: 'sectionFooter' },
    ],
  },
]

const ALL_TAB_IDS = NAV_GROUPS.flatMap(g => g.items.map(i => i.id))

function normalize(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

// ── Color Picker ──────────────────────────────────────────────────────────────
function ColorField({
  label, name, value, onChange, hint,
}: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  hint?: string
}) {
  const hex = value.replace(/^#/, '')
  const colorValue = hex ? `#${hex}` : '#3b82f6'

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        className="relative mt-0.5 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-white/[0.12] shadow-lg transition hover:border-white/25"
        style={{ backgroundColor: colorValue, boxShadow: `0 2px 16px ${colorValue}40` }}
        onClick={() => {
          const inp = document.getElementById(`color-native-${name}`) as HTMLInputElement | null
          inp?.click()
        }}
      >
        <input
          id={`color-native-${name}`}
          type="color"
          value={colorValue}
          onChange={(e) => onChange(name, e.target.value.replace('#', ''))}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </button>
      <div className="min-w-0 flex-1">
        <label className="mb-1 block text-[11px] font-semibold text-slate-300">{label}</label>
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-black/20 px-2 py-1.5">
          <span className="text-[10px] text-slate-600">#</span>
          <input
            type="text"
            value={hex}
            onChange={(e) => onChange(name, e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6))}
            placeholder="3b82f6"
            maxLength={6}
            className="w-full bg-transparent font-mono text-[11px] font-medium text-white placeholder-slate-700 outline-none"
          />
        </div>
        {hint && <p className="mt-1 text-[10px] leading-snug text-slate-600">{hint}</p>}
      </div>
    </div>
  )
}

// ── Image Upload ──────────────────────────────────────────────────────────────
function ImageUploadField({
  label, name, value, onChange, hint,
}: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  hint?: string
}) {
  const t = useTranslations('AdminCustomizacao')
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setUploadError(null)
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/x-icon'].includes(file.type)) {
      setUploadError(t('uploadErrorFormat'))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(t('uploadErrorSize'))
      return
    }
    setUploading(true)
    try {
      const supabase = getSupabaseClient()
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
      const filePath = `tenant-logos/${Date.now()}-${name}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from(TENANT_BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: true })
      if (uploadErr) {
        setUploadError(t('uploadErrorSend') + uploadErr.message)
        return
      }
      const { data: publicData } = supabase.storage.from(TENANT_BUCKET).getPublicUrl(filePath)
      onChange(name, publicData.publicUrl)
    } catch {
      setUploadError(t('uploadErrorUnexpected'))
    } finally {
      setUploading(false)
    }
  }

  const isUrl = value.startsWith('http')
  const isPath = value.startsWith('/')

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {value && (
        <div className="relative flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5">
          {(isUrl || isPath) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="h-9 w-auto max-w-[70px] rounded object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <span className="flex-1 truncate text-[10px] text-slate-500">{value}</span>
          <button
            type="button"
            onClick={() => onChange(name, '')}
            className="flex-shrink-0 rounded p-1 text-slate-500 hover:bg-white/5 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2.5 text-xs text-slate-400 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('uploading')}</>
        ) : (
          <><Upload className="h-3.5 w-3.5" /> {value ? t('changeImage') : t('uploadImage')}</>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/x-icon"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
      {uploadError && <p className="text-[10px] text-red-400">{uploadError}</p>}
      {hint && !uploadError && <p className="text-[10px] leading-tight text-slate-600">{hint}</p>}
    </div>
  )
}

// ── Text Field ────────────────────────────────────────────────────────────────
function Field({
  label, name, value, onChange, placeholder, hint, textarea,
}: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  placeholder?: string
  hint?: string
  textarea?: boolean
}) {
  const base =
    'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/30'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
      {hint && <p className="text-[10px] leading-tight text-slate-600">{hint}</p>}
    </div>
  )
}

// ── Subsection card ───────────────────────────────────────────────────────────
function SubSection({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--brand-primary)]/8">
            <Icon className="h-3 w-3 text-[var(--brand-primary)]" />
          </div>
        )}
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{title}</h4>
      </div>
      {children}
    </div>
  )
}

// ── Tab Content Sections ──────────────────────────────────────────────────────
function BrandSection({ form, onChange, t }: { form: TenantData; onChange: (n: string, v: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('fieldBrandName')} name="name" value={form.name} onChange={onChange} placeholder="Minha Empresa" />
        <Field label={t('fieldTagline')} name="tagline" value={form.tagline} onChange={onChange} placeholder="Palco para quem gera valor" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploadField label={t('fieldLogo')} name="logo_url" value={form.logo_url} onChange={onChange} hint={t('hintLogoMain')} />
        <ImageUploadField label={t('fieldFavicon')} name="favicon_url" value={form.favicon_url} onChange={onChange} hint={t('hintFavicon')} />
      </div>
      <Field label={t('fieldOgImage')} name="og_image_url" value={form.og_image_url} onChange={onChange} placeholder="/og.png ou https://..." hint={t('hintOgImage')} />
      <Field label={t('fieldSupportEmail')} name="support_email" value={form.support_email} onChange={onChange} placeholder="contato@minhaempresa.com" />
    </div>
  )
}

function AppearanceSection({ form, onChange, t }: { form: TenantData; onChange: (n: string, v: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-5">
      <SubSection title={t('sectionBackgrounds')} icon={Layers}>
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField label={t('fieldBackgroundColor')} name="background_color" value={form.background_color} onChange={onChange} hint={t('hintBackgroundColor')} />
          <ColorField label={t('fieldSurfaceColor')} name="surface_color" value={form.surface_color} onChange={onChange} hint={t('hintSurfaceColor')} />
          <ColorField label={t('fieldSurfaceAltColor')} name="surface_alt_color" value={form.surface_alt_color} onChange={onChange} hint={t('hintSurfaceAltColor')} />
        </div>
      </SubSection>

      <SubSection title={t('colorGroupButtons')} icon={Sparkles}>
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField label={t('fieldPrimaryColor')} name="primary_color" value={form.primary_color} onChange={onChange} hint={t('hintPrimaryColor')} />
          <ColorField label={t('fieldPrimaryColorHover')} name="primary_color_hover" value={form.primary_color_hover} onChange={onChange} hint={t('hintPrimaryColorHover')} />
          <ColorField label={t('fieldAccentColor')} name="accent_color" value={form.accent_color} onChange={onChange} hint={t('hintAccentColor')} />
        </div>
      </SubSection>

      <SubSection title={t('sectionTypography')} icon={Type}>
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField label={t('fieldHeadingColor')} name="heading_color" value={form.heading_color} onChange={onChange} hint={t('hintHeadingColor')} />
          <ColorField label={t('fieldBodyTextColor')} name="body_text_color" value={form.body_text_color} onChange={onChange} hint={t('hintBodyTextColor')} />
          <ColorField label={t('fieldTextMutedColor')} name="text_muted_color" value={form.text_muted_color} onChange={onChange} hint={t('hintTextMutedColor')} />
          <ColorField label={t('fieldButtonTextColor')} name="button_text_color" value={form.button_text_color} onChange={onChange} hint={t('hintButtonTextColor')} />
        </div>
      </SubSection>

      <SubSection title={t('colorGroupLinks')} icon={Link2}>
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField label={t('fieldLinkColor')} name="link_color" value={form.link_color} onChange={onChange} hint={t('hintLinkColor')} />
          <ColorField label={t('fieldLinkHoverColor')} name="link_hover_color" value={form.link_hover_color} onChange={onChange} hint={t('hintLinkHoverColor')} />
        </div>
      </SubSection>
    </div>
  )
}

function WhatIsSection({ form, onChange, t }: { form: TenantData; onChange: (n: string, v: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Field label={t('fieldWhatIsHeading')} name="what_is_heading" value={form.what_is_heading} onChange={onChange} placeholder="O que é o (Nome do evento)?" hint={t('hintWhatIsHeading')} />
      <ImageUploadField label={t('fieldWhatIsImage')} name="what_is_image_url" value={form.what_is_image_url} onChange={onChange} hint={t('hintWhatIsImage')} />
    </div>
  )
}

function LocationSection({ form, onChange, t }: { form: TenantData; onChange: (n: string, v: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Field label={t('fieldLocalSubheading')} name="local_subheading" value={form.local_subheading} onChange={onChange} placeholder="Venha nos visitar..." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('fieldAddress1')} name="address_line1" value={form.address_line1} onChange={onChange} placeholder="R. Exemplo, 123" />
        <Field label={t('fieldAddress2')} name="address_line2" value={form.address_line2} onChange={onChange} placeholder="Centro – Vitória/ES" />
      </div>
      <Field label={t('fieldCep')} name="address_cep" value={form.address_cep} onChange={onChange} placeholder="CEP: 29000-000" />
      <Field label={t('fieldMapLink')} name="map_link_url" value={form.map_link_url} onChange={onChange} placeholder="https://www.google.com/maps/search/?api=1&query=..." />
      <Field label={t('fieldMapEmbed')} name="map_embed_url" value={form.map_embed_url} onChange={onChange} placeholder="https://www.google.com/maps?q=...&output=embed" hint={t('hintMapEmbed')} />
    </div>
  )
}

function AboutSection({ form, onChange, t }: { form: TenantData; onChange: (n: string, v: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploadField label={t('fieldAboutLogo')} name="about_logo_url" value={form.about_logo_url} onChange={onChange} hint={t('hintAboutLogo')} />
        <Field label={t('fieldAboutButtonLabel')} name="about_button_label" value={form.about_button_label} onChange={onChange} placeholder="Conhecer a empresa" />
      </div>
      <Field label={t('fieldAboutButtonUrl')} name="about_button_url" value={form.about_button_url} onChange={onChange} placeholder="https://minhaempresa.com" />
      <Field label={t('fieldAboutShort')} name="about_short_text" value={form.about_short_text} onChange={onChange} textarea placeholder="Apresentação breve da empresa..." />
      <Field label={t('fieldAboutLong')} name="about_long_text" value={form.about_long_text} onChange={onChange} textarea placeholder="Mais detalhes sobre a empresa..." />
    </div>
  )
}

function FooterSection({ form, onChange, t }: { form: TenantData; onChange: (n: string, v: string) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploadField label={t('fieldFooterLogo')} name="footer_logo_url" value={form.footer_logo_url} onChange={onChange} hint={t('hintFooterLogo')} />
        <Field label={t('fieldCopyrightName')} name="footer_copyright_name" value={form.footer_copyright_name} onChange={onChange} placeholder="Minha Empresa" hint={t('hintCopyrightName')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('fieldInstagram')} name="instagram_url" value={form.instagram_url} onChange={onChange} placeholder="https://www.instagram.com/minhaempresa" />
        <Field label={t('fieldYoutube')} name="youtube_url" value={form.youtube_url} onChange={onChange} placeholder="https://www.youtube.com/@minhaempresa" />
      </div>
    </div>
  )
}

const SECTION_COMPONENTS: Record<string, React.FC<{ form: TenantData; onChange: (n: string, v: string) => void; t: (k: string) => string }>> = {
  brand: BrandSection,
  appearance: AppearanceSection,
  'what-is': WhatIsSection,
  location: LocationSection,
  about: AboutSection,
  footer: FooterSection,
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function CustomizacaoPanel() {
  const t = useTranslations('AdminCustomizacao')
  const [form, setForm] = useState<TenantData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('brand')
  const [showPreview, setShowPreview] = useState(true)
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        const res = await fetch('/api/admin/tenant-settings', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const json = await res.json()
        if (!res.ok) {
          setFeedback({ type: 'error', text: json?.error || t('errorLoad') })
          return
        }
        const tenant = json?.tenant
        if (tenant) {
          setForm({
            name: normalize(tenant.name),
            tagline: normalize(tenant.tagline),
            logo_url: normalize(tenant.logo_url),
            favicon_url: normalize(tenant.favicon_url),
            og_image_url: normalize(tenant.og_image_url),
            primary_color: normalize(tenant.primary_color).replace(/^#/, ''),
            primary_color_hover: normalize(tenant.primary_color_hover).replace(/^#/, ''),
            support_email: normalize(tenant.support_email),
            address_line1: normalize(tenant.address_line1),
            address_line2: normalize(tenant.address_line2),
            address_cep: normalize(tenant.address_cep),
            local_subheading: normalize(tenant.local_subheading),
            map_embed_url: normalize(tenant.map_embed_url),
            map_link_url: normalize(tenant.map_link_url),
            about_logo_url: normalize(tenant.about_logo_url),
            about_short_text: normalize(tenant.about_short_text),
            about_long_text: normalize(tenant.about_long_text),
            about_button_label: normalize(tenant.about_button_label),
            about_button_url: normalize(tenant.about_button_url),
            what_is_heading: normalize(tenant.what_is_heading),
            what_is_image_url: normalize(tenant.what_is_image_url),
            footer_logo_url: normalize(tenant.footer_logo_url),
            instagram_url: normalize(tenant.instagram_url),
            youtube_url: normalize(tenant.youtube_url),
            footer_copyright_name: normalize(tenant.footer_copyright_name),
            background_color: normalize(tenant.background_color).replace(/^#/, ''),
            surface_color: normalize(tenant.surface_color).replace(/^#/, ''),
            surface_alt_color: normalize(tenant.surface_alt_color).replace(/^#/, ''),
            text_muted_color: normalize(tenant.text_muted_color).replace(/^#/, ''),
            heading_color: normalize(tenant.heading_color).replace(/^#/, ''),
            body_text_color: normalize(tenant.body_text_color).replace(/^#/, ''),
            link_color: normalize(tenant.link_color).replace(/^#/, ''),
            link_hover_color: normalize(tenant.link_hover_color).replace(/^#/, ''),
            accent_color: normalize(tenant.accent_color).replace(/^#/, ''),
            button_text_color: normalize(tenant.button_text_color).replace(/^#/, ''),
          })
        }
      } catch {
        setFeedback({ type: 'error', text: t('errorLoad') })
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setFeedback(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const colorFields = [
        'primary_color', 'primary_color_hover', 'background_color', 'surface_color',
        'surface_alt_color', 'text_muted_color', 'heading_color', 'body_text_color',
        'link_color', 'link_hover_color', 'accent_color', 'button_text_color',
      ] as const
      const payload = { ...form }
      for (const f of colorFields) {
        payload[f] = form[f].replace(/^#/, '')
      }
      const res = await fetch('/api/admin/tenant-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setFeedback({ type: 'error', text: json.error || t('errorSave') })
      } else {
        setFeedback({ type: 'success', text: t('successSave') })
        if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current)
        feedbackTimeout.current = setTimeout(() => setFeedback(null), 4000)
      }
    } catch {
      setFeedback({ type: 'error', text: t('errorNetwork') })
    } finally {
      setSaving(false)
    }
  }

  const handleSectionClick = useCallback((sectionId: string) => {
    const map: Record<string, string> = {
      'section-brand': 'brand',
      'section-theme': 'appearance',
      'section-what-is': 'what-is',
      'section-location': 'location',
      'section-about': 'about',
      'section-footer': 'footer',
    }
    const tab = map[sectionId]
    if (tab) setActiveTab(tab)
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t('loading')}
      </div>
    )
  }

  const ActiveSection = SECTION_COMPONENTS[activeTab]
  const activeTabItem = ALL_TAB_IDS.includes(activeTab)
    ? NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)
    : undefined

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* ─── Sidebar nav ─── */}
      <div className="flex shrink-0 flex-col gap-3 lg:sticky lg:top-4 lg:w-52">
        {/* Mobile: horizontal tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide lg:hidden">
          {NAV_GROUPS.flatMap(g => g.items).map((item) => {
            const Icon = item.icon
            const isActive = item.id === activeTab
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? 'bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]'
                    : 'text-slate-500 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(item.labelKey)}
              </button>
            )
          })}
        </div>

        {/* Desktop: vertical sidebar */}
        <nav className="hidden flex-col gap-4 lg:flex">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupLabel}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {t(group.groupLabel)}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.id === activeTab
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition ${
                        isActive
                          ? 'bg-[var(--brand-primary)]/12 text-[var(--brand-primary)]'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{t(item.labelKey)}</span>
                      <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Preview toggle (mobile) */}
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition xl:hidden ${
            showPreview ? 'bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]' : 'text-slate-500 hover:text-white'
          }`}
        >
          {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPreview ? t('previewHide') : t('previewShow')}
        </button>
      </div>

      {/* ─── Center: Form ─── */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* Feedback */}
        {feedback && (
          <div
            className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-medium ${
              feedback.type === 'success'
                ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
            {feedback.text}
          </div>
        )}

        {/* Mobile preview */}
        {showPreview && (
          <div className="xl:hidden">
            <LivePreview form={form} onSectionClick={handleSectionClick} />
          </div>
        )}

        {/* Section card */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          {activeTabItem && (
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10">
                <activeTabItem.icon className="h-4 w-4 text-[var(--brand-primary)]" />
              </div>
              <h2 className="text-sm font-semibold text-white">{t(activeTabItem.labelKey)}</h2>
            </div>
          )}
          <ActiveSection form={form} onChange={handleChange} t={t} />
        </div>

        {/* Save bar */}
        <div className="sticky bottom-0 z-10 rounded-xl border border-white/[0.06] bg-[var(--brand-surface)]/95 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <p className="hidden text-[11px] text-slate-500 sm:block">
              {t('panelSubtitle')}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="btn-brand-text flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-5 py-2 text-xs font-bold shadow-lg shadow-[var(--brand-primary)]/20 transition hover:bg-[var(--brand-primary-hover)] hover:shadow-[var(--brand-primary)]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? t('saving') : t('saveBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Right: Preview sticky (xl+) ─── */}
      <div className="hidden w-full max-w-[480px] shrink-0 xl:sticky xl:top-4 xl:block">
        <LivePreview form={form} onSectionClick={handleSectionClick} />
      </div>
    </form>
  )
}
