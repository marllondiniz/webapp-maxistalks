import type { Metadata } from 'next'
import { Suspense } from 'react'

import LoginClient from '../login-client'

export const metadata: Metadata = {
  title: 'Área exclusiva | MaxisTalks',
  description:
    'Faça login ou crie sua conta para acessar o MaxisTalks: criar eventos, gerenciar conteúdo e palestras.',
  openGraph: {
    title: 'Área exclusiva | MaxisTalks',
    description:
      'Entre para acessar o painel administrativo do MaxisTalks.',
    url: 'https://maxistalks.com/login',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Área exclusiva | MaxisTalks',
    description:
      'Entre para acessar o painel administrativo do MaxisTalks.',
  },
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#060c1f]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" /></div>}>
      <LoginClient />
    </Suspense>
  )
}
