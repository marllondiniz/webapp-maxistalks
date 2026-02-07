import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'
import { CookieConsent } from './(components)/CookieConsent'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://maxistalks.com'
const imageUrl = `${baseUrl}/maxistalks-logo.png`

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

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'MaxisTalks | Palco para quem gera valor',
  description:
    'MaxisTalks — palestras presenciais com experts que compartilham estratégias reais para escalar no digital. Inscreva-se nas próximas edições.',
  keywords: ['MaxisTalks', 'palestras', 'eventos', 'digital', 'empreendedorismo'],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'MaxisTalks | Palco para quem gera valor',
    description:
      'Palestras presenciais com experts do digital. Inscreva-se nas próximas edições.',
    url: baseUrl,
    siteName: 'MaxisTalks',
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: 'MaxisTalks — palestras presenciais com experts do digital',
        type: 'image/png',
      },
    ],
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaxisTalks | Palco para quem gera valor',
    description:
      'Palestras presenciais com experts do digital. Inscreva-se nas próximas edições.',
    images: [imageUrl],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="MaxisTalks — palestras presenciais com experts do digital" />
      </head>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
