'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { translateAuthError } from '@/lib/authErrors'
import { useBrand } from '@/app/(components)/BrandProvider'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type AuthMode = 'signIn' | 'signUp' | 'reset'

export default function LoginClient() {
  const brand = useBrand()
  const t = useTranslations('Login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const modeParam = searchParams.get('mode')

  const initialMode = useMemo<AuthMode>(() => {
    if (modeParam === 'signUp' || modeParam === 'cadastro') return 'signUp'
    if (modeParam === 'reset') return 'reset'
    return 'signIn'
  }, [modeParam])

  useEffect(() => {
    router.prefetch('/perfil')
    router.prefetch('/inicio')
    router.prefetch('/admin')
  }, [router])

  useEffect(() => {
    let isMounted = true
    const checkSession = async () => {
      const supabase = getSupabaseClient()
      // getUser() valida com o servidor; getSession() só lê do cache e pode retornar sessão de conta deletada
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted || !user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_complete')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.is_admin) {
        router.replace('/admin')
        return
      }
      if (profile?.is_complete === false) {
        router.replace('/perfil')
        return
      }
      router.replace('/inicio')
    }
    checkSession()
    return () => { isMounted = false }
  }, [router])
  const [mode, setMode] = useState<AuthMode>(initialMode)

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const origin = useMemo(
    () => (typeof window !== 'undefined' ? window.location.origin : ''),
    []
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)

    if (!email) {
      setFeedback({ type: 'error', text: t('emailInvalid') })
      return
    }

    if (mode !== 'reset' && password.length < 6) {
      setFeedback({ type: 'error', text: t('passwordMinLength') })
      return
    }

    if (mode === 'signUp' && password !== confirmPassword) {
      setFeedback({ type: 'error', text: t('passwordsDontMatch') })
      return
    }

    if (mode === 'signUp' && TURNSTILE_SITE_KEY && !turnstileToken) {
      setFeedback({ type: 'error', text: t('turnstileRequired') })
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseClient()

      if (mode === 'signIn') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          throw error
        }

        const userId = data.user?.id
        if (userId) {
          // Valida no servidor se o usuário ainda existe em auth.users
          const verifyRes = await fetch('/api/auth/verify-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyData?.valid) {
            await supabase.auth.signOut()
            setFeedback({
              type: 'error',
              text: t('accountNotFound'),
            })
            return
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin, is_complete')
            .eq('id', userId)
            .maybeSingle()

          // Usuário sem perfil = conta deletada ou inexistente no sistema
          if (!profile) {
            await supabase.auth.signOut()
            setFeedback({
              type: 'error',
              text: t('accountNotConfigured'),
            })
            return
          }

          if (profile.is_admin) {
            setFeedback({ type: 'success', text: t('welcomeAdmin') })
            router.replace('/admin')
            return
          }

          if (profile.is_complete === false) {
            setFeedback({ type: 'success', text: t('completeProfile') })
            router.replace('/perfil')
            return
          }

          setFeedback({ type: 'success', text: t('loginSuccess') })
          router.replace('/inicio')
          return
        }

        setFeedback({ type: 'success', text: t('loginSuccess') })
        router.replace('/inicio')
      }

      if (mode === 'signUp') {
        if (TURNSTILE_SITE_KEY && turnstileToken) {
          const verifyRes = await fetch('/api/auth/verify-turnstile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: turnstileToken }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyData?.success) {
            setFeedback({
              type: 'error',
              text: verifyData?.error || t('verifySecurityFailed'),
            })
            setTurnstileToken(null)
            return
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: origin ? `${origin}/perfil` : undefined,
          },
        })

        if (error) {
          throw error
        }

        const userId = data.user?.id
        const userEmail = data.user?.email ?? email
        const refReferrer = searchParams.get('ref')

        if (userId && userEmail) {
          const body: { id: string; email: string; ref?: string } = { id: userId, email: userEmail }
          if (refReferrer?.trim()) body.ref = refReferrer.trim()
          const response = await fetch('/api/auth/create-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })

          if (!response.ok) {
            console.error('Falha ao sincronizar perfil:', await response.text())
          }
        }

        if (data.session) {
          setFeedback({ type: 'success', text: t('createProfileSuccess') })
          router.replace('/perfil')
          return
        }

        setFeedback({
          type: 'success',
          text: t('checkEmailSuccess'),
        })
        setMode('signIn')
        setPassword('')
        setConfirmPassword('')
        setTurnstileToken(null)
      }

      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: origin ? `${origin}/reset-senha` : undefined,
        })

        if (error) {
          throw error
        }

        setFeedback({
          type: 'success',
          text: t('resetSuccess'),
        })
        setMode('signIn')
      }
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : t('actionDefaultError')
      setFeedback({ type: 'error', text: translateAuthError(rawMessage) })
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = (newMode: AuthMode) => {
    setFeedback(null)
    setMode(newMode)
    if (newMode !== 'signUp') {
      setTurnstileToken(null)
      setConfirmPassword('')
    }
    const path = newMode === 'signUp' ? '/login?mode=signUp' : newMode === 'reset' ? '/login?mode=reset' : '/login'
    router.replace(path, { scroll: false })
  }

  const primaryActionLabel = mode === 'signIn' ? t('signIn') : mode === 'signUp' ? t('signUp') : t('reset')

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#060c1f] px-4 py-16">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none fixed inset-0 z-50 noise-texture" />

      <div className="relative z-10 mt-8 w-full max-w-md">
        <Link href="/" className="mb-10 flex justify-center">
          <Image
