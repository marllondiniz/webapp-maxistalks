'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LogOut,
  Home,
  CalendarDays,
  BookOpenText,
  User,
  UsersRound,
  Trophy,
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number | string; className?: string }>
  title: string
  showInNav?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/inicio',
    label: 'Início',
    icon: Home,
    title: 'Visão geral',
  },
  {
    href: '/eventos',
    label: 'Eventos',
    icon: CalendarDays,
    title: 'Próximos eventos',
  },
  {
    href: '/blog',
    label: 'Conteúdo',
    icon: BookOpenText,
    title: 'Artigos e inspirações',
  },
  {
    href: '/clube',
    label: 'Comunidade',
    icon: UsersRound,
    title: 'A comunidade MaxisTalks',
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: User,
    title: 'Seu perfil',
  },
  {
    href: '/desafios',
    label: 'Desafios',
    icon: Trophy,
    title: 'Desafios da semana',
    showInNav: false,
  },
]

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)
  const [profileStatus, setProfileStatus] = useState<'unknown' | 'complete' | 'incomplete' | 'no-user'>(
    'unknown'
  )
  const supabase = useMemo(() => getSupabaseClient(), [])

  useEffect(() => {
    let isMounted = true

    const checkProfileStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!isMounted) return

        if (!user) {
          setProfileStatus('no-user')
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('is_complete')
          .eq('id', user.id)
          .maybeSingle()

        if (!isMounted) return

        if (error) {
          console.error('Erro ao verificar status do perfil:', error)
          setProfileStatus('complete')
          return
        }

        const isComplete = data?.is_complete !== false
        setProfileStatus(isComplete ? 'complete' : 'incomplete')
      } catch (error) {
        console.error('Erro inesperado ao verificar perfil:', error)
        if (isMounted) setProfileStatus('complete')
      }
    }

    checkProfileStatus()
    return () => { isMounted = false }
  }, [supabase, pathname])

  useEffect(() => {
    const onProfileCompleted = () => setProfileStatus('complete')
    window.addEventListener('profile-completed', onProfileCompleted)
    return () => window.removeEventListener('profile-completed', onProfileCompleted)
  }, [])

  useEffect(() => {
    if (profileStatus === 'no-user') {
      router.replace('/login')
      return
    }
    if (profileStatus === 'incomplete' && pathname && pathname !== '/perfil') {
      router.replace('/perfil')
    }
  }, [pathname, profileStatus, router])

  const activeItem = useMemo(() => {
    if (!pathname) return NAV_ITEMS[0]

    const found = NAV_ITEMS.find((item) => item.href === pathname)
    if (found) {
      return found
    }

    // Falback: rota não listada, mas dentro do grupo autenticado
    return NAV_ITEMS[0]
  }, [pathname])

  const navItemsToDisplay = useMemo(
    () => NAV_ITEMS.filter((item) => item.showInNav !== false),
    []
  )

  const handleLogout = async () => {
    if (loggingOut) return
    try {
      setLoggingOut(true)
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao sair:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-[#0f172a] px-0 text-white md:px-6 lg:px-10">
      <div className="flex min-h-screen w-full max-w-[480px] flex-col bg-[#0f172a] md:max-w-5xl xl:max-w-6xl 2xl:max-w-[1867.5px]">
        <header className="relative sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur">
          <div className="mx-auto flex h-[85.23px] w-full max-w-[1867.5px] items-center justify-between gap-4 px-5 md:px-8 lg:px-10">
            <div className="flex flex-1 justify-start" aria-hidden>
              <div className="h-10 w-10" />
            </div>
            <div className="flex flex-1 items-center justify-center">
              <Link href="/inicio">
                <Image
                  src="/maxistalks-logo.png"
                  alt="MaxisTalks"
                  width={180}
                  height={72}
                  className="h-10 w-auto max-w-[230%] sm:h-12 sm:max-w-none"
                  priority
                />
              </Link>
            </div>
            <div className="flex flex-1 justify-end">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                <LogOut size={20} />
                <span className="sr-only">Sair da conta</span>
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-white/10" aria-hidden />
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-28 pt-6 md:px-8 md:pb-16 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-[1867.5px]">{children}</div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-white/10 bg-[#0f172a]/95 backdrop-blur">
          <div className="grid h-20 w-full max-w-[480px] grid-cols-5 md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[1867.5px]">
            {navItemsToDisplay.map((item) => {
              const isActive =
                activeItem.href === item.href && activeItem.label === item.label
              const Icon = item.icon
              const navDisabled = profileStatus === 'incomplete' && item.href !== '/perfil'

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  aria-disabled={navDisabled}
                  className={`group relative flex flex-col items-center justify-center gap-1 text-xs font-medium ${
                    navDisabled ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                      isActive ? 'bg-[#3b82f6] text-white' : 'bg-transparent text-white'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'opacity-80'} />
                  </div>
                  <span
                    className={`text-[11px] uppercase tracking-wider ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}


