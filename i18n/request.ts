import {cookies} from 'next/headers'
import {getRequestConfig} from 'next-intl/server'

const SUPPORTED_LOCALES = ['pt', 'en'] as const
type SupportedLocale = typeof SUPPORTED_LOCALES[number]

function isSupportedLocale(locale: string | undefined | null): locale is SupportedLocale {
  return !!locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale)
}

export default getRequestConfig(async () => {
  const store = await cookies()
  const fromCookie = store.get('locale')?.value
  const locale: SupportedLocale = isSupportedLocale(fromCookie) ? fromCookie : 'pt'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})

