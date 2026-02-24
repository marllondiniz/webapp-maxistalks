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
  /** Se true, este tenant/deploy pode ver e usar a venda da plataforma (/plataforma e Interesses no admin). */
  enablePlataformaSales: boolean
  /** ID da Audience no Resend para newsletter/broadcast deste tenant (multi-tenant). */
  resendAudienceId: string | null
  // Landing page — Local/Endereço
  addressLine1: string | null
  addressLine2: string | null
  addressCep: string | null
  localSubheading: string | null
  mapEmbedUrl: string | null
  mapLinkUrl: string | null
  // Landing page — Seção "Sobre"
  aboutLogoUrl: string | null
  aboutShortText: string | null
  aboutLongText: string | null
  aboutButtonLabel: string | null
  aboutButtonUrl: string | null
  // Landing page — Seção "O que é"
  whatIsHeading: string | null
  whatIsImageUrl: string | null
  // Landing page — Footer
  footerLogoUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
  footerCopyrightName: string | null
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
  enablePlataformaSales: false,
  resendAudienceId: null,
  addressLine1: null,
  addressLine2: null,
  addressCep: null,
  localSubheading: null,
  mapEmbedUrl: null,
  mapLinkUrl: null,
  aboutLogoUrl: null,
  aboutShortText: null,
  aboutLongText: null,
  aboutButtonLabel: null,
  aboutButtonUrl: null,
  whatIsHeading: null,
  whatIsImageUrl: null,
  footerLogoUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  footerCopyrightName: null,
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
    enablePlataformaSales:
      process.env.ENABLE_PLATAFORMA_SALES === 'true' ||
      process.env.ENABLE_PLATAFORMA_SALES === '1' ||
      process.env.NEXT_PUBLIC_ENABLE_PLATAFORMA_SALES === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_PLATAFORMA_SALES === '1',
    resendAudienceId: process.env.RESEND_AUDIENCE_ID ?? null,
    addressLine1: null,
    addressLine2: null,
    addressCep: null,
    localSubheading: null,
    mapEmbedUrl: null,
    mapLinkUrl: null,
    aboutLogoUrl: null,
    aboutShortText: null,
    aboutLongText: null,
    aboutButtonLabel: null,
    aboutButtonUrl: null,
    whatIsHeading: null,
    whatIsImageUrl: null,
    footerLogoUrl: null,
    instagramUrl: null,
    youtubeUrl: null,
    footerCopyrightName: null,
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
      .select(`id, name, tagline, logo_url, favicon_url, og_image_url,
        primary_color, primary_color_hover, support_email, base_url, storage_key_prefix,
        enable_plataforma_sales, resend_audience_id,
        address_line1, address_line2, address_cep, local_subheading, map_embed_url, map_link_url,
        about_logo_url, about_short_text, about_long_text, about_button_label, about_button_url,
        what_is_heading, what_is_image_url,
        footer_logo_url, instagram_url, youtube_url, footer_copyright_name`)
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
      enablePlataformaSales: data.enable_plataforma_sales === true,
      resendAudienceId: data.resend_audience_id ?? null,
      addressLine1: data.address_line1 ?? null,
      addressLine2: data.address_line2 ?? null,
      addressCep: data.address_cep ?? null,
      localSubheading: data.local_subheading ?? null,
      mapEmbedUrl: data.map_embed_url ?? null,
      mapLinkUrl: data.map_link_url ?? null,
      aboutLogoUrl: data.about_logo_url ?? null,
      aboutShortText: data.about_short_text ?? null,
      aboutLongText: data.about_long_text ?? null,
      aboutButtonLabel: data.about_button_label ?? null,
      aboutButtonUrl: data.about_button_url ?? null,
      whatIsHeading: data.what_is_heading ?? null,
      whatIsImageUrl: data.what_is_image_url ?? null,
      footerLogoUrl: data.footer_logo_url ?? null,
      instagramUrl: data.instagram_url ?? null,
      youtubeUrl: data.youtube_url ?? null,
      footerCopyrightName: data.footer_copyright_name ?? null,
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
 * Helper para Server Components: obtém a config de marca (brand) da requisição atual (via headers).
 * Use quando precisar de enablePlataformaSales ou outros campos da brand no servidor.
 */
export async function getBrandForRequest(): Promise<BrandConfig> {
  const { headers } = await import('next/headers')
  const headersList = await headers()
  const host = headersList.get('host') ?? undefined
  return getBrandConfig(host)
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
