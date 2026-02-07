'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Image as ImageIcon, Lightbulb, Loader2, Upload, ImagePlus, MapPin } from 'lucide-react'
import type { EventBannerRecord, EventRecord } from '@/lib/queries'
import { getSupabaseClient } from '@/lib/supabaseClient'

type BannerAdminPanelProps = {
  events: EventRecord[]
  initialBanners: EventBannerRecord[]
}

const BANNER_BUCKET = 'event-banners'

type BannerFormState = {
  titulo: string
  subtitulo: string
  eventId: string
  file: File | null
  previewUrl: string | null
  showEventPicker: boolean
}

const defaultFormState: BannerFormState = {
  titulo: '',
  subtitulo: '',
  eventId: '',
  file: null,
  previewUrl: null,
  showEventPicker: false,
}

export function BannerAdminPanel({ events, initialBanners }: BannerAdminPanelProps) {
  const [form, setForm] = useState<BannerFormState>(defaultFormState)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [banners, setBanners] = useState<EventBannerRecord[]>(initialBanners)

  const supabase = useMemo(() => getSupabaseClient(), [])

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setForm((prev) => ({ ...prev, file: null, previewUrl: null }))
      return
    }

    const isValidType = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)
    if (!isValidType) {
      setFeedback('Formato inválido. Use PNG, JPG ou WEBP.')
      return
    }

    const preview = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, file, previewUrl: preview }))
  }

  const refreshBanners = async () => {
    const response = await fetch('/api/admin/event-banners?list=1')
    if (!response.ok) {
      return
    }
    const { data } = await response.json()
    setBanners(data ?? [])
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)

    if (!form.file) {
      setFeedback('Envie uma imagem para o banner.')
      return
    }

    try {
      setLoading(true)
      const fileExt = form.file.name.split('.').pop() || 'png'
      const filePath = `${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(BANNER_BUCKET)
        .upload(filePath, form.file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Erro ao enviar banner:', uploadError)
        setFeedback('Não foi possível enviar a imagem. Verifique o bucket e tente novamente.')
        return
      }

      const { data: publicData } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(filePath)
      const imageUrl = publicData?.publicUrl

      if (!imageUrl) {
        setFeedback('Não foi possível obter a URL pública do banner.')
        return
      }

      const response = await fetch('/api/admin/event-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.titulo || null,
          subtitulo: form.subtitulo || null,
          event_id: form.eventId || null,
          image_url: imageUrl,
          image_path: filePath,
        }),
      })

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: 'Erro ao salvar banner.' }))
        setFeedback(error || 'Não foi possível salvar o banner.')
        return
      }

      setFeedback('Banner criado com sucesso! Ative-o para exibir no app.')
      setForm(defaultFormState)
      await refreshBanners()
    } catch (error) {
      console.error('Erro inesperado ao criar banner:', error)
      setFeedback('Erro inesperado ao criar banner.')
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async (id: string) => {
    setFeedback(null)
    const response = await fetch('/api/admin/event-banners', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, activate: true }),
    })

    if (!response.ok) {
      const { error } = await response.json().catch(() => ({ error: 'Erro ao ativar banner.' }))
      setFeedback(error || 'Não foi possível ativar o banner.')
      return
    }

    setFeedback('Banner ativado! Ele já aparece na página de eventos.')
    await refreshBanners()
  }

  const handleDelete = async (banner: EventBannerRecord) => {
    setFeedback(null)
    const response = await fetch(`/api/admin/event-banners?id=${banner.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const { error } = await response.json().catch(() => ({ error: 'Erro ao excluir banner.' }))
      setFeedback(error || 'Não foi possível excluir o banner.')
      return
    }

    try {
      if (banner.image_path) {
        await supabase.storage.from(BANNER_BUCKET).remove([banner.image_path])
      }
    } catch (error) {
      console.error('Erro ao remover imagem do banner:', error)
    }

    await refreshBanners()
    setFeedback('Banner removido.')
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/5 bg-[#1e293b] p-6 shadow-xl">
      <div className="space-y-2">
        <h3 className="text-lg font-bold uppercase tracking-tight text-white flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Banner Promocional
        </h3>
        <p className="text-sm text-slate-400">
          Destaque eventos com banners visuais
        </p>
        <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <Lightbulb className="h-4 w-4 shrink-0 text-blue-200 mt-0.5" />
          <p className="text-xs text-blue-200">
            Cada evento pode ter seu próprio banner
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Título (opcional)</span>
            <input
              type="text"
              value={form.titulo}
              onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
              placeholder="Ex: Aulão Ritmo Certo"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Subtítulo (opcional)
            </span>
            <input
              type="text"
              value={form.subtitulo}
              onChange={(event) => setForm((prev) => ({ ...prev, subtitulo: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
              placeholder="Ex: Garanta sua vaga ainda hoje"
            />
          </label>

          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Evento relacionado (opcional)
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, showEventPicker: !prev.showEventPicker }))}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-left text-sm text-white transition hover:border-white/20 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
              >
                <span className={form.eventId ? 'text-white' : 'text-slate-400'}>
                  {form.eventId
                    ? events.find((e) => e.id === form.eventId)?.titulo ?? 'Selecione um evento'
                    : 'Selecione um evento'}
                </span>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform ${
                    form.showEventPicker ? 'rotate-180' : ''
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {form.showEventPicker && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#1e293b] shadow-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, eventId: '', showEventPicker: false }))
                    }}
                    className="w-full border-b border-white/5 px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-white/5"
                  >
                    Nenhum evento
                  </button>
                  {events.map((evento) => (
                    <button
                      key={evento.id}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, eventId: evento.id, showEventPicker: false }))
                      }}
                      className={`w-full border-b border-white/5 px-4 py-3 text-left text-sm transition hover:bg-white/5 ${
                        form.eventId === evento.id ? 'bg-white/10 text-white' : 'text-slate-300'
                      }`}
                    >
                      {evento.titulo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Imagem do banner</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-xl border border-dashed border-white/20 bg-[#1e293b] px-4 py-3 text-sm text-white file:hidden"
            />
            {form.previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.previewUrl}
                alt="Pré-visualização do banner"
                className="mt-3 w-full max-w-xl rounded-lg border border-white/10 object-cover"
              />
            )}
          </label>
        </div>

        {feedback && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.includes('sucesso') || feedback.includes('ativado')
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : feedback.includes('removido')
              ? 'border-red-500/30 bg-red-500/10 text-red-200'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}>
            {feedback}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:scale-[1.02] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Salvar banner
            </>
          )}
        </button>
      </form>

      <div className="space-y-3 border-t border-white/5 pt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400 flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            Banners cadastrados
          </h4>
          <span className="rounded-full bg-[#334155] px-2.5 py-0.5 text-xs font-bold text-white">
            {banners.length}
          </span>
        </div>

        {banners.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#1e293b] p-6 text-center">
            <p className="text-sm text-slate-400">Nenhum banner cadastrado</p>
            <p className="mt-1 text-xs text-slate-500">Crie seu primeiro banner acima</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`group flex flex-col gap-3 rounded-xl border p-4 shadow-lg transition md:flex-row md:items-center md:justify-between ${
                  banner.is_active
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-white/5 bg-[#1e293b] hover:border-white/10'
                }`}
              >
                <div className="flex w-full items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.image_url}
                    alt={banner.titulo ?? 'Banner'}
                    className="h-16 w-24 flex-shrink-0 rounded-lg border border-white/10 object-cover shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-white truncate">
                        {banner.titulo || 'Banner sem título'}
                      </p>
                      {banner.is_active && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          Ativo
                        </span>
                      )}
                    </div>
                    {banner.subtitulo && (
                      <p className="mt-0.5 text-xs text-slate-400 truncate">{banner.subtitulo}</p>
                    )}
                    {banner.event_id && events.find(e => e.id === banner.event_id) && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {events.find(e => e.id === banner.event_id)?.titulo}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!banner.is_active && (
                    <button
                      type="button"
                      onClick={() => handleActivate(banner.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                      Ativar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(banner)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-300 transition hover:border-red-500/50 hover:bg-red-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

