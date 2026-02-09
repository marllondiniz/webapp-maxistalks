'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Banknote, Map, ChevronLeft } from 'lucide-react'
import type { EventRecord, EventBannerRecord } from '@/lib/queries'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useUserRole } from '@/lib/useUserRole'

type Props = {
  event: EventRecord
  banner: EventBannerRecord | null
  outrosEventos?: EventRecord[]
  bannersAtivos?: EventBannerRecord[]
}

type DescriptionSection = {
  titulo: string | null
  conteudo: string
}

const parseDescriptionSections = (raw: string | null): DescriptionSection[] => {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as { sections?: Array<{ titulo?: string | null; conteudo?: string | null }> }
    if (parsed && Array.isArray(parsed.sections)) {
      return parsed.sections
        .map((section) => ({
          titulo: section.titulo ?? null,
          conteudo: section.conteudo ?? '',
        }))
        .filter((section) => section.conteudo.trim().length > 0)
    }
  } catch (error) {
    // Conteúdo não estruturado em JSON
  }

  if (raw.includes('---')) {
    return raw
      .split(/^-{3,}$|---+/gm)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((conteudo) => ({ titulo: null, conteudo }))
  }

  const trimmed = raw.trim()
  if (!trimmed) return []

  return [{ titulo: null, conteudo: trimmed }]
}

