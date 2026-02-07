import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'
import { CookieConsent } from './(components)/CookieConsent'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://maxis.plus'
const imageUrl = `${baseUrl}/maxistalks-joao4.jpeg`

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
  title: 'MaxisTalks | MaxisPlus',
  description:
    'Inscreva-se na lista de espera para as próximas edições do MaxisTalks',
  keywords: ['MaxisTalks', 'MaxisPlus', 'palestras', 'eventos', 'João Muzzy'],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'MaxisTalks | MaxisPlus',
    description:
      'Inscreva-se na lista de espera para as próximas edições do MaxisTalks',
    url: `${baseUrl}/hub/maxistalks`,
    siteName: 'MaxisPlus',
    images: [
      {
        url: imageUrl,
        width: 1080,
        height: 1350,
        alt: 'MaxisTalks - João Muzzy',
        type: 'image/jpeg',
      },
    ],
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaxisTalks | MaxisPlus',
    description:
      'Inscreva-se na lista de espera para as próximas edições do MaxisTalks',
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
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1080" />
        <meta property="og:image:height" content="1350" />
        <meta property="og:image:alt" content="MaxisTalks - João Muzzy" />
      </head>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
