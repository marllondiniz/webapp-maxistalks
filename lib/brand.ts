/**
 * White label: configuração de marca (tenant).
 * Suporta configuração por variáveis de ambiente (single-tenant) ou por tabela tenants no banco (multi-tenant por domínio).
 */

export type BrandConfig = {
  name: string
  tagline: string
  logoPath: string
  faviconPath: string
  ogImagePath: string
  primaryColor: string
  primaryColorHover: string
  supportEmail: string
  baseUrl: string
  storageKeyPrefix: string
  /** UUID do tenant no banco (null quando vem de env ou tenant não encontrado). */
  tenantId: string | null
}

const DEFAULT_BRAND: BrandConfig = {
  name: 'MaxisTalks',
  tagline: 'Palco para quem gera valor',
  logoPath: '/maxistalks-logo.png',
  faviconPath: '/maxistalks-logo.png',
  ogImagePath: '/maxistalks-logo.png',
  primaryColor: '#3b82f6',
  primaryColorHover: '#2563eb',
  supportEmail: 'contato@maxistalks.com',
  baseUrl: 'https://maxistalks.com',
  storageKeyPrefix: 'maxistalks',
  tenantId: null,
}

/**
 * Retorna configuração de marca a partir das variáveis de ambiente.
 * Use para single-tenant (um deploy por cliente) ou fallback quando não houver tenant no banco.
 */
export function getBrandFromEnv(): BrandConfig {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '') || DEFAULT_BRAND.baseUrl
  const name = process.env.NEXT_PUBLIC_APP_NAME || DEFAULT_BRAND.name
  return {
    name,
    tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || DEFAULT_BRAND.tagline,
    logoPath: process.env.NEXT_PUBLIC_LOGO_PATH || DEFAULT_BRAND.logoPath,
    faviconPath: process.env.NEXT_PUBLIC_FAVICON_PATH || process.env.NEXT_PUBLIC_LOGO_PATH || DEFAULT_BRAND.faviconPath,
    ogImagePath: process.env.NEXT_PUBLIC_OG_IMAGE_PATH || process.env.NEXT_PUBLIC_LOGO_PATH || DEFAULT_BRAND.ogImagePath,
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR ? `#${process.env.NEXT_PUBLIC_PRIMARY_COLOR.replace(/^#/, '')}` : DEFAULT_BRAND.primaryColor,
    primaryColorHover: process.env.NEXT_PUBLIC_PRIMARY_COLOR_HOVER ? `#${process.env.NEXT_PUBLIC_PRIMARY_COLOR_HOVER.replace(/^#/, '')}` : DEFAULT_BRAND.primaryColorHover,
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || DEFAULT_BRAND.supportEmail,
    baseUrl,
    storageKeyPrefix: process.env.NEXT_PUBLIC_STORAGE_KEY_PREFIX || DEFAULT_BRAND.storageKeyPrefix,
    tenantId: null,
  }
}

/**
 * Normaliza o host (remove porta, lowercase) para lookup no banco.
 */
function normalizeHost(host: string | null | undefined): string | null {
  if (!host || typeof host !== 'string') return null
  const trimmed = host.trim().toLowerCase()
  const withoutPort = trimmed.split(':')[0]
  return withoutPort || null
}

/**
 * Busca tenant no banco pelo domínio da requisição.
 * Retorna null se não encontrar ou se o banco não estiver configurado.
 */
export async function getTenantByDomain(host: string): Promise<BrandConfig | null> {
  const domain = normalizeHost(host)
  if (!domain) return null

  try {
    const { getSupabaseAdmin } = await import('./supabaseAdmin')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, tagline, logo_url, favicon_url, og_image_url, primary_color, primary_color_hover, support_email, base_url, storage_key_prefix')
      .eq('domain', domain)
      .maybeSingle()

    if (error || !data) return null

    const primaryColor = data.primary_color ? (data.primary_color.startsWith('#') ? data.primary_color : `#${data.primary_color}`) : DEFAULT_BRAND.primaryColor
    const primaryColorHover = data.primary_color_hover ? (data.primary_color_hover.startsWith('#') ? data.primary_color_hover : `#${data.primary_color_hover}`) : DEFAULT_BRAND.primaryColorHover

    return {
      name: data.name ?? DEFAULT_BRAND.name,
      tagline: data.tagline ?? DEFAULT_BRAND.tagline,
      logoPath: data.logo_url ?? DEFAULT_BRAND.logoPath,
      faviconPath: data.favicon_url ?? data.logo_url ?? DEFAULT_BRAND.faviconPath,
      ogImagePath: data.og_image_url ?? data.logo_url ?? DEFAULT_BRAND.ogImagePath,
      primaryColor,
      primaryColorHover,
      supportEmail: data.support_email ?? DEFAULT_BRAND.supportEmail,
      baseUrl: data.base_url ?? DEFAULT_BRAND.baseUrl,
      storageKeyPrefix: data.storage_key_prefix ?? DEFAULT_BRAND.storageKeyPrefix,
      tenantId: data.id ?? null,
    }
  } catch {
    return null
  }
}

/**
 * Retorna a configuração de marca para a requisição atual.
 * Tenta primeiro o tenant pelo domínio (banco); se não houver, usa variáveis de ambiente.
 * Use em Server Components, Route Handlers e em generateMetadata.
 */
export async function getBrandConfig(host?: string | null): Promise<BrandConfig> {
  if (host) {
    const tenant = await getTenantByDomain(host)
    if (tenant) return tenant
  }
  return getBrandFromEnv()
}

/**
 * Helper para Route Handlers: obtém a config de marca e o tenantId a partir do request.
 * Retorna { brand, tenantId }. tenantId é null se não houver tenant no banco para o host.
 */
export async function getBrandConfigFromRequest(request: Request): Promise<{ brand: BrandConfig; tenantId: string | null }> {
  const host = request.headers.get('host') ?? undefined
  const brand = await getBrandConfig(host)
  return { brand, tenantId: brand.tenantId }
}

/**
 * Helper para Server Components: obtém o tenantId da requisição atual (via headers).
 * Use com await getTenantIdForRequest() e passe para getEvents(tenantId), getArticles(tipo, tenantId), etc.
 */
export async function getTenantIdForRequest(): Promise<string | null> {
  const { headers } = await import('next/headers')
  const headersList = await headers()
  const host = headersList.get('host') ?? undefined
  const brand = await getBrandConfig(host)
  return brand.tenantId
}

/**
 * URL absoluta para a logo (para OG image, e-mails, etc.)
 */
export function getBrandLogoUrl(brand: BrandConfig): string {
  const base = brand.baseUrl.replace(/\/$/, '')
  const path = brand.logoPath.startsWith('/') ? brand.logoPath : `/${brand.logoPath}`
  return `${base}${path}`
}

export function getBrandOgImageUrl(brand: BrandConfig): string {
  const base = brand.baseUrl.replace(/\/$/, '')
  const path = brand.ogImagePath.startsWith('/') ? brand.ogImagePath : `/${brand.ogImagePath}`
  return `${base}${path}`
}
