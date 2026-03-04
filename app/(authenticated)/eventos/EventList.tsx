'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PartyPopper, Check, MapPin, Calendar, X } from 'lucide-react'
import type { EventBannerRecord, EventRecord } from '@/lib/queries'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useUserRole } from '@/lib/useUserRole'

type EventListProps = {
  events: EventRecord[]
  activeBanners?: EventBannerRecord[]
}

type RegistrationMeta = {
  ticket_url: string | null
}

type MessageState = {
  type: 'success' | 'error'
  text: string
}

export function EventList({ events, activeBanners = [] }: EventListProps) {
  const t = useTranslations('UserEventos')
  const supabase = getSupabaseClient()
  const { role, hasActiveSubscription } = useUserRole()
  const [userId, setUserId] = useState<string | null>(null)
  const [registrations, setRegistrations] = useState<Record<string, RegistrationMeta>>({})
  const [messages, setMessages] = useState<Record<string, MessageState | null>>({})
  const [isPending, startTransition] = useTransition()
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [ticketModalEvent, setTicketModalEvent] = useState<{
    event: EventRecord
    registration: RegistrationMeta
  } | null>(null)

  const [eventStates, setEventStates] = useState(() =>
    events
      .slice()
      .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
      .map((event) => ({
        ...event,
        participantes_confirmados: event.participantes_confirmados ?? 0,
        capacidade_maxima: event.capacidade_maxima ?? 0,
      }))
  );

  useEffect(() => {
    let isMounted = true
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) return

      if (!user) {
        setUserId(null)
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id, ticket_url')
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao buscar inscrições:', error)
        return
      }

      if (!isMounted) return

      const map: Record<string, RegistrationMeta> = {}
      for (const registration of data ?? []) {
        map[registration.event_id] = {
          ticket_url: registration.ticket_url ?? null,
        }
      }
      setRegistrations(map)
    }

    fetchUser()

    return () => {
      isMounted = false
    }
  }, [supabase])

  useEffect(() => {
    const channel = supabase
      .channel('events-progress')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events' }, (payload) => {
        const updated = payload.new as EventRecord
        setEventStates((prev) =>
          prev.map((item) =>
            item.id === updated.id
              ? {
                  ...item,
                  participantes_confirmados: updated.participantes_confirmados ?? item.participantes_confirmados ?? 0,
                  capacidade_maxima: updated.capacidade_maxima ?? item.capacidade_maxima ?? 0,
                  preco: updated.preco ?? item.preco,
                  gratuito: updated.gratuito ?? item.gratuito,
                }
              : item
          )
        )
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleExpressInterest = (eventId: string) => {
    if (!userId) {
      setMessages((prev) => ({
        ...prev,
        [eventId]: {
          type: 'error',
          text: t('needLogin'),
        },
      }))
      return
    }

    const event = eventStates.find((item) => item.id === eventId)
    if (!event) return

    const confirmados = event.participantes_confirmados ?? 0

    startTransition(async () => {
      setActiveEventId(eventId)

      const registrationExists = registrations[eventId]
      if (registrationExists) {
        setMessages((prev) => ({
          ...prev,
        [eventId]: {
          type: 'success',
          text: t('alreadyInterest'),
        },
        }))
        setActiveEventId(null)
        return
      }

      const { error: insertError, data: insertData } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
        })
        .select('event_id, ticket_url')
        .single()

      if (insertError) {
        console.error('Erro ao registrar interesse:', insertError)
        setMessages((prev) => ({
          ...prev,
        [eventId]: {
          type: 'error',
          text: t('interestError'),
        },
        }))
        setActiveEventId(null)
        return
      }

      const { data: updatedEventData, error: updateError } = await supabase
        .from('events')
        .update({
          participantes_confirmados: confirmados + 1,
        })
        .eq('id', eventId)
        .select('participantes_confirmados')

      const updatedEvent = updatedEventData?.[0]

      if (updateError) {
        console.error('Erro ao atualizar contagem de participantes:', updateError)
      }

      // Atualizar o estado local sempre (mesmo se houver erro no update)
        setEventStates((prev) =>
          prev.map((item) =>
            item.id === eventId
              ? {
                  ...item,
                participantes_confirmados: updatedEvent?.participantes_confirmados ?? confirmados + 1,
                }
              : item
          )
        )

        setMessages((prev) => ({
          ...prev,
        [eventId]: {
          type: 'success',
          text: t('interestSuccess'),
        },
        }))

      setRegistrations((prev) => ({
        ...prev,
        [eventId]: {
          ticket_url: insertData?.ticket_url ?? null,
        },
      }))

      setActiveEventId(null)
    })
  }

  // Últimos eventos (mais recentemente criados) primeiro; depois por data do evento
  const normalizedEvents = useMemo(() => {
    const now = new Date()
    return [...eventStates].sort((a, b) => {
      const aPast = new Date(a.data_horario) < now
      const bPast = new Date(b.data_horario) < now
      if (aPast && !bPast) return 1
      if (!aPast && bPast) return -1
      const aCreated = a.created_at
      const bCreated = b.created_at
      if (aCreated && bCreated) {
        return new Date(bCreated).getTime() - new Date(aCreated).getTime()
      }
      return new Date(b.data_horario).getTime() - new Date(a.data_horario).getTime()
    })
  }, [eventStates])

  const renderEventCard = (
    event: (typeof normalizedEvents)[0],
    cardClass: string
  ) => {
          const registration = registrations[event.id]
          const isRegistered = Boolean(registration)
          const isPaidEvent = typeof event.preco === 'number' && event.preco > 0
          const SUBSCRIBER_DISCOUNT = 0.20
          const basePrice = typeof event.preco === 'number' ? event.preco : 0
          const finalPrice =
            isPaidEvent && hasActiveSubscription ? basePrice * (1 - SUBSCRIBER_DISCOUNT) : basePrice
          const priceLabel = isPaidEvent
            ? finalPrice.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
              })
            : 'Gratuito'
          const hasDiscount = isPaidEvent && hasActiveSubscription
          const originalPrice =
            isPaidEvent && hasDiscount
              ? basePrice.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                })
              : null
          const isPastEvent = new Date(event.data_horario) < new Date()
          const buttonDisabled =
            isPastEvent ||
            isRegistered ||
            (isPending && activeEventId === event.id)
          const isProcessing = isPending && activeEventId === event.id
          const eventBanner = activeBanners.find(banner => banner.event_id === event.id)
          const hasBanner = Boolean(eventBanner)
          return (
            <article
              id={`evento-${event.id}`}
              key={event.id}
              className={cardClass}
            >
              {hasBanner && eventBanner && (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={eventBanner.image_url}
                    alt={eventBanner.titulo ?? 'Banner de evento'}
                    className="h-44 w-full object-cover object-top sm:h-52 md:h-64"
                  />
                </div>
              )}

              <div className="flex w-full min-w-0 flex-col items-center text-center gap-3 pt-4 px-4 pb-3 sm:pt-5 sm:px-5 sm:pb-4 md:pt-6 md:px-6 md:pb-5">
                <header className="w-full space-y-1.5">
                  <div className="flex w-full min-w-0 flex-col items-center gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-300">
                        {t('eventBadge')}
                      </span>
                      <div className="space-y-0.5 text-sm leading-tight text-[#c9c9d2]">
                        <p>{new Date(event.data_horario).toLocaleDateString('pt-BR')}</p>
                        <p className="font-semibold">
                          {new Date(event.data_horario).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1.5 flex w-full min-w-0 flex-col items-center space-y-1">
                      <Link href={`/eventos/${event.id}`}>
                        {eventBanner?.subtitulo && (
                          <h3 className="text-xl font-bold tracking-tight text-[#f5f5f5] transition hover:text-white sm:text-2xl">
                            {eventBanner.subtitulo}
                          </h3>
                        )}
                        {!eventBanner && (
                          <h3 className="text-xl font-bold tracking-tight text-[#f5f5f5] transition hover:text-white">
                            {event.titulo}
                          </h3>
                        )}
                      </Link>
                      {eventBanner?.palestrante_instagram && (
                        <a
                          href={`https://instagram.com/${eventBanner.palestrante_instagram.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block text-xs font-semibold text-blue-300 transition hover:text-blue-200"
                        >
                          @{eventBanner.palestrante_instagram.replace(/^@/, '')}
                        </a>
                      )}
                      {eventBanner?.palestrante_descricao && (
                        <p className="text-xs leading-relaxed text-[#9a9aa2]">
                          {eventBanner.palestrante_descricao}
                        </p>
                      )}
                      {eventBanner?.titulo && (
                        <div className="mt-1 w-full min-w-0 rounded-lg border border-slate-600/30 bg-slate-700/30 px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">{t('talkTheme')}</p>
                          <p className="mt-0.5 text-sm font-medium leading-relaxed text-[#f5f5f5]">{eventBanner.titulo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </header>

                <div className="space-y-2 text-sm text-[#d6d6de]">
                  <div>
                    <p>
                      <span className="font-semibold text-[#f5f5f5]">{t('registrationLabel')}</span>{' '}
                      {hasDiscount && originalPrice && (
                        <span className="mr-2 text-xs text-[#9a9aa2] line-through">{originalPrice}</span>
                      )}
                      <span className={hasDiscount ? 'font-bold text-emerald-300' : ''}>
                        {priceLabel}
                      </span>
                    </p>
                    {hasDiscount && (
                      <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-emerald-300">
                        <PartyPopper className="h-3.5 w-3.5 shrink-0" />
                        {t('discountSubscriber')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex w-full min-w-0 flex-col items-center space-y-2">
                {messages[event.id] && (
                  <div
                    className={`w-full rounded-2xl border px-4 py-3 text-center text-sm font-medium ${
                      messages[event.id]?.type === 'success'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                        : 'border-red-500/40 bg-red-500/10 text-red-200'
                    }`}
                  >
                    {messages[event.id]?.text}
                  </div>
                )}

                <div className="flex w-full min-w-0 flex-col items-center gap-2 sm:flex-row sm:justify-center">
                  {isPastEvent ? (
                    <span className="flex w-full min-w-0 items-center justify-center rounded-full border border-slate-600/40 bg-[var(--brand-surface)] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#5f5f66] opacity-60">
                      {t('eventDone')}
                    </span>
                  ) : isRegistered ? (
                    <span className="flex w-full min-w-0 items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-200">
                      <Check className="h-4 w-4 shrink-0" />
                      {t('registered')}
                    </span>
                  ) : isPaidEvent ? (
                    <button
                      type="button"
                      disabled={isPastEvent}
                      onClick={() =>
                        !isPastEvent &&
                        setMessages((prev) => ({
                          ...prev,
                          [event.id]: {
                            type: 'error',
                            text: t('checkoutSoon'),
                          },
                        }))
                      }
                      className={`flex min-w-0 flex-1 items-center justify-center rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                        isPastEvent
                          ? 'cursor-not-allowed border border-slate-600/40 bg-[var(--brand-surface)] text-[#5f5f66] opacity-60'
                          : 'bg-[#f5f5f5] text-[#0f0f10] hover:brightness-95'
                      }`}
                    >
                      {isPastEvent ? t('eventDone') : t('buy')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => !isPastEvent && handleExpressInterest(event.id)}
                      disabled={buttonDisabled}
                      className={`flex min-w-0 flex-1 items-center justify-center rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                        buttonDisabled
                          ? 'cursor-not-allowed border border-slate-600/40 bg-[var(--brand-surface)] text-[#5f5f66] opacity-60'
                          : 'bg-[#f5f5f5] text-[#0f0f10] hover:brightness-95'
                      }`}
                    >
                      {isProcessing
                        ? t('sending')
                        : isPastEvent
                        ? t('eventDone')
                        : t('haveInterest')}
                    </button>
                  )}
                </div>

                <Link
                  href={`/eventos/${event.id}`}
                  className="flex w-full min-w-0 items-center justify-center rounded-full border border-slate-600/30 bg-[var(--brand-surface)] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#f5f5f5] transition hover:border-slate-500/40 hover:bg-[var(--brand-surface)]/50"
                >
                  {t('learnMore')}
                </Link>
              </div>
              </div>
            </article>
          )
  }

  return (
    <div className="space-y-4">
      {/* Mobile: carrossel horizontal (igual à página principal) */}
      <div
        className="scrollbar-hide -mx-5 w-[calc(100%+40px)] overflow-x-auto px-4 py-2 md:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex w-max gap-4">
          {normalizedEvents.map((event) =>
            renderEventCard(
              event,
              'flex h-full w-[300px] shrink-0 flex-col rounded-2xl border-l-4 border-l-blue-500/80 border border-slate-600/30 bg-[var(--brand-surface)]/90 shadow-xl shadow-black/20 transition hover:border-l-blue-400 hover:border-slate-500/50 hover:shadow-2xl overflow-hidden'
            )
          )}
        </div>
      </div>

      {/* Desktop: carrossel horizontal */}
      <div
        className="hidden md:block -mx-5 w-[calc(100%+40px)] overflow-x-auto px-4 py-2 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex w-max gap-6 snap-x snap-mandatory">
          {normalizedEvents.map((event) =>
            renderEventCard(
              event,
              'flex h-full w-[340px] shrink-0 flex-col rounded-2xl border-l-4 border-l-blue-500/80 border border-slate-600/30 bg-[var(--brand-surface)]/90 shadow-xl shadow-black/20 transition hover:border-l-blue-400 hover:border-slate-500/50 hover:shadow-2xl overflow-hidden snap-center snap-always'
            )
          )}
        </div>
      </div>

      {/* Modal de ingresso */}
      {ticketModalEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setTicketModalEvent(null)}
        >
          <div
            className="relative max-w-md w-full rounded-2xl border border-slate-600/40 bg-[var(--brand-surface-alt)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setTicketModalEvent(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-[var(--brand-text-muted)] transition hover:bg-[var(--brand-surface)]/50 hover:text-white"
              aria-label={t('closeAria')}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t('youAreRegistered')}
                </h3>
                <p className="text-sm text-[var(--brand-text-muted)]">
                  {ticketModalEvent.registration.ticket_url
                    ? t('ticketInfo')
                    : t('ticketSoon')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-600/40 bg-[var(--brand-surface)]/80 p-4">
                <h4 className="font-bold text-white">{ticketModalEvent.event.titulo}</h4>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-600/40 bg-[var(--brand-surface)]/80 p-4">
                <Calendar className="h-5 w-5 shrink-0 text-[var(--brand-text-muted)]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-muted)]">
                    {t('dateTime')}
                  </p>
                  <p className="mt-1 text-[#f5f5f5]">
                    {new Date(ticketModalEvent.event.data_horario).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="mt-0.5 text-[#c9c9d2]">
                    às{' '}
                    {new Date(ticketModalEvent.event.data_horario).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-600/40 bg-[var(--brand-surface)]/80 p-4">
                <MapPin className="h-5 w-5 shrink-0 text-[var(--brand-text-muted)]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-muted)]">
                    {t('location')}
                  </p>
                  <p className="mt-1 text-[#f5f5f5]">{ticketModalEvent.event.local_nome}</p>
                  {ticketModalEvent.event.local_detalhe && (
                    <p className="mt-0.5 text-[#c9c9d2]">
                      {ticketModalEvent.event.local_detalhe}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${ticketModalEvent.event.local_nome}${ticketModalEvent.event.local_detalhe ? `, ${ticketModalEvent.event.local_detalhe}` : ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    {t('viewOnMaps')}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {ticketModalEvent.registration.ticket_url ? (
                <a
                  href={ticketModalEvent.registration.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#f5f5f5] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#0f0f10] transition hover:brightness-95"
                >
                  {t('openTicket')}
                </a>
              ) : (
                <p className="text-center text-sm text-[var(--brand-text-muted)]">
                  {t('presentWithEmail')}
                </p>
              )}
              <button
                type="button"
                onClick={() => setTicketModalEvent(null)}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-600/40 px-4 py-3 text-sm font-semibold text-[#f5f5f5] transition hover:bg-[var(--brand-surface)]/50"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

