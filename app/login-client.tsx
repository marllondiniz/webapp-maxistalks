'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Turnstile } from '@marsidev/react-turnstile'

import { Eye, EyeOff } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { translateAuthError } from '@/lib/authErrors'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type AuthMode = 'signIn' | 'signUp' | 'reset'

const MODE_LABEL: Record<AuthMode, string> = {
  signIn: 'Entrar',
  signUp: 'Criar conta',
  reset: 'Recuperar senha',
}

export default function LoginClient() {
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
      setFeedback({ type: 'error', text: 'Informe um e-mail válido.' })
      return
    }

    if (mode !== 'reset' && password.length < 6) {
      setFeedback({ type: 'error', text: 'A senha precisa ter pelo menos 6 caracteres.' })
      return
    }

    if (mode === 'signUp' && password !== confirmPassword) {
      setFeedback({ type: 'error', text: 'As senhas não conferem.' })
      return
    }

    if (mode === 'signUp' && TURNSTILE_SITE_KEY && !turnstileToken) {
      setFeedback({ type: 'error', text: 'Complete a verificação de segurança para continuar.' })
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
              text: 'Sua conta não foi encontrada no sistema. Entre em contato com o suporte.',
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
              text: 'Sua conta não está configurada no sistema. Entre em contato com o suporte.',
            })
            return
          }

          if (profile.is_admin) {
            setFeedback({ type: 'success', text: 'Bem-vindo(a), administrador!' })
            router.replace('/admin')
            return
          }

          if (profile.is_complete === false) {
            setFeedback({ type: 'success', text: 'Complete seu perfil para continuar.' })
            router.replace('/perfil')
            return
          }

          setFeedback({ type: 'success', text: 'Login realizado com sucesso!' })
          router.replace('/inicio')
          return
        }

        setFeedback({ type: 'success', text: 'Login realizado com sucesso!' })
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
              text: verifyData?.error || 'Verificação de segurança falhou. Tente novamente.',
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

        if (userId && userEmail) {
          const response = await fetch('/api/auth/create-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: userId, email: userEmail }),
          })

          if (!response.ok) {
            console.error('Falha ao sincronizar perfil:', await response.text())
          }
        }

        if (data.session) {
          setFeedback({ type: 'success', text: 'Conta criada! Complete seu perfil para continuar.' })
          router.replace('/perfil')
          return
        }

        setFeedback({
          type: 'success',
          text: 'Conta criada! Verifique seu e-mail para confirmar o cadastro.',
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
          text: 'Se o e-mail estiver cadastrado, enviamos instruções para recuperação.',
        })
        setMode('signIn')
      }
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : 'Não foi possível completar a ação. Tente novamente.'
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

  const primaryActionLabel = MODE_LABEL[mode]

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#060c1f] px-4 py-16">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none fixed inset-0 z-50 noise-texture" />

      <div className="relative z-10 mt-8 w-full max-w-md">
        <Link href="/" className="mb-10 flex justify-center">
          <Image
            src="/maxistalks-logo.png"
            alt="MaxisTalks"
            width={220}
            height={88}
            className="h-auto w-44"
          />
        </Link>

        <div className="glass-card p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-bold text-white">
              {mode === 'signIn' && 'Bem-vindo de volta'}
              {mode === 'signUp' && 'Crie sua conta'}
              {mode === 'reset' && 'Recuperar senha'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {mode === 'signIn' && 'Acesse sua conta para gerenciar eventos e conteúdo'}
              {mode === 'signUp' && 'Junte-se ao MaxisTalks e participe de eventos exclusivos'}
              {mode === 'reset' && 'Enviaremos instruções de recuperação para seu e-mail'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-left">
              <span className="text-[13px] font-medium text-slate-300">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onInvalid={(event) =>
                  event.currentTarget.setCustomValidity('Informe um endereço de e-mail válido.')
                }
                onInput={(event) => event.currentTarget.setCustomValidity('')}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                placeholder="seu@email.com"
                required
              />
            </label>

            {mode !== 'reset' && (
              <label className="flex flex-col gap-2 text-left">
                <span className="text-[13px] font-medium text-slate-300">Senha</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-12 text-[15px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>
            )}

            {mode === 'signUp' && (
              <label className="flex flex-col gap-2 text-left">
                <span className="text-[13px] font-medium text-slate-300">Confirmar senha</span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-12 text-[15px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Repita sua senha"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
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
              className="btn-glow flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50"
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
                  Já tenho conta
                </button>
              )}
              {mode !== 'signUp' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('signUp')}
                  className="transition hover:text-white"
                >
                  Criar conta
                </button>
              )}
              {mode !== 'reset' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('reset')}
                  className="transition hover:text-white"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} MaxisPlus. Todos os direitos reservados.
        </p>
      </div>
    </main>
  )
}
