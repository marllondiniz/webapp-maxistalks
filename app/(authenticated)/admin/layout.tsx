'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, BarChart3, Calendar, FileText, LogOut, Menu, X } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useBrand } from '@/app/(components)/BrandProvider'

const NAV_LINKS = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { href: '/admin/conteudo', label: 'Conteúdo', icon: FileText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const brand = useBrand()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
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
      router.push('/login')
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
          <Link href="/" className="text-[var(--brand-primary)] underline hover:opacity-90">
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
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
          Carregando painel...
        </div>
      </main>
    )
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0f172a] shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <Link href="/" onClick={closeSidebar} className="flex-shrink-0">
            <Image src={brand.logoPath} alt={brand.name} width={100} height={40} className="h-8 w-auto" />
          </Link>
          <button type="button" onClick={closeSidebar} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
            <nav className="space-y-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? 'bg-[#3b82f6] text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  closeSidebar()
                  handleLogout()
                }}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {loggingOut ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-h-screen">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-4 py-4 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex-shrink-0">
              <Image
                src={brand.logoPath}
                alt={brand.name}
                width={100}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <div className="w-10" />
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
    </div>
  )
}