src={brand.logoPath}
              alt={brand.name}
            width={220}
            height={88}
            className="h-auto w-44"
          />
        </Link>

        <div className="glass-card p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-bold text-white">
              {mode === 'signIn' && t('titleWelcomeBack')}
              {mode === 'signUp' && t('titleCreateAccount')}
              {mode === 'reset' && t('titleResetPassword')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {mode === 'signIn' && t('subtitleSignIn')}
              {mode === 'signUp' && t('subtitleSignUp', { name: brand.name })}
              {mode === 'reset' && t('subtitleReset')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-left">
              <span className="text-[13px] font-medium text-slate-300">{t('emailLabel')}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onInvalid={(event) =>
                  event.currentTarget.setCustomValidity(t('emailInvalidPlaceholder'))
                }
                onInput={(event) => event.currentTarget.setCustomValidity('')}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                placeholder={t('emailPlaceholder')}
                required
              />
            </label>

            {mode !== 'reset' && (
              <label className="flex flex-col gap-2 text-left">
                <span className="text-[13px] font-medium text-slate-300">{t('passwordLabel')}</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-12 text-[15px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                    placeholder={t('passwordPlaceholder')}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>
            )}

            {mode === 'signUp' && (
              <label className="flex flex-col gap-2 text-left">
                <span className="text-[13px] font-medium text-slate-300">{t('confirmPasswordLabel')}</span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-12 text-[15px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                    placeholder={t('confirmPasswordPlaceholder')}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>
            )}

            {mode === 'signUp' && TURNSTILE_SITE_KEY && (
              <div className="flex justify-center">
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{
                    theme: 'dark',
                    size: 'normal',
                  }}
                />
              </div>
            )}

            {feedback && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  feedback.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-400/30 bg-red-500/10 text-red-300'
                }`}
              >
                {feedback.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-glow flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                primaryActionLabel
              )}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] text-slate-500">
              {mode !== 'signIn' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('signIn')}
                  className="transition hover:text-white"
                >
                  {t('alreadyHaveAccount')}
                </button>
              )}
              {mode !== 'signUp' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('signUp')}
                  className="transition hover:text-white"
                >
                  {t('createAccount')}
                </button>
              )}
              {mode !== 'reset' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('reset')}
                  className="transition hover:text-white"
                >
                  {t('forgotPassword')}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          {t('copyright', { year: String(new Date().getFullYear()) })}
        </p>
      </div>
    </main>
  )
}
