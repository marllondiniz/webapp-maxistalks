import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Inter, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getBrandConfig, getBrandOgImageUrl } from '@/lib/brand'
import './globals.css'
import { CookieConsent } from './(components)/CookieConsent'
import { BrandProvider } from './(components)/BrandProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host') ?? undefined
  const brand = await getBrandConfig(host)
  const imageUrl = getBrandOgImageUrl(brand)
  return {
    metadataBase: new URL(brand.baseUrl),
    title: `${brand.name} | ${brand.tagline}`,
    description: `${brand.name} — palestras presenciais com experts que compartilham estratégias reais para escalar no digital. Inscreva-se nas próximas edições.`,
    keywords: [brand.name, 'palestras', 'eventos', 'digital', 'empreendedorismo'],
    icons: {
      icon: brand.faviconPath,
      shortcut: brand.faviconPath,
      apple: brand.faviconPath,
    },
    openGraph: {
      title: `${brand.name} | ${brand.tagline}`,
      description: 'Palestras presenciais com experts do digital. Inscreva-se nas próximas edições.',
      url: brand.baseUrl,
      siteName: brand.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${brand.name} — palestras presenciais com experts do digital`,
          type: 'image/png',
        },
      ],
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brand.name} | ${brand.tagline}`,
      description: 'Palestras presenciais com experts do digital. Inscreva-se nas próximas edições.',
      images: [imageUrl],
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const host = headersList.get('host') ?? undefined
  const brand = await getBrandConfig(host)
  const imageUrl = getBrandOgImageUrl(brand)

  const styleVars = {
    '--brand-primary': brand.primaryColor,
    '--brand-primary-hover': brand.primaryColorHover,
  } as React.CSSProperties

  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${brand.name} — palestras presenciais com experts do digital`} />
      </head>
      <body
        className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}
        style={styleVars}
      >
        <BrandProvider brand={brand}>
          {children}
          <CookieConsent />
          <Analytics />
          <SpeedInsights />
        </BrandProvider>
      </body>
    </html>
  )
}
