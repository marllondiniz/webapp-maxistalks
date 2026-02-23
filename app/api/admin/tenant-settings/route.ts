import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfigFromRequest } from '@/lib/brand'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_FIELDS = [
  'name', 'tagline', 'logo_url', 'favicon_url', 'og_image_url',
  'primary_color', 'primary_color_hover', 'support_email',
  'address_line1', 'address_line2', 'address_cep', 'local_subheading',
  'map_embed_url', 'map_link_url',
  'about_logo_url', 'about_short_text', 'about_long_text',
  'about_button_label', 'about_button_url',
  'footer_logo_url', 'instagram_url', 'youtube_url', 'footer_copyright_name',
] as const

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

async function getAuthUser(request: NextRequest) {
  const token = getBearerToken(request)
  if (!token) return null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error) return null
  return user
}

async function checkIsAdmin(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle()
  return data?.is_admin === true
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const isAdmin = await checkIsAdmin(user.id)
    if (!isAdmin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { brand } = await getBrandConfigFromRequest(request)
    const supabase = getSupabaseAdmin()
    const host = request.headers.get('host') ?? ''
    const domain = host.split(':')[0].toLowerCase()

    const { data, error } = await supabase
      .from('tenants')
      .select(`id, domain, name, tagline, logo_url, favicon_url, og_image_url,
        primary_color, primary_color_hover, support_email, base_url, storage_key_prefix,
        address_line1, address_line2, address_cep, local_subheading, map_embed_url, map_link_url,
        about_logo_url, about_short_text, about_long_text, about_button_label, about_button_url,
        footer_logo_url, instagram_url, youtube_url, footer_copyright_name`)
      .eq('domain', domain)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Tenant não encontrado', brand }, { status: 404 })
    }

    return NextResponse.json({ tenant: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro inesperado'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const isAdmin = await checkIsAdmin(user.id)
    if (!isAdmin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const body = await request.json()
    const supabase = getSupabaseAdmin()
    const host = request.headers.get('host') ?? ''
    const domain = host.split(':')[0].toLowerCase()

    // Filtra apenas os campos permitidos
    const updates: Record<string, unknown> = {}
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        updates[field] = body[field] === '' ? null : body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('domain', domain)
      .select()
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tenant: data, success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro inesperado'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
