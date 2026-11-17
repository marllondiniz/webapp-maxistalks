'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LogOut,
  Home,
  CalendarDays,
  BookOpenText,
  User,
  Wrench,
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useBrand } from '@/app/(components)/BrandProvider'

type NavItem = {
  href: string
  labelKey: 'navHome' | 'navEvents' | 'navContent' | 'navTools' | 'navProfile'
  icon: React.ComponentType<{ size?: number | string; className?: string }>
  titleKey: 'navHomeTitle' | 'navEventsTitle' | 'navContentTitle' | 'navToolsTitle' | 'navProfileTitle'
  showInNav?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/inicio', labelKey: 'navHome', icon: Home, titleKey: 'navHomeTitle' },
  { href: '/eventos', labelKey: 'navEvents', icon: CalendarDays, titleKey: 'navEventsTitle' },
  { href: '/blog', labelKey: 'navContent', icon: BookOpenText, titleKey: 'navContentTitle' },
  { href: '/ferramentas', labelKey: 'navTools', icon: Wrench, titleKey: 'navToolsTitle' },
  { href: '/perfil', labelKey: 'navProfile', icon: User, titleKey: 'navProfileTitle' },
]

function isNavItemActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (pathname === href) return true
  return href !== '/inicio' && pathname.startsWith(`${href}/`)
}

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const brand = useBrand()
  const t = useTranslations('UserNav')
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)
  const [profileStatus, setProfileStatus] = useState<'unknown' | 'complete' | 'incomplete' | 'no-user'>(
    'unknown'
  )
  const supabase = useMemo(() => getSupabaseClient(), [])

  const navItemsToShow = useMemo(() => NAV_ITEMS.map((item) => ({
    ...item,
    label: t(item.labelKey),
    title: t(item.titleKey),
  })), [t])

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
      const redirect = pathname ? encodeURIComponent(pathname) : ''
      router.replace(redirect ? `/login?redirect=${redirect}` : '/login')
      return
    }
    if (profileStatus === 'incomplete' && pathname && pathname !== '/perfil') {
      router.replace('/perfil')
    }
  }, [pathname, profileStatus, router])

  const navItemsToDisplay = useMemo(
    () => navItemsToShow.filter((item) => item.showInNav !== false),
    [navItemsToShow]
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
    <div className="flex min-h-screen w-full justify-center bg-[var(--brand-surface-alt)] px-0 text-white md:px-6 lg:px-10">
      <div className="flex min-h-screen w-full max-w-[480px] flex-col bg-[var(--brand-surface-alt)] md:max-w-5xl xl:max-w-6xl 2xl:max-w-[1867.5px]">
        <header className="relative sticky top-0 z-20 bg-[var(--brand-surface-alt)]/95 backdrop-blur">
          <div className="mx-auto flex h-[85.23px] w-full max-w-[1867.5px] items-center justify-between gap-4 px-5 md:px-8 lg:px-10">
            <div className="flex flex-1 justify-start" aria-hidden>
              <div className="h-10 w-10" />
            </div>
            <div className="flex flex-1 items-center justify-center">
              <Link href="/inicio">
                <Image
                  src={brand.logoPath}
                  alt={brand.name}
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
                <span className="sr-only">{t('logoutSr')}</span>
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-white/10" aria-hidden />
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-32 pt-6 md:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-[1867.5px]">{children}</div>
        </main>

        <nav
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          aria-label="Navegação principal"
        >
          <div className="pointer-events-auto grid w-full max-w-[26.5rem] grid-cols-5 gap-1 rounded-[1.65rem] border border-white/10 bg-[var(--brand-surface)]/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/5 backdrop-blur-xl">
            {navItemsToDisplay.map((item) => {
              const isActive = isNavItemActive(pathname, item.href)
              const Icon = item.icon
              const navDisabled = profileStatus === 'incomplete' && item.href !== '/perfil'

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  aria-current={isActive ? 'page' : undefined}
                  aria-disabled={navDisabled}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[1.15rem] px-0.5 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] ${
                    navDisabled ? 'pointer-events-none opacity-40' : ''
                  } ${
                    isActive
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-button-text,#ffffff)] shadow-[0_8px_18px_color-mix(in_srgb,var(--brand-primary)_40%,transparent)]'
                      : 'text-[var(--brand-text-muted)] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                  <span className="w-full truncate text-center text-[9px] font-semibold leading-none tracking-tight min-[400px]:text-[10px]">
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


