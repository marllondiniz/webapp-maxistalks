'use client'

import { createContext, useContext, useMemo } from 'react'
import type { BrandConfig } from '@/lib/brand'

const BrandContext = createContext<BrandConfig | null>(null)

export function BrandProvider({
  brand,
  children,
}: {
  brand: BrandConfig
  children: React.ReactNode
}) {
  const value = useMemo(() => brand, [brand])
  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand(): BrandConfig {
  const ctx = useContext(BrandContext)
  if (!ctx) {
    // Fallback para build/SSR ou quando o provider não está acima
    return {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'MaxisTalks',
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || 'Palco para quem gera valor',
      logoPath: process.env.NEXT_PUBLIC_LOGO_PATH || '/maxistalks-logo.png',
      faviconPath: process.env.NEXT_PUBLIC_FAVICON_PATH || process.env.NEXT_PUBLIC_LOGO_PATH || '/maxistalks-logo.png',
      ogImagePath: process.env.NEXT_PUBLIC_OG_IMAGE_PATH || process.env.NEXT_PUBLIC_LOGO_PATH || '/maxistalks-logo.png',
      primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR ? `#${String(process.env.NEXT_PUBLIC_PRIMARY_COLOR).replace(/^#/, '')}` : '#3b82f6',
      primaryColorHover: process.env.NEXT_PUBLIC_PRIMARY_COLOR_HOVER ? `#${String(process.env.NEXT_PUBLIC_PRIMARY_COLOR_HOVER).replace(/^#/, '')}` : '#2563eb',
      supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'contato@maxistalks.com',
      baseUrl: (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://maxistalks.com').replace(/\/$/, ''),
      storageKeyPrefix: process.env.NEXT_PUBLIC_STORAGE_KEY_PREFIX || 'maxistalks',
      tenantId: null,
    }
  }
  return ctx
}
