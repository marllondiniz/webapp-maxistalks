'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'

const NAV_LINKS = [
  { href: '/admin', label: 'Visão geral' },
  { href: '/admin/eventos', label: 'Eventos' },
  { href: '/admin/conteudo', label: 'Conteúdo' },
  { href: '/admin/desafios', label: 'Desafios' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/testeapp')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle()

      if (error || !data?.is_admin) {
        setDenied(true)
        return
      }

      setLoading(false)
    }

    checkAdmin()
  }, [router, supabase])

  const handleLogout = async () => {
    if (loggingOut) return
    try {
      setLoggingOut(true)
      await supabase.auth.signOut()
      router.push('/testeapp')
    } catch (error) {
      console.error('Erro ao sair do painel admin:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  if (denied) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4 text-white">
        <div className="max-w-md space-y-4 text-center">
          <h2 className="text-2xl font-bold">Acesso restrito</h2>
          <p className="text-sm text-slate-400">
            Você precisa de permissão de administrador para acessar esta área.
          </p>
          <Link href="/" className="text-[#3b82f6] underline hover:text-[#60a5fa]">
            Voltar ao início
          </Link>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4 text-white">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
          Carregando painel...
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Banner */}
      <div className="flex justify-center bg-[#3b82f6] px-4 py-2">
        <p className="text-sm font-medium text-white">Palco para quem gera valor</p>
      </div>

      <header className="border-b border-white/10 bg-[#0f172a]/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/maxistalks-logo.png"
                alt="MaxisTalks"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Painel administrativo</h1>
              <p className="text-sm text-slate-400">
                Gerencie eventos, conteúdo e desafios do MaxisTalks.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap gap-2">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      active ? 'bg-[#3b82f6] text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}

