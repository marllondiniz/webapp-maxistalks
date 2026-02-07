'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import { getSupabaseClient } from '@/lib/supabaseClient'

type AuthMode = 'signIn' | 'signUp' | 'reset'

const MODE_LABEL: Record<AuthMode, string> = {
  signIn: 'Entrar',
  signUp: 'Criar conta',
  reset: 'Recuperar senha',
}

export default function LoginClient() {
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/perfil')
    router.prefetch('/inicio')
    router.prefetch('/admin')
  }, [router])

  useEffect(() => {
    let isMounted = true
    const checkSession = async () => {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!isMounted || !session?.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_complete')
        .eq('id', session.user.id)
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
  const [mode, setMode] = useState<AuthMode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin, is_complete')
            .eq('id', userId)
            .maybeSingle()

          if (profile?.is_admin) {
            setFeedback({ type: 'success', text: 'Bem-vindo(a), administrador!' })
            router.replace('/admin')
            return
          }

          if (profile?.is_complete === false) {
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
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível completar a ação. Tente novamente.'
      setFeedback({ type: 'error', text: message })
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = (newMode: AuthMode) => {
    setFeedback(null)
    setMode(newMode)

    if (newMode !== 'signUp') {
      setConfirmPassword('')
    }
  }

  const primaryActionLabel = MODE_LABEL[mode]

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#060c1f] px-4 py-16">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none fixed inset-0 z-50 noise-texture" />

      {/* Banner */}
      <div className="absolute left-0 right-0 top-0 z-10 flex justify-center bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#2563eb] px-4 py-3">
        <p className="text-[13px] font-medium tracking-wide text-white/90">Palco para quem gera valor</p>
      </div>

      <div className="relative z-10 mt-14 w-full max-w-md">
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
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </label>
            )}

            {mode === 'signUp' && (
              <label className="flex flex-col gap-2 text-left">
                <span className="text-[13px] font-medium text-slate-300">Confirmar senha</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Repita sua senha"
                  required
                  minLength={6}
                />
              </label>
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
