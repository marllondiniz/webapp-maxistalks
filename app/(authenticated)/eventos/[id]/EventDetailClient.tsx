'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Banknote, Map } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-900">
      {/* Banner */}
      <div className="relative h-[340px] w-full overflow-hidden md:h-[450px]">
        {banner?.image_url ? (
          <Image
            src={banner.image_url}
            alt={event.titulo}
            fill
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#2a2a31] to-[#18181b]" />
        )}

        {/* Botão voltar */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-[#f5f5f5] backdrop-blur-sm transition hover:bg-slate-900"
        >
          ←
        </button>
      </div>

      {/* Conteúdo */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="inline-block rounded-full bg-slate-700/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f5f5f5]">
                Evento
              </span>
              <h1 className="mt-3 text-3xl font-bold text-[#f5f5f5] md:text-4xl">
                {banner?.subtitulo || event.titulo}
              </h1>
              {banner?.palestrante_instagram && (
                <a
                  href={`https://instagram.com/${banner.palestrante_instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-semibold text-blue-300 transition hover:text-blue-200"
                >
                  @{banner.palestrante_instagram.replace(/^@/, '')}
                </a>
              )}
              {banner?.palestrante_descricao && (
                <p className="mt-2 text-sm leading-relaxed text-[#9a9aa2]">{banner.palestrante_descricao}</p>
              )}
              {banner?.titulo && (
                <div className="mt-4 rounded-xl border border-slate-600/30 bg-slate-800/50 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tema da palestra</p>
                  <p className="mt-1 text-base font-semibold text-[#f5f5f5]">{banner.titulo}</p>
                </div>
              )}
            </div>
            {event.destaque && (
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200">
                Destaque
              </span>
            )}
          </div>

          {/* Meta info */}
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
            </div>
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 shrink-0 text-[#9a9aa2]" />
              <span className="font-semibold text-[#f5f5f5]">
                {isFreeEvent ? 'Gratuito' : `R$ ${event.preco?.toFixed(2).replace('.', ',')}`}
              </span>
            </div>
          </div>
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
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-[#f5f5f5]">
              Sobre o evento
            </h2>
            <div className="space-y-4">
              {descriptionSections.map((section, index) => (
                <div
                  key={`${section.titulo ?? 'section'}-${index}`}
                  className="space-y-3 rounded-xl border border-slate-600/30 bg-slate-800/80 p-6"
                >
                  {section.titulo && (
                    <h3 className="text-base font-semibold uppercase tracking-wide text-[#f5f5f5]">
                      {section.titulo}
                    </h3>
                  )}
                  <div 
                    className="rich-content text-sm leading-relaxed text-[#c9c9d2] [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#f5f5f5] [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#f5f5f5] [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#f5f5f5] [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:text-[#c9c9d2] [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3 [&_ol]:space-y-1 [&_li]:text-[#c9c9d2] [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:my-3 [&_blockquote]:text-slate-400 [&_blockquote]:italic [&_code]:bg-slate-900/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-blue-300 [&_code]:text-xs [&_pre]:bg-slate-900/50 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-3 [&_pre]:overflow-x-auto [&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-300 [&_strong]:text-[#f5f5f5] [&_strong]:font-semibold [&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full"
                    dangerouslySetInnerHTML={{ __html: section.conteudo }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local */}
        <div className="mb-8 rounded-xl border border-slate-600/30 bg-slate-800/80 p-6">
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-[#f5f5f5]">
            Local do evento
          </h2>
          <div className="space-y-3">
            <div className="text-base font-semibold text-[#f5f5f5]">
              {event.local_nome}
            </div>
            {event.local_detalhe && (
              <div className="text-sm text-[#c9c9d2]">{event.local_detalhe}</div>
            )}
            <button
              onClick={openMap}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-700/60 px-4 py-2 text-sm font-semibold text-[#f5f5f5] transition hover:bg-slate-600/50"
            >
              <Map className="h-4 w-4 shrink-0" />
              <span>Ver no mapa</span>
            </button>
          </div>
        </div>

        {/* Data e horário */}
        <div className="mb-8 rounded-xl border border-slate-600/30 bg-slate-800/80 p-6">
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-[#f5f5f5]">
            Data e horário
          </h2>
          <div className="space-y-2">
            <div className="text-base font-semibold text-[#f5f5f5]">
              {new Date(event.data_horario).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div className="text-sm text-[#c9c9d2]">
              Início: {formatTime(event.data_horario)}
            </div>
          </div>
        </div>

        {/* Outros eventos */}
        {outrosEventos.length > 0 && (
          <div className="space-y-6">
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#f5f5f5] transition hover:bg-white/10"
            >
              Ver todos os eventos
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

