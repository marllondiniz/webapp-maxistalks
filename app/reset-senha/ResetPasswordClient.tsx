'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { translateAuthError } from '@/lib/authErrors'

type AlertState = {
  type: 'info' | 'error' | 'success'
  text: string
}

type ViewState = 'validating' | 'ready' | 'success' | 'error'

const parseHashParams = () => {
  if (typeof window === 'undefined') return new URLSearchParams()
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.substring(1)
    : window.location.hash
  return new URLSearchParams(hash)
}

export function ResetPasswordClient() {
  const supabase = useMemo(() => getSupabaseClient(), [])
  const router = useRouter()
  const [view, setView] = useState<ViewState>('validating')
  const [alert, setAlert] = useState<AlertState | null>({
    type: 'info',
    text: 'Validando link de recuperação...',
  })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const handleRedirect = async () => {
      if (typeof window === 'undefined') return

      try {
        const searchParams = new URLSearchParams(window.location.search)
        const hashParams = parseHashParams()

        const code = searchParams.get('code') ?? hashParams.get('code')
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          setView('ready')
          setAlert(null)
          return
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error
          setView('ready')
          setAlert(null)
          return
        }

        setView('error')
        setAlert({
          type: 'error',
          text: 'Link inválido ou expirado. Solicite um novo e-mail de recuperação.',
        })
      } catch (error) {
        console.error('Erro ao validar link de recuperação:', error)
        setView('error')
        const msg = error instanceof Error ? error.message : ''
        setAlert({
          type: 'error',
          text: translateAuthError(msg) || 'Não foi possível validar o link. Solicite novamente o e-mail de recuperação.',
        })
      }
    }

    void handleRedirect()
  }, [supabase])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < 6) {
      setAlert({
        type: 'error',
        text: 'A nova senha deve ter pelo menos 6 caracteres.',
      })
      return
    }

    if (password !== confirmPassword) {
      setAlert({
        type: 'error',
        text: 'As senhas informadas não conferem.',
      })
      return
    }

    try {
      setLoading(true)
      setAlert(null)

      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setView('success')
      setAlert({
        type: 'success',
        text: 'Senha atualizada com sucesso! Você será redirecionado para fazer login.',
      })

      setTimeout(() => {
        router.replace('/login')
      }, 2500)
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      const msg = error instanceof Error ? error.message : ''
      setAlert({
        type: 'error',
        text: translateAuthError(msg) || 'Não foi possível atualizar a senha. Tente novamente ou solicite um novo e-mail.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoToLogin = () => {
    router.replace('/login')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-16 text-neutral-100">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-xl backdrop-blur">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-white">Redefinir senha</h1>
          <p className="text-sm text-neutral-300">
            Informe uma nova senha segura para acessar sua conta.
          </p>
        </header>

        {alert && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              alert.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : alert.type === 'error'
                ? 'border-red-500/30 bg-red-500/10 text-red-200'
                : 'border-white/20 bg-white/5 text-neutral-200'
            }`}
          >
            {alert.text}
          </div>
        )}

        {view === 'validating' && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-sm text-neutral-200">
            <svg
              className="h-6 w-6 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Validando link…
          </div>
        )}

        {view === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-200">Nova senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                  placeholder="Digite a nova senha"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 pr-12 text-base text-neutral-100 outline-none transition focus:border-white/60 focus:ring focus:ring-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-200"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-200">Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={6}
                  required
                  placeholder="Repita a nova senha"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 pr-12 text-base text-neutral-100 outline-none transition focus:border-white/60 focus:ring focus:ring-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-200"
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-950 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Atualizando senha…' : 'Atualizar senha'}
            </button>
          </form>
        )}

        {view === 'error' && (
          <div className="space-y-4">
            <button
              onClick={handleGoToLogin}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/20"
            >
              Voltar ao login
            </button>
          </div>
        )}

        {view === 'success' && (
          <div className="space-y-4">
            <button
              onClick={handleGoToLogin}
              className="w-full rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-100 transition hover:border-emerald-400/60 hover:bg-emerald-500/30"
            >
              Ir para o login agora
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

