import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { getBrandConfig } from '@/lib/brand'
import LoginClient from '../login-client'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host') ?? undefined
  const brand = await getBrandConfig(host)
  return {
    title: `Área exclusiva | ${brand.name}`,
    description: `Faça login ou crie sua conta para acessar o ${brand.name}: criar eventos, gerenciar conteúdo e palestras.`,
    openGraph: {
      title: `Área exclusiva | ${brand.name}`,
      description: `Entre para acessar o painel administrativo do ${brand.name}.`,
      url: `${brand.baseUrl}/login`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Área exclusiva | ${brand.name}`,
      description: `Entre para acessar o painel administrativo do ${brand.name}.`,
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
