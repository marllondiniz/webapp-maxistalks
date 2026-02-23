'use client'

import { useEffect, useRef, useState } from 'react'
import { Save, Loader2, CheckCircle, AlertCircle, Globe, MapPin, Info, Layout, Upload, X } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'

const TENANT_BUCKET = 'event-banners'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

type TenantData = {
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
  footer_logo_url: string
  instagram_url: string
  youtube_url: string
  footer_copyright_name: string
}

const EMPTY: TenantData = {
  name: '', tagline: '', logo_url: '', favicon_url: '', og_image_url: '',
  primary_color: '', primary_color_hover: '', support_email: '',
  address_line1: '', address_line2: '', address_cep: '', local_subheading: '',
  map_embed_url: '', map_link_url: '',
  about_logo_url: '', about_short_text: '', about_long_text: '',
  about_button_label: '', about_button_url: '',
  footer_logo_url: '', instagram_url: '', youtube_url: '', footer_copyright_name: '',
}

function normalize(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

// ── Color Picker ────────────────────────────────────────────────────────────
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
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5">
        <div className="relative flex-shrink-0">
          <input
            type="color"
            value={colorValue}
            onChange={(e) => onChange(name, e.target.value.replace('#', ''))}
            className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0.5 outline-none"
            style={{ WebkitAppearance: 'none' }}
          />
        </div>
        <input
          type="text"
          value={hex}
          onChange={(e) => onChange(name, e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6))}
          placeholder="3b82f6"
          maxLength={6}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-mono"
        />
        {hex && (
          <div
            className="h-5 w-5 flex-shrink-0 rounded-md border border-white/20"
            style={{ backgroundColor: colorValue }}
          />
        )}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

