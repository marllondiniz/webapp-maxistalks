'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { EventPreviewModalLanding, type EventPreviewLanding } from '@/components/EventPreviewModalLanding'
import { useBrand } from '@/app/(components)/BrandProvider'
import { useTranslations } from 'next-intl'
import { LanguageToggle } from '@/app/(components)/LanguageToggle'

type EventPreview = EventPreviewLanding

function formatEventDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')} de ${d.toLocaleDateString('pt-BR', { month: 'long' })} de ${d.getFullYear()} • ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}h`
}

function getTituloOpcional(descricao: string | null | undefined): string | null {
  if (!descricao?.trim()) return null
  try {
    const parsed = JSON.parse(descricao) as { sections?: Array<{ titulo?: string | null }> }
    const titulo = parsed?.sections?.[0]?.titulo
    return titulo?.trim() || null
  } catch {
    return null
  }
}


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
}

export default function MaxisTalksPage() {
  const brand = useBrand()
  const t = useTranslations('Landing')
  const [events, setEvents] = useState<EventPreview[]>([])
  const [previewEvent, setPreviewEvent] = useState<EventPreview | null>(null)

  useEffect(() => {
    fetch('/api/events', { cache: 'no-store' })
      .then((r) => r.json())
      .then(({ events: e }) => setEvents(e ?? []))
      .catch(() => setEvents([]))
  }, [])

  return (
    <main className="relative min-h-screen bg-[#060c1f] text-white">
      {/* Global noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 noise-texture" />

      {/* ── DOBRA 1 ── Hero + Spoiler */}
      <section className="hero-glow relative flex min-h-[calc(100vh-48px)] flex-col overflow-hidden">
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0 animated-grid" />

        <div className="absolute right-6 top-6 z-20">
          <LanguageToggle />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20 md:py-24"
        >
          {/* Logo */}
          <motion.div variants={fadeUp} className="mb-6 md:mb-8">
            <Image
              src={brand.logoPath}
              alt={brand.name}
              width={260}
              height={104}
              className="mx-auto h-auto w-52 md:w-64"
              priority
            />
          </motion.div>

          {/* Tagline + Headline */}
          <motion.div
            variants={fadeUp}
            className="mb-4 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] md:text-xs text-slate-100 backdrop-blur-md"
          >
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            <span className="font-semibold uppercase tracking-[0.2em] text-slate-300">
              {t('heroTagline')}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mb-5 text-balance text-center font-display text-3xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl"
          >
            {t('heroHeadlineLine1')}
            <br />
            <span className="text-gradient-blue">{t('heroHeadlineLine2', { name: brand.name })}</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUp}
            className="mx-auto mb-10 max-w-xl text-balance text-center text-base leading-relaxed text-slate-400 md:text-lg"
          >
            {t('heroSubheadline')}
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mb-16 flex flex-col items-center gap-3">
            <Link
              href="/login?mode=signUp"
              className="btn-glow flex items-center gap-2.5 rounded-2xl bg-[var(--brand-primary)] px-10 py-4 text-[15px] font-bold uppercase tracking-wider text-white transition hover:bg-[var(--brand-primary-hover)]"
            >
              {t('ctaCreateAccount')}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-sm text-slate-500">
              {t('ctaLoginPrefix')}{' '}
              <Link href="/login" className="text-blue-400 transition hover:text-blue-300 hover:underline">
                {t('ctaLogin')}
              </Link>
            </p>
          </motion.div>

          {/* Spoiler – Próximas Edições */}
          <motion.div variants={fadeUp} className="w-full max-w-4xl">
            <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              {t('tagUpcoming')}
            </p>

            {events.length > 0 ? (
              <>
                {/* Mobile: carrossel horizontal */}
                <div
                  className="scrollbar-hide -mx-6 w-[calc(100%+48px)] overflow-x-auto px-4 py-2 sm:hidden"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="flex w-max gap-4">
                    {events.slice(0, 12).map((event, i) => {
                      const isPast = new Date(event.data_horario) < new Date()
                      const nomePalestrante = event.banner?.subtitulo || null
                      const temaPalestra = event.banner?.titulo || getTituloOpcional(event.descricao) || event.titulo
                      return (
                        <div
                          key={event.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setPreviewEvent(event)}
                          onKeyDown={(e) => e.key === 'Enter' && setPreviewEvent(event)}
                          className="glass-card group w-[280px] shrink-0 cursor-pointer overflow-hidden"
                        >
                          {event.banner?.image_url ? (
                            <div className="relative aspect-[3/4] overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={event.banner.image_url}
                                alt={nomePalestrante || event.titulo}
                                className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                              />
                                  <div className="absolute left-4 top-4 flex items-center gap-2">
                                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium tracking-wider text-white/90 backdrop-blur-sm">
                                  {t('cardEdition', { n: String(i + 1).padStart(2, '0') })}
                                </span>
                                {isPast && (
                                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {t('cardDone')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-blue-600/10 to-transparent p-8">
                              <span className="absolute left-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium tracking-wider text-white/90 backdrop-blur-sm">
                                {t('cardEdition', { n: String(i + 1).padStart(2, '0') })}
                              </span>
                              <p className="text-center text-lg font-bold text-white/80">{event.titulo}</p>
                            </div>
                          )}
                          <div className="border-t border-white/[0.05] px-5 py-4">
                            <p className="text-[11px] text-slate-500">{formatEventDate(event.data_horario)}</p>
                            <h3 className="mt-1 text-lg font-bold text-white">{nomePalestrante || event.titulo}</h3>
                            {event.banner?.palestrante_instagram && (
                              <a
                                href={`https://instagram.com/${event.banner.palestrante_instagram.replace(/^@/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1 inline-block text-xs font-semibold text-blue-400 hover:text-blue-300"
                              >
                                @{event.banner.palestrante_instagram.replace(/^@/, '')}
                              </a>
                            )}
                            {event.banner?.palestrante_descricao && (
                              <p className="mt-1 text-xs text-slate-400 line-clamp-2">{event.banner.palestrante_descricao}</p>
                            )}
                          </div>
                          <div className="mx-5 mb-5 rounded-xl bg-[#1e293b]/80 px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              {t('cardThemeLabel')}
                            </p>
                            <p className="mt-1 font-semibold text-white line-clamp-2">{temaPalestra}</p>
                          </div>
                          <div className="border-t border-white/[0.05] p-5" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={isPast ? '#' : '/login?mode=signUp'}
                              className={`block w-full rounded-xl py-3.5 text-center text-sm font-bold uppercase tracking-wider transition ${
                                isPast
                                  ? 'cursor-default bg-white/[0.06] text-slate-400'
                                  : 'btn-glow bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]'
                              }`}
                            >
                              {isPast ? t('cardButtonPast') : t('cardButtonUpcoming')}
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop: grid */}
                <div className="hidden grid-cols-2 gap-5 sm:grid lg:grid-cols-3">
                {events.slice(0, 12).map((event, i) => {
                  const isPast = new Date(event.data_horario) < new Date()
                  const nomePalestrante = event.banner?.subtitulo || null
                  const temaPalestra = event.banner?.titulo || getTituloOpcional(event.descricao) || event.titulo
                  return (
                    <motion.div
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setPreviewEvent(event)}
                      onKeyDown={(e) => e.key === 'Enter' && setPreviewEvent(event)}
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="glass-card group cursor-pointer overflow-hidden"
                    >
                      {/* Foto do palestrante */}
                      {event.banner?.image_url ? (
                        <div className="relative aspect-[3/4] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={event.banner.image_url}
                            alt={nomePalestrante || event.titulo}
                            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                          />
                          <div className="absolute left-4 top-4 flex items-center gap-2">
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium tracking-wider text-white/90 backdrop-blur-sm">
                              {t('cardEdition', { n: String(i + 1).padStart(2, '0') })}
                            </span>
                            {isPast && (
                            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              {t('cardDone')}
                            </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-blue-600/10 to-transparent p-8">
                          <span className="absolute left-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium tracking-wider text-white/90 backdrop-blur-sm">
                            {t('cardEdition', { n: String(i + 1).padStart(2, '0') })}
                          </span>
                          <p className="text-center text-lg font-bold text-white/80">{event.titulo}</p>
                        </div>
                      )}

                      {/* Nome, Instagram, quem é */}
                      <div className="border-t border-white/[0.05] px-5 py-4">
                        <p className="text-[11px] text-slate-500">{formatEventDate(event.data_horario)}</p>
                        <h3 className="mt-1 text-lg font-bold text-white">{nomePalestrante || event.titulo}</h3>
                        {event.banner?.palestrante_instagram && (
                          <a
                            href={`https://instagram.com/${event.banner.palestrante_instagram.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 inline-block text-xs font-semibold text-blue-400 hover:text-blue-300"
                          >
                            @{event.banner.palestrante_instagram.replace(/^@/, '')}
                          </a>
                        )}
                        {event.banner?.palestrante_descricao && (
                          <p className="mt-1 text-xs text-slate-400 line-clamp-2">{event.banner.palestrante_descricao}</p>
                        )}
                      </div>

                      {/* Tema da palestra */}
                      <div className="mx-5 mb-5 rounded-xl bg-[#1e293b]/80 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {t('cardThemeLabel')}
                        </p>
                        <p className="mt-1 font-semibold text-white line-clamp-2">{temaPalestra}</p>
                      </div>

                      {/* Footer */}
                      <div className="border-t border-white/[0.05] p-5" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={isPast ? '#' : '/login?mode=signUp'}
                          className={`block w-full rounded-xl py-3.5 text-center text-sm font-bold uppercase tracking-wider transition ${
                            isPast
                              ? 'cursor-default bg-white/[0.06] text-slate-400'
                              : 'btn-glow bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]'
                          }`}
                        >
                          {isPast ? t('cardButtonPast') : t('cardButtonUpcoming')}
                        </Link>
                      </div>
                    </motion.div>
                  )
                })}
                </div>
              </>
            ) : (
              <div className="glass-card px-8 py-16 text-center">
                <p className="text-base text-slate-400">Novos eventos em breve</p>
                <p className="mt-2 text-sm text-slate-500">
                  Crie sua conta para ser avisado das próximas edições
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ── O QUE É ── */}
      <section className="section-glow px-6 py-20 md:py-32">
        <div className="mx-auto max-w-4xl md:max-w-2xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="section-heading">
              {brand.whatIsHeading || t('whatIsFallbackTitle', { name: brand.name })}
            </motion.h2>
            <motion.div
              variants={fadeUp}
              className="mt-10 overflow-hidden rounded-3xl border border-white/[0.06] shadow-2xl"
            >
              <Image
                src={brand.whatIsImageUrl || '/oqueé.avif'}
                alt={`O que é o ${brand.name} — evento presencial para convidados selecionados`}
                width={960}
                height={540}
                className="w-full object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── LOCAL ── */}
      {(brand.addressLine1 || brand.mapEmbedUrl) && (
        <section className="px-6 py-20 md:py-32">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="section-heading">
                {t('localTitle')}
              </motion.h2>
              {brand.localSubheading && (
                <motion.p variants={fadeUp} className="section-subheading">
                  {brand.localSubheading}
                </motion.p>
              )}

              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] lg:flex-row"
              >
                {/* Info */}
                <div className="flex flex-1 flex-col justify-center gap-6 p-8 lg:p-10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Formato</p>
                      <p className="text-lg font-semibold text-white">{t('localFormatValue')}</p>
                    </div>
                  </div>

                  {brand.addressLine1 && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                        <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0V7.5m0 0h3.75" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Endereço</p>
                        {/* label traduzida acima */}
                        <p className="text-base font-medium text-white">{brand.addressLine1}</p>
                        {brand.addressLine2 && <p className="text-sm text-slate-300">{brand.addressLine2}</p>}
                        {brand.addressCep && <p className="text-sm text-slate-400">{brand.addressCep}</p>}
                      </div>
                    </div>
                  )}

                  {brand.mapLinkUrl && (
                    <a
                      href={brand.mapLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/20"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t('localMapsButton')}
                    </a>
                  )}
                </div>

                {/* Map */}
                {brand.mapEmbedUrl && (
                  <div className="h-72 flex-1 lg:h-auto lg:min-h-[380px]">
                    <iframe
                      src={brand.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: '288px' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Localização ${brand.name}`}
                      className="h-full w-full"
                    />
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── SOBRE ── */}
      {(brand.aboutShortText || brand.aboutLogoUrl) && (
        <section className="section-glow px-6 py-20 md:py-32">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="glass-card p-8 md:p-12"
            >
              {brand.aboutLogoUrl && (
                <motion.div variants={fadeUp} className="mb-8 flex justify-center">
                  <div className="relative h-28 w-56 shrink-0">
                    <Image
                      src={brand.aboutLogoUrl}
                      alt={brand.name}
                      fill
                      sizes="224px"
                      className="object-contain object-center"
                    />
                  </div>
                </motion.div>
              )}

              <motion.h2 variants={fadeUp} className="mb-6 text-center font-display text-2xl font-bold md:text-3xl">
                {t('aboutTitle', { name: brand.name })}
              </motion.h2>

              {brand.aboutShortText && (
                <motion.p variants={fadeUp} className="text-center text-base leading-[1.8] text-slate-300 md:text-lg">
                  {brand.aboutShortText}
                </motion.p>
              )}

              {brand.aboutLongText && (
                <motion.p variants={fadeUp} className="mt-4 text-center text-base leading-[1.8] text-slate-400 md:text-lg">
                  {brand.aboutLongText}
                </motion.p>
              )}

              {brand.aboutButtonUrl && brand.aboutButtonLabel && (
                <motion.div variants={fadeUp} className="mt-10 flex justify-center">
                  <a
                    href={brand.aboutButtonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glow inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[var(--brand-primary-hover)]"
                  >
                    {brand.aboutButtonLabel}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ── */}
      <section className="px-6 py-20 md:py-32">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="glass-card overflow-hidden p-10 text-center md:p-14"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            >
              {t('finalCtaTitleLine1')}
              <br />
              <span className="text-gradient-blue">{t('finalCtaGradient')}</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-400 md:text-lg"
            >
              {t('finalCtaBody')}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10">
              <Link
                href="/login?mode=signUp"
                className="btn-glow inline-flex items-center gap-2.5 rounded-2xl bg-[var(--brand-primary)] px-10 py-4 text-[15px] font-bold uppercase tracking-wider text-white transition hover:bg-[var(--brand-primary-hover)]"
              >
                {t('finalCtaButton')}
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <p className="mt-4 text-sm text-slate-500">
                {t('ctaLoginPrefix')}{' '}
                <Link href="/login" className="text-blue-400 transition hover:text-blue-300 hover:underline">
                  {t('ctaLogin')}
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] bg-[#060c1f]/95 px-6 py-12 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 md:flex-row md:flex-wrap">
          {(brand.footerLogoUrl || brand.logoPath) && (
            <div className="relative h-14 w-40 shrink-0">
              <Image
                src={brand.footerLogoUrl ?? brand.logoPath}
                alt={brand.footerCopyrightName ?? brand.name}
                fill
                sizes="160px"
                className="object-contain object-left opacity-80"
              />
            </div>
          )}
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-4 text-sm text-slate-500 md:gap-6">
            <Link href="/cookies" className="transition hover:text-white">{t('footerCookies')}</Link>
            <span className="text-slate-700">•</span>
            <Link href="/politica-de-privacidade" className="transition hover:text-white">{t('footerPrivacy')}</Link>
          </div>
          {(brand.instagramUrl || brand.youtubeUrl) && (
            <div className="flex shrink-0 items-center gap-5">
              {brand.instagramUrl && (
                <a
                  href={brand.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex size-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:text-white"
                  aria-label="Instagram"
                >
                  <svg className="size-6 shrink-0 transition group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              )}
              {brand.youtubeUrl && (
                <a
                  href={brand.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex size-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-600 hover:text-white"
                  aria-label="YouTube"
                >
                  <svg className="size-6 shrink-0 transition group-hover:scale-105" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} {brand.footerCopyrightName ?? brand.name}. Todos os direitos reservados.
        </p>
      </footer>

      <EventPreviewModalLanding
        event={previewEvent}
        isOpen={!!previewEvent}
        onClose={() => setPreviewEvent(null)}
        isPast={previewEvent ? new Date(previewEvent.data_horario) < new Date() : false}
      />

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-xl transition hover:bg-[var(--brand-primary-hover)] hover:scale-105"
        aria-label="Voltar ao topo"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </main>
  )
}
