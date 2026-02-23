import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { getTranslations, getLocale } from 'next-intl/server'
import { getBrandConfig } from '@/lib/brand'
import LoginClient from '../login-client'

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host') ?? undefined
  const brand = await getBrandConfig(host)
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'LoginMeta' })
  const params = await searchParams
  const mode = typeof params?.mode === 'string' ? params.mode : undefined
  const ref = typeof params?.ref === 'string' ? params.ref : undefined
  const isInvite = mode === 'signUp' || Boolean(ref?.trim())

  const description = isInvite
    ? t('descSignUp', { name: brand.name })
    : t('descSignIn', { name: brand.name })
  const title = isInvite ? `${t('titleSignUp')} | ${brand.name}` : `${t('titleSignIn')} | ${brand.name}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${brand.baseUrl}/login`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#060c1f]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" /></div>}>
      <LoginClient />
    </Suspense>
  )
}
