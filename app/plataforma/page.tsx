'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { LanguageToggle } from '@/app/(components)/LanguageToggle'
import { formatPhoneBR } from '@/lib/phone'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
}

const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    key: 'eventos',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    key: 'blog',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    key: 'membros',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    key: 'branding',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    key: 'admin',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    key: 'clube',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    key: 'ferramentas',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    key: 'convites',
  },
]

const STEPS = ['step1', 'step2', 'step3']

const DIFFERENTIALS = ['diff1', 'diff2', 'diff3', 'diff4']

const PLANS = [
  { key: 'starter', highlight: false },
  { key: 'pro', highlight: true },
  { key: 'enterprise', highlight: false },
]

const FAQS = ['faq1', 'faq2', 'faq3', 'faq4', 'faq5']

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group glass-card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-semibold text-white [&::-webkit-details-marker]:hidden">
        {question}
        <svg
          className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-45"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </summary>
      <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{answer}</p>
    </details>
  )
}

export default function PlataformaPage() {
  const t = useTranslations('Plataforma')
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', empresa: '', mensagem: '' })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<1 | 2>(1)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidEmail = (email: string) => email.trim().length > 0 && EMAIL_REGEX.test(email.trim())

  const openModal = (plan?: string) => {
    setSelectedPlan(plan || null)
    setModalStep(1)
    setSubmitStatus('idle')
    setSubmitMessage('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalStep(1)
    setSelectedPlan(null)
    setForm({ nome: '', email: '', telefone: '', empresa: '', mensagem: '' })
    setSubmitStatus('idle')
    setSubmitMessage('')
    setEmailError(null)
  }

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    if (!isValidEmail(form.email)) {
      setEmailError(t('interestEmailInvalid'))
      return
    }
    setSubmitStatus('loading')
    setSubmitMessage('')
    const mensagemFinal = form.mensagem?.trim() || undefined
    try {
      const res = await fetch('/api/plataforma-interesse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.trim() || undefined,
          empresa: form.empresa.trim() || undefined,
          mensagem: mensagemFinal,
          plano_interesse: selectedPlan || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitStatus('error')
        setSubmitMessage(data?.error || t('interestError'))
        return
      }
      setSubmitStatus('success')
      setSubmitMessage(data?.message || t('interestSuccess'))
      setForm({ nome: '', email: '', telefone: '', empresa: '', mensagem: '' })
      setModalStep(2)
    } catch {
      setSubmitStatus('error')
      setSubmitMessage(t('interestError'))
    }
  }

  return (
    <main className="relative min-h-screen bg-[#060c1f] text-white">
      <div className="pointer-events-none fixed inset-0 z-50 noise-texture" />

      {/* ── MODAL TENHO INTERESSE (steps) ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex max-h-[85vh] flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 flex-shrink-0">
                <p id="modal-title" className="text-sm font-medium text-slate-400">
                  {t('modalStepLabel', { current: modalStep, total: 2 })}
                </p>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label={t('modalClose')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {modalStep === 1 && (
                <>
                  <h2 className="text-xl font-bold text-white md:text-2xl">{t('interestTitle')}</h2>
                  <p className="mt-1 text-sm text-slate-400">{t('interestSubtitle')}</p>
                  {selectedPlan && (
                    <p className="mt-3 rounded-lg bg-white/5 px-4 py-2 text-sm text-slate-300">
                      <span className="font-medium text-white">{t('modalPlanSelected')}:</span>{' '}
                      {selectedPlan === 'general'
                        ? t('modalStep1OptionGeneral')
                        : t(selectedPlan === 'starter' ? 'starterName' : selectedPlan === 'pro' ? 'proName' : 'enterpriseName')}
                    </p>
                  )}
                  <form onSubmit={handleInterestSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="modal-nome" className="mb-1 block text-xs font-medium text-slate-400">
                        {t('interestName')} *
                      </label>
                      <input
                        id="modal-nome"
                        type="text"
                        required
                        minLength={2}
                        value={form.nome}
                        onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                        placeholder={t('interestNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label htmlFor="modal-email" className="mb-1 block text-xs font-medium text-slate-400">
                        {t('interestEmail')} *
                      </label>
                      <input
                        id="modal-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, email: e.target.value }))
                          setEmailError(null)
                        }}
                        className={`w-full rounded-xl border bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 ${emailError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-white/10 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]'}`}
                        placeholder={t('interestEmailPlaceholder')}
                      />
                      {emailError && <p className="mt-1 text-xs text-rose-400">{emailError}</p>}
                    </div>
                    <div>
                      <label htmlFor="modal-telefone" className="mb-1 block text-xs font-medium text-slate-400">
                        {t('interestPhone')}
                      </label>
                      <input
                        id="modal-telefone"
                        type="tel"
                        value={form.telefone}
                        onChange={(e) => setForm((p) => ({ ...p, telefone: formatPhoneBR(e.target.value) }))}
                        className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                        placeholder={t('interestPhonePlaceholder')}
                      />
                    </div>
                    <div>
                      <label htmlFor="modal-empresa" className="mb-1 block text-xs font-medium text-slate-400">
                        {t('interestCompany')}
                      </label>
                      <input
                        id="modal-empresa"
                        type="text"
                        value={form.empresa}
                        onChange={(e) => setForm((p) => ({ ...p, empresa: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                        placeholder={t('interestCompanyPlaceholder')}
                      />
                    </div>
                    <div>
                      <label htmlFor="modal-mensagem" className="mb-1 block text-xs font-medium text-slate-400">
                        {t('interestMessage')}
                      </label>
                      <textarea
                        id="modal-mensagem"
                        rows={3}
                        value={form.mensagem}
                        onChange={(e) => setForm((p) => ({ ...p, mensagem: e.target.value }))}
                        className="w-full resize-none rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                        placeholder={t('interestMessagePlaceholder')}
                      />
                    </div>
                    {submitStatus === 'error' && submitMessage && (
                      <p className="text-sm text-rose-400">{submitMessage}</p>
                    )}
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={submitStatus === 'loading'}
                        className="btn-glow flex-1 rounded-xl bg-[var(--brand-primary)] py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
                      >
                        {submitStatus === 'loading' ? t('interestSending') : t('interestSubmit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => closeModal()}
                        className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                      >
                        {t('modalBack')}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {modalStep === 2 && (
                <>
                  <div className="rounded-xl bg-emerald-500/10 p-5 text-center">
                    <p className="font-medium text-emerald-400">{submitMessage}</p>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-6 text-sm text-slate-400 underline hover:text-white"
                    >
                      {t('modalClose')}
                    </button>
                  </div>
                </>
              )}
            </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero-glow relative flex min-h-screen flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 animated-grid" />

        <div className="absolute right-6 top-6 z-20">
          <LanguageToggle />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-24 text-center"
        >
          {/* Logo MaxisPlus */}
          <motion.div variants={fadeUp} className="mb-8 md:mb-10">
            <Image
              src="/logo-maxis.avif"
              alt="MaxisPlus"
              width={260}
              height={104}
              className="mx-auto h-auto w-52 md:w-64"
              priority
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mb-5 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] text-slate-100 backdrop-blur-md"
          >
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            <span className="font-semibold uppercase tracking-[0.2em] text-slate-300">
              {t('heroTagline')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mb-6 text-balance text-center font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl"
          >
            {t('heroHeadlineLine1')}
            <br />
            <span className="text-gradient-blue">{t('heroHeadlineLine2')}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mb-12 max-w-2xl text-balance text-center text-base leading-relaxed text-slate-400 md:text-xl"
          >
            {t('heroSubheadline')}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            <a
              href="#planos"
              className="btn-glow flex items-center gap-2.5 rounded-2xl bg-[var(--brand-primary)] px-10 py-4 text-[15px] font-bold uppercase tracking-wider text-white transition hover:bg-[var(--brand-primary-hover)]"
            >
              {t('heroCta')}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#como-funciona"
              className="flex items-center gap-2 rounded-2xl border border-white/10 px-8 py-4 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              {t('heroSecondary')}
            </a>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            {(['stat1', 'stat2', 'stat3'] as const).map((key) => (
              <div key={key} className="text-center">
                <p className="text-3xl font-bold text-white md:text-4xl">{t(`${key}Value`)}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t(`${key}Label`)}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── CONHEÇA A PLATAFORMA ── */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="glass-card overflow-hidden p-8 text-center md:p-12"
          >
            <motion.div variants={fadeUp} className="mx-auto mb-6 flex justify-center">
              <Image
                src="/maxistalks-logo.png"
                alt="MaxisTalks"
                width={200}
                height={80}
                className="h-auto w-40 md:w-52"
              />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl font-bold text-white md:text-3xl">
              {t('previewTitle')}
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-xl text-base text-slate-400 md:text-lg">
              {t('previewSubtitle')}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow inline-flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-[15px] font-bold uppercase tracking-wider text-white transition hover:bg-white/10 hover:border-white/20"
              >
                {t('previewCta')}
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <p className="mt-3 text-xs text-slate-500">
                {t('previewHint')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-glow px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="flex justify-center">
              <span className="tag mb-4 inline-block">{t('featuresTag')}</span>
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">
              {t('featuresTitle')}
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subheading">
              {t('featuresSubtitle')}
            </motion.p>

            <motion.div
              variants={stagger}
              className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {FEATURES.map(({ icon, key }) => (
                <motion.div
                  key={key}
                  variants={fadeUp}
                  className="glass-card glow-border flex flex-col gap-4 p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{t(`feature${key.charAt(0).toUpperCase() + key.slice(1)}Title`)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                      {t(`feature${key.charAt(0).toUpperCase() + key.slice(1)}Desc`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="flex justify-center">
              <span className="tag mb-4 inline-block">{t('howTag')}</span>
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">
              {t('howTitle')}
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subheading">
              {t('howSubtitle')}
            </motion.p>

            <motion.div variants={stagger} className="mt-14 space-y-5">
              {STEPS.map((key, i) => (
                <motion.div
                  key={key}
                  variants={fadeUp}
                  className="glass-card flex items-start gap-6 p-7"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-lg font-black text-white">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t(`${key}Title`)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{t(`${key}Desc`)}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section className="section-glow px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="flex justify-center">
              <span className="tag mb-4 inline-block">{t('diffTag')}</span>
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">
              {t('diffTitle')}
            </motion.h2>

            <motion.div
              variants={stagger}
              className="mt-14 grid gap-6 sm:grid-cols-2"
            >
              {DIFFERENTIALS.map((key) => (
                <motion.div
                  key={key}
                  variants={fadeUp}
                  className="glass-card flex items-start gap-5 p-7"
                >
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{t(`${key}Title`)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{t(`${key}Desc`)}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="flex justify-center">
              <span className="tag mb-4 inline-block">{t('plansTag')}</span>
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">
              {t('plansTitle')}
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subheading">
              {t('plansSubtitle')}
            </motion.p>

            <motion.div
              variants={stagger}
              className="mt-14 grid gap-6 lg:grid-cols-3"
            >
              {PLANS.map(({ key, highlight }) => (
                <motion.div
                  key={key}
                  variants={fadeUp}
                  className={`relative flex flex-col rounded-3xl p-8 ${
                    highlight
                      ? 'border border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/5 shadow-[0_0_60px_color-mix(in_srgb,var(--brand-primary)_15%,transparent)]'
                      : 'glass-card'
                  }`}
                >
                  {highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-[var(--brand-primary)] px-4 py-1 text-[11px] font-black uppercase tracking-widest text-white">
                        {t('plansMostPopular')}
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      {t(`${key}Name`)}
                    </p>
                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-4xl font-black text-white">{t(`${key}Price`)}</span>
                      {t(`${key}Suffix`) && (
                        <span className="mb-1 text-sm text-slate-400">{t(`${key}Suffix`)}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{t(`${key}Desc`)}</p>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {[1, 2, 3, 4].map((n) => {
                      const itemKey = `${key}Feature${n}`
                      const text = t.raw(itemKey) as string | undefined
                      if (!text) return null
                      return (
                        <li key={n} className="flex items-center gap-3 text-sm text-slate-300">
                          <svg className="h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {text}
                        </li>
                      )
                    })}
                  </ul>

                  <button
                    type="button"
                    onClick={() => openModal(key)}
                    className={`block w-full rounded-2xl py-3.5 text-center text-sm font-bold uppercase tracking-wider transition ${
                      highlight
                        ? 'btn-glow bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]'
                        : 'border border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {t(`${key}Cta`)}
                  </button>
                </motion.div>
              ))}
            </motion.div>

            <motion.p variants={fadeUp} className="mt-8 text-center text-sm text-slate-500">
              {t('plansFootnote')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-glow px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="flex justify-center">
              <span className="tag mb-4 inline-block">{t('faqTag')}</span>
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading mb-10">
              {t('faqTitle')}
            </motion.h2>

            <motion.div variants={stagger} className="space-y-4">
              {FAQS.map((key) => (
                <motion.div key={key} variants={fadeUp}>
                  <FaqItem question={t(`${key}Q`)} answer={t(`${key}A`)} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="glass-card overflow-hidden p-10 text-center md:p-14"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            >
              {t('finalCtaLine1')}
              <br />
              <span className="text-gradient-blue">{t('finalCtaGradient')}</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-400 md:text-lg"
            >
              {t('finalCtaBody')}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => openModal()}
                className="btn-glow inline-flex items-center gap-2.5 rounded-2xl bg-[var(--brand-primary)] px-10 py-4 text-[15px] font-bold uppercase tracking-wider text-white transition hover:bg-[var(--brand-primary-hover)]"
              >
                {t('finalCtaButton')}
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <Link
                href="/"
                className="text-sm text-slate-500 transition hover:text-slate-300"
              >
                {t('finalCtaBack')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] bg-[#060c1f]/95 px-6 py-10 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 md:flex-row md:flex-wrap">
          <Link href="/" className="relative h-12 w-36 shrink-0">
            <Image
              src="/logo-maxis.avif"
              alt="MaxisPlus"
              fill
              sizes="144px"
              className="object-contain object-left opacity-80"
            />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 md:gap-6">
            <Link href="/" className="transition hover:text-white">
              {t('footerHome')}
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/cookies" className="transition hover:text-white">
              {t('footerCookies')}
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/politica-de-privacidade" className="transition hover:text-white">
              {t('footerPrivacy')}
            </Link>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} MaxisPlus. {t('footerCopyright')}
          </p>
        </div>
      </footer>

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
