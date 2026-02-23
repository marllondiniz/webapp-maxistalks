'use client'

import {useLocale} from 'next-intl'

function setLocaleCookie(locale: string) {
  const oneYear = 60 * 60 * 24 * 365
  document.cookie = `locale=${encodeURIComponent(locale)}; Max-Age=${oneYear}; Path=/; SameSite=Lax`
}

export function LanguageToggle() {
  const locale = useLocale()

  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-wider text-slate-200 backdrop-blur-md">
      <button
        type="button"
        onClick={() => {
          setLocaleCookie('pt')
          window.location.reload()
        }}
        className={`rounded-full px-3 py-1.5 transition ${
          locale === 'pt' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}
        aria-pressed={locale === 'pt'}
        aria-label="Português (Brasil)"
      >
        <span aria-hidden className="text-base leading-none">🇧🇷</span>
      </button>
      <button
        type="button"
        onClick={() => {
          setLocaleCookie('en')
          window.location.reload()
        }}
        className={`rounded-full px-3 py-1.5 transition ${
          locale === 'en' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}
        aria-pressed={locale === 'en'}
        aria-label="English (United States)"
      >
        <span aria-hidden className="text-base leading-none">🇺🇸</span>
      </button>
    </div>
  )
}

