import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { getBrandConfig } from '@/lib/brand'

/** Metadata apenas da rota /plataforma. Não altera as demais páginas do site (MaxisTalks). */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'Plataforma' })
  const headersList = await headers()
  const host = headersList.get('host') ?? undefined
  const brand = await getBrandConfig(host)
  const base = brand.baseUrl.replace(/\/$/, '')
  const imageUrl = `${base}/logo-maxis.avif`
  const title = t('metaTitle')
  const description = t('metaDesc')
  const ogLocale = locale === 'en' ? 'en_US' : 'pt_BR'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/plataforma`,
      siteName: brand.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/avif',
        },
      ],
      type: 'website',
      locale: ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default function PlataformaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