// ── Image Upload ─────────────────────────────────────────────────────────────
function ImageUploadField({
  label, name, value, onChange, hint,
}: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setUploadError(null)
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/x-icon'].includes(file.type)) {
      setUploadError('Formato inválido. Use PNG, JPG, WEBP, SVG ou ICO.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Arquivo muito grande. Máximo 2MB.')
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
        setUploadError('Erro ao enviar imagem: ' + uploadErr.message)
        return
      }
      const { data: publicData } = supabase.storage.from(TENANT_BUCKET).getPublicUrl(filePath)
      onChange(name, publicData.publicUrl)
    } catch {
      setUploadError('Erro inesperado ao enviar imagem.')
    } finally {
      setUploading(false)
    }
  }

  const isUrl = value.startsWith('http')
  const isPath = value.startsWith('/')

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>

      {/* Preview */}
      {value && (
        <div className="relative flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
          {(isUrl || isPath) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="h-10 w-auto max-w-[80px] rounded-md object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <span className="flex-1 truncate text-xs text-slate-400">{value}</span>
          <button
            type="button"
            onClick={() => onChange(name, '')}
            className="flex-shrink-0 rounded-lg p-1 text-slate-500 hover:bg-white/5 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-600 bg-slate-900/40 px-4 py-3 text-sm text-slate-400 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
        ) : (
          <><Upload className="h-4 w-4" /> {value ? 'Trocar imagem' : 'Fazer upload'}</>
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
      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
      {hint && !uploadError && <p className="text-xs text-slate-500">{hint}</p>}
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
    'w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
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
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#1e293b]/50 p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
          <Icon className="h-5 w-5 text-[var(--brand-primary)]" />
        </div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  )
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function CustomizacaoPanel() {
  const [form, setForm] = useState<TenantData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
          setFeedback({ type: 'error', text: json?.error || 'Erro ao carregar configurações.' })
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
            footer_logo_url: normalize(tenant.footer_logo_url),
            instagram_url: normalize(tenant.instagram_url),
            youtube_url: normalize(tenant.youtube_url),
            footer_copyright_name: normalize(tenant.footer_copyright_name),
          })
        }
      } catch {
        setFeedback({ type: 'error', text: 'Erro ao carregar configurações.' })
      } finally {
        setLoading(false)
      }
    }
    load()
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

      // Garante que as cores vão sem #
      const payload = {
        ...form,
        primary_color: form.primary_color.replace(/^#/, ''),
        primary_color_hover: form.primary_color_hover.replace(/^#/, ''),
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
        setFeedback({ type: 'error', text: json.error || 'Erro ao salvar.' })
      } else {
        setFeedback({ type: 'success', text: 'Configurações salvas com sucesso!' })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch {
      setFeedback({ type: 'error', text: 'Erro de rede ao salvar.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando configurações...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Customização da Página</h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure a identidade visual e as informações da página principal desta empresa.
        </p>
      </div>

      {feedback && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Marca */}
        <Section icon={Globe} title="Marca">
          <Field label="Nome da marca" name="name" value={form.name} onChange={handleChange} placeholder="Minha Empresa" />
          <Field label="Tagline / Slogan" name="tagline" value={form.tagline} onChange={handleChange} placeholder="Palco para quem gera valor" />
          <ImageUploadField label="Logo principal" name="logo_url" value={form.logo_url} onChange={handleChange} hint="PNG, JPG ou WEBP — máx. 2MB" />
          <ImageUploadField label="Favicon" name="favicon_url" value={form.favicon_url} onChange={handleChange} hint="ICO, PNG ou SVG — máx. 2MB" />
          <div className="sm:col-span-2">
            <Field label="Imagem Open Graph (redes sociais)" name="og_image_url" value={form.og_image_url} onChange={handleChange} placeholder="/og.png ou https://..." hint="URL ou path em public/" />
          </div>
          <Field label="E-mail de suporte" name="support_email" value={form.support_email} onChange={handleChange} placeholder="contato@minhaempresa.com" />
          <ColorField label="Cor primária" name="primary_color" value={form.primary_color} onChange={handleChange} hint="Cor dos botões e destaques" />
          <ColorField label="Cor primária hover" name="primary_color_hover" value={form.primary_color_hover} onChange={handleChange} hint="Cor ao passar o mouse" />
        </Section>

        {/* Local / Endereço */}
        <Section icon={MapPin} title="Local do Evento">
          <Field label="Subtítulo da seção" name="local_subheading" value={form.local_subheading} onChange={handleChange} placeholder="Venha nos visitar..." />
          <Field label="Endereço — linha 1" name="address_line1" value={form.address_line1} onChange={handleChange} placeholder="R. Exemplo, 123" />
          <Field label="Endereço — linha 2 (bairro/cidade)" name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Centro – Vitória/ES" />
          <Field label="CEP" name="address_cep" value={form.address_cep} onChange={handleChange} placeholder="CEP: 29000-000" />
          <div className="sm:col-span-2">
            <Field
              label="Link do Google Maps (para o botão)"
              name="map_link_url"
              value={form.map_link_url}
              onChange={handleChange}
              placeholder="https://www.google.com/maps/search/?api=1&query=..."
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="URL do mapa embed (iframe)"
              name="map_embed_url"
              value={form.map_embed_url}
              onChange={handleChange}
              placeholder="https://www.google.com/maps?q=...&output=embed"
              hint="Cole a URL de incorporação do Google Maps"
            />
          </div>
        </Section>

        {/* Seção Sobre */}
        <Section icon={Info} title="Seção Sobre">
          <ImageUploadField label="Logo da seção" name="about_logo_url" value={form.about_logo_url} onChange={handleChange} hint="Logo exibido na seção 'Sobre' — máx. 2MB" />
          <Field label="Label do botão" name="about_button_label" value={form.about_button_label} onChange={handleChange} placeholder="Conhecer a empresa" />
          <div className="sm:col-span-2">
            <Field label="URL do botão" name="about_button_url" value={form.about_button_url} onChange={handleChange} placeholder="https://minhaempresa.com" />
          </div>
          <div className="sm:col-span-2">
            <Field label="Texto curto (1º parágrafo)" name="about_short_text" value={form.about_short_text} onChange={handleChange} textarea placeholder="Apresentação breve da empresa..." />
          </div>
          <div className="sm:col-span-2">
            <Field label="Texto longo (2º parágrafo)" name="about_long_text" value={form.about_long_text} onChange={handleChange} textarea placeholder="Mais detalhes sobre a empresa..." />
          </div>
        </Section>

        {/* Footer */}
        <Section icon={Layout} title="Footer da Página Inicial">
          <ImageUploadField label="Logo do footer" name="footer_logo_url" value={form.footer_logo_url} onChange={handleChange} hint="Se vazio, usa o logo principal — máx. 2MB" />
          <Field label="Nome no copyright" name="footer_copyright_name" value={form.footer_copyright_name} onChange={handleChange} placeholder="Minha Empresa" hint="Ex.: © 2026 Minha Empresa" />
          <Field label="Instagram (URL completa)" name="instagram_url" value={form.instagram_url} onChange={handleChange} placeholder="https://www.instagram.com/minhaempresa" />
          <Field label="YouTube (URL completa)" name="youtube_url" value={form.youtube_url} onChange={handleChange} placeholder="https://www.youtube.com/@minhaempresa" />
        </Section>

        <div className="flex justify-end pb-6">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}
