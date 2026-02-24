import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfig } from '@/lib/brand'

/**
 * GET /api/auth/link?token=xxx
 * Consome um token de uso único (enviado no e-mail de broadcast), gera um magic link
 * do Supabase para o usuário e redireciona. Após clicar, a pessoa entra já logada e
 * é redirecionada para o artigo (redirect_path).
 *
 * Configuração: em Supabase Dashboard → Authentication → URL Configuration,
 * adicione a URL do site (ex.: https://seusite.com) e, se usar wildcard, https://seusite.com/*
 * em "Redirect URLs" para o redirect pós-magic-link funcionar.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token || token.length < 16) {
      return NextResponse.redirect(new URL('/login', request.url), 302)
    }

    const supabase = getSupabaseAdmin()

    const { data: row, error: fetchError } = await supabase
      .from('auth_link_tokens')
      .select('id, user_id, redirect_path, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (fetchError || !row) {
      return NextResponse.redirect(new URL('/login', request.url), 302)
    }

    const expiresAt = new Date(row.expires_at)
    if (expiresAt.getTime() < Date.now()) {
      await supabase.from('auth_link_tokens').delete().eq('id', row.id)
      return NextResponse.redirect(new URL('/login', request.url), 302)
    }

    const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(row.user_id)
    if (userError || !authUser?.user?.email) {
      await supabase.from('auth_link_tokens').delete().eq('id', row.id)
      return NextResponse.redirect(new URL('/login', request.url), 302)
    }

    const host = request.headers.get('host') ?? undefined
    const brand = await getBrandConfig(host)
    const baseUrl = brand.baseUrl.replace(/\/$/, '')
    const redirectTo = `${baseUrl}${row.redirect_path.startsWith('/') ? row.redirect_path : `/${row.redirect_path}`}`

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: authUser.user.email,
      options: { redirectTo },
    })

    await supabase.from('auth_link_tokens').delete().eq('id', row.id)

    const actionLink = (linkData?.properties as { action_link?: string } | undefined)?.action_link ?? null

    if (linkError || !actionLink) {
      return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(row.redirect_path), request.url), 302)
    }

    return NextResponse.redirect(actionLink, 302)
  } catch {
    const base = new URL(request.url).origin
    return NextResponse.redirect(base + '/login', 302)
  }
}