export function EventDetailClient({ event, banner, outrosEventos = [], bannersAtivos = [] }: Props) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { profile, userId } = useUserRole()
  const effectiveUserId = profile?.id ?? userId
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isFreeEvent = !event.preco || event.preco === 0
  const isPaidEvent = !isFreeEvent

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const confirmedParticipants = event.participantes_confirmados ?? 0
  const isPastEvent = new Date(event.data_horario) < new Date()

  const descriptionSections = useMemo(
    () => parseDescriptionSections(event.descricao),
    [event.descricao]
  )

  const handleExpressInterest = async () => {
    if (!effectiveUserId) {
      setMessage({ type: 'error', text: 'Você precisa estar logado para manifestar interesse.' })
      return
    }

    startTransition(async () => {
      try {
        // Verificar se já manifestou interesse
        const { data: existingRegistration } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', event.id)
          .eq('user_id', effectiveUserId)
          .single()

        if (existingRegistration) {
          setMessage({ type: 'success', text: 'Você já manifestou interesse! Em breve enviaremos um convite no WhatsApp.' })
          return
        }

        // Registrar interesse
        const { error: insertError } = await supabase
          .from('event_registrations')
          .insert({
            event_id: event.id,
            user_id: effectiveUserId,
          })

        if (insertError) throw insertError

        // Atualizar contador
        await supabase
          .from('events')
          .update({
            participantes_confirmados: confirmedParticipants + 1,
          })
          .eq('id', event.id)

        setMessage({ type: 'success', text: 'Obrigado pelo interesse! Em breve enviaremos um convite no WhatsApp.' })
        
        // Recarregar página para atualizar contadores
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } catch (error) {
        console.error('Erro ao registrar interesse:', error)
        setMessage({ type: 'error', text: 'Não foi possível registrar seu interesse. Tente novamente.' })
      }
    })
  }

  const handleBuyTicket = () => {
    setMessage({ type: 'error', text: 'Checkout de pagamento em breve!' })
  }

  const openMap = () => {
    const address = `${event.local_nome}${event.local_detalhe ? `, ${event.local_detalhe}` : ''}`
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#f5f5f5]"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar aos eventos
      </button>

      <header className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-block rounded-full bg-[#3b82f6]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">
            Evento
          </span>
          <span className="text-sm text-slate-400">
            {formatDate(event.data_horario)} • {formatTime(event.data_horario)}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight text-[#f5f5f5] sm:text-3xl">
            {banner?.titulo || event.titulo}
          </h1>
          {banner?.palestrante_instagram && (
            <div className="mt-3 space-y-1">
              {banner.subtitulo && (
                <h2 className="text-lg font-semibold text-[#f5f5f5]">
                  {banner.subtitulo}
                </h2>
              )}
              <a
                href={`https://instagram.com/${banner.palestrante_instagram.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-semibold text-blue-300 transition hover:text-blue-200"
              >
                @{banner.palestrante_instagram.replace(/^@/, '')}
              </a>
              {banner.palestrante_descricao && (
                <p className="text-sm leading-relaxed text-slate-400">{banner.palestrante_descricao}</p>
              )}
            </div>
          )}
        </div>
      </header>

      {banner?.image_url && (
        <div className="relative my-8 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={banner.image_url}
            alt={event.titulo}
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover md:object-center"
            style={{ objectPosition: 'center 30%' }}
            priority
          />
        </div>
      )}

      {/* Meta info */}
      <div className="mb-8 space-y-3 rounded-xl border border-slate-600/30 bg-slate-800/50 p-4">
        <div className="flex flex-wrap gap-4 text-sm text-[#c9c9d2]">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-[#9a9aa2]" />
            <span>
              {formatDate(event.data_horario)} • {formatTime(event.data_horario)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[#9a9aa2]" />
            <span>{event.local_nome}</span>
            {event.local_detalhe && <span className="text-slate-500">• {event.local_detalhe}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 shrink-0 text-[#9a9aa2]" />
            <span className="font-semibold text-[#f5f5f5]">
              {isFreeEvent ? 'Gratuito' : `R$ ${event.preco?.toFixed(2).replace('.', ',')}`}
            </span>
          </div>
        </div>
        {event.local_detalhe && (
          <button
            onClick={openMap}
            className="flex items-center gap-2 text-sm text-blue-300 transition hover:text-blue-200"
          >
            <Map className="h-4 w-4" />
            Ver no mapa
          </button>
        )}
      </div>

      {/* Botão principal */}
      <div className="mb-8">
        {message && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
              message.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={() => !isPastEvent && (isFreeEvent ? handleExpressInterest() : handleBuyTicket())}
          disabled={isPastEvent || isPending}
          className="w-full rounded-xl bg-[#f5f5f5] px-6 py-4 text-center text-base font-bold uppercase tracking-wide text-[#0f0f10] transition hover:bg-[#e2e2e2] disabled:cursor-not-allowed disabled:opacity-50 md:text-lg"
        >
          {isPending
            ? 'Enviando...'
            : isPastEvent
            ? 'Evento realizado'
            : isFreeEvent
            ? 'Tenho interesse em participar'
            : 'Comprar ingresso'}
        </button>
      </div>

      {/* Descrição */}
      {descriptionSections.length > 0 && (
        <div className="prose prose-invert max-w-none">
          <div className="space-y-6">
            {descriptionSections.map((section, index) => (
              <div key={`${section.titulo ?? 'section'}-${index}`} className="space-y-3">
                {section.titulo && (
                  <h2 className="text-2xl font-bold leading-tight text-white mt-8 mb-4">
                    {section.titulo}
                  </h2>
                )}
                <div 
                  className="text-[15px] leading-relaxed text-[#c9c9d2] 
                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:leading-tight
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:leading-tight
                    [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:leading-tight
                    [&_p]:mb-4 [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:space-y-2
                    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:space-y-2
                    [&_li]:mb-2 [&_li]:leading-relaxed
                    [&_strong]:font-bold [&_strong]:text-white
                    [&_em]:italic
                    [&_u]:underline
                    [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-slate-300
                    [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-blue-300
                    [&_pre]:bg-black/30 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0
                    [&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-300 [&_a]:transition-colors
                    [&_img]:rounded-lg [&_img]:my-6 [&_img]:w-full [&_img]:h-auto [&_img]:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: section.conteudo }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outros eventos */}
      {outrosEventos.length > 0 && (
        <div className="mt-12 space-y-6 border-t border-slate-600/30 pt-6">
          <h2 className="text-xl font-bold uppercase tracking-wide text-[#f5f5f5]">
            Outros eventos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {outrosEventos.map((ev) => {
              const evBanner = bannersAtivos.find((b) => b.event_id === ev.id)
              return (
                <Link
                  key={ev.id}
                  href={`/eventos/${ev.id}`}
                  className="group overflow-hidden rounded-xl border border-slate-600/30 bg-slate-800/80 transition hover:border-slate-500/40"
                >
                  {evBanner?.image_url ? (
                    <div className="relative aspect-[16/9]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={evBanner.image_url}
                        alt={evBanner.subtitulo ?? ev.titulo}
                        className="h-full w-full object-cover object-top transition group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-slate-700/60 px-4">
                      <span className="text-center text-sm font-semibold text-[#9a9aa2]">
                        {ev.titulo}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-[#f5f5f5] line-clamp-2 group-hover:text-white">
                      {ev.titulo}
                    </h3>
                    <p className="mt-1 text-xs text-[#9a9aa2]">
                      {formatDate(ev.data_horario)} • {formatTime(ev.data_horario)}
                    </p>
                    <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Ver detalhes →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600/40 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-[#f5f5f5] transition hover:border-slate-500/50 hover:bg-slate-700/60"
          >
            <ChevronLeft className="h-4 w-4" />
            Ver mais eventos
          </Link>
        </div>
      )}
    </article>
  )
}

