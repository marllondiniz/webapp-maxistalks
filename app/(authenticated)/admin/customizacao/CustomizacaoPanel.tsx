'use client'

import { useEffect, useRef, useState } from 'react'
import { Save, Loader2, CheckCircle, AlertCircle, Globe, MapPin, Info, Layout, Upload, X, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useTranslations } from 'next-intl'

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
  what_is_heading: string
  what_is_image_url: string
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
  what_is_heading: '', what_is_image_url: '',
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
          <><Loader2 className="h-4 w-4 animate-spin" /> {t('uploading')}</>
        ) : (
          <><Upload className="h-4 w-4" /> {value ? t('changeImage') : t('uploadImage')}</>
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
  const t = useTranslations('AdminCustomizacao')
  const [form, setForm] = useState<TenantData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(true)

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
          })
        }
      } catch {
        setFeedback({ type: 'error', text: t('errorLoad') })
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
        setFeedback({ type: 'error', text: json.error || t('errorSave') })
      } else {
        setFeedback({ type: 'success', text: t('successSave') })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch {
      setFeedback({ type: 'error', text: t('errorNetwork') })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-white/10 bg-[#1e293b] p-6 shadow-lg"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white">
              {t('panelTitle')}
            </h3>
            <p className="mt-0.5 text-sm text-slate-400">
              {t('panelSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPanelCollapsed((prev) => !prev)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            {isPanelCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4" />
                {t('expand')}
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                {t('minimize')}
              </>
            )}
          </button>
        </div>

        {!isPanelCollapsed && (
          <>
            <div className="border-t border-white/10 pt-5">
              {feedback && (
                <div
                  className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
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
              <div className="flex flex-col gap-6">
                {/* Marca */}
                <Section icon={Globe} title={t('sectionBrand')}>
                  <Field label={t('fieldBrandName')} name="name" value={form.name} onChange={handleChange} placeholder="Minha Empresa" />
                  <Field label={t('fieldTagline')} name="tagline" value={form.tagline} onChange={handleChange} placeholder="Palco para quem gera valor" />
                  <ImageUploadField label={t('fieldLogo')} name="logo_url" value={form.logo_url} onChange={handleChange} hint={t('hintLogoMain')} />
                  <ImageUploadField label={t('fieldFavicon')} name="favicon_url" value={form.favicon_url} onChange={handleChange} hint={t('hintFavicon')} />
                  <div className="sm:col-span-2">
                    <Field label={t('fieldOgImage')} name="og_image_url" value={form.og_image_url} onChange={handleChange} placeholder="/og.png ou https://..." hint={t('hintOgImage')} />
                  </div>
                  <Field label={t('fieldSupportEmail')} name="support_email" value={form.support_email} onChange={handleChange} placeholder="contato@minhaempresa.com" />
                  <ColorField label={t('fieldPrimaryColor')} name="primary_color" value={form.primary_color} onChange={handleChange} hint={t('hintPrimaryColor')} />
                  <ColorField label={t('fieldPrimaryColorHover')} name="primary_color_hover" value={form.primary_color_hover} onChange={handleChange} hint={t('hintPrimaryColorHover')} />
                </Section>

                {/* Seção "O que é" */}
                <Section icon={ImageIcon} title={t('sectionWhatIs')}>
                  <Field
                    label={t('fieldWhatIsHeading')}
                    name="what_is_heading"
                    value={form.what_is_heading}
                    onChange={handleChange}
                    placeholder="O que é o (Nome do evento)?"
                    hint={t('hintWhatIsHeading')}
                  />
                  <div className="sm:col-span-2">
                    <ImageUploadField
                      label={t('fieldWhatIsImage')}
                      name="what_is_image_url"
                      value={form.what_is_image_url}
                      onChange={handleChange}
                      hint={t('hintWhatIsImage')}
                    />
                  </div>
                </Section>

                {/* Local / Endereço */}
                <Section icon={MapPin} title={t('sectionLocation')}>
                  <Field label={t('fieldLocalSubheading')} name="local_subheading" value={form.local_subheading} onChange={handleChange} placeholder="Venha nos visitar..." />
                  <Field label={t('fieldAddress1')} name="address_line1" value={form.address_line1} onChange={handleChange} placeholder="R. Exemplo, 123" />
                  <Field label={t('fieldAddress2')} name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Centro – Vitória/ES" />
                  <Field label={t('fieldCep')} name="address_cep" value={form.address_cep} onChange={handleChange} placeholder="CEP: 29000-000" />
                  <div className="sm:col-span-2">
                    <Field
                      label={t('fieldMapLink')}
                      name="map_link_url"
                      value={form.map_link_url}
                      onChange={handleChange}
                      placeholder="https://www.google.com/maps/search/?api=1&query=..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Field
                      label={t('fieldMapEmbed')}
                      name="map_embed_url"
                      value={form.map_embed_url}
                      onChange={handleChange}
                      placeholder="https://www.google.com/maps?q=...&output=embed"
                      hint={t('hintMapEmbed')}
                    />
                  </div>
                </Section>

                {/* Seção Sobre */}
                <Section icon={Info} title={t('sectionAbout')}>
                  <ImageUploadField label={t('fieldAboutLogo')} name="about_logo_url" value={form.about_logo_url} onChange={handleChange} hint={t('hintAboutLogo')} />
                  <Field label={t('fieldAboutButtonLabel')} name="about_button_label" value={form.about_button_label} onChange={handleChange} placeholder="Conhecer a empresa" />
                  <div className="sm:col-span-2">
                    <Field label={t('fieldAboutButtonUrl')} name="about_button_url" value={form.about_button_url} onChange={handleChange} placeholder="https://minhaempresa.com" />
                  </div>
                  <div className="sm:col-span-2">
                    <Field label={t('fieldAboutShort')} name="about_short_text" value={form.about_short_text} onChange={handleChange} textarea placeholder="Apresentação breve da empresa..." />
                  </div>
                  <div className="sm:col-span-2">
                    <Field label={t('fieldAboutLong')} name="about_long_text" value={form.about_long_text} onChange={handleChange} textarea placeholder="Mais detalhes sobre a empresa..." />
                  </div>
                </Section>

                {/* Footer */}
                <Section icon={Layout} title={t('sectionFooter')}>
                  <ImageUploadField label={t('fieldFooterLogo')} name="footer_logo_url" value={form.footer_logo_url} onChange={handleChange} hint={t('hintFooterLogo')} />
                  <Field label={t('fieldCopyrightName')} name="footer_copyright_name" value={form.footer_copyright_name} onChange={handleChange} placeholder="Minha Empresa" hint={t('hintCopyrightName')} />
                  <Field label={t('fieldInstagram')} name="instagram_url" value={form.instagram_url} onChange={handleChange} placeholder="https://www.instagram.com/minhaempresa" />
                  <Field label={t('fieldYoutube')} name="youtube_url" value={form.youtube_url} onChange={handleChange} placeholder="https://www.youtube.com/@minhaempresa" />
                </Section>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? t('saving') : t('saveBtn')}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
