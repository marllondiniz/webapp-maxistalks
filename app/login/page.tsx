import type { Metadata } from 'next'

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
  return <LoginClient />
}
