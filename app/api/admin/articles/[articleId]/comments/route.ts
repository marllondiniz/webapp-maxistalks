import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getBrandConfigFromRequest } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export type AdminArticleCommentItem = {
  id: string
  body: string
  created_at: string
  user_id: string
  parent_id: string | null
  author_name: string | null
  author_email: string | null
  author_avatar_url: string | null
}

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

async function getAdminUserId(request: NextRequest): Promise<string | null> {
  const token = getBearerToken(request)
  let userId: string | null = null

  if (token) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && anonKey) {
      const supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (!error && user) userId = user.id
    }
  }
  if (!userId) {
    const server = getSupabaseServer()
    const { data: { user }, error } = await server.auth.getUser()
    if (!error && user) userId = user.id
  }
  if (!userId) return null

  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle()
  return profile?.is_admin ? userId : null
}

/** GET: listar comentários do artigo (admin). */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  const userId = await getAdminUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { articleId } = await context.params
  if (!articleId) {
    return NextResponse.json({ error: 'ID do artigo é obrigatório.' }, { status: 400 })
  }

  const { tenantId } = await getBrandConfigFromRequest(request)
  const supabaseAdmin = getSupabaseAdmin()

  let articleQuery = supabaseAdmin.from('articles').select('id').eq('id', articleId)
  if (tenantId) articleQuery = articleQuery.eq('tenant_id', tenantId)
  const { data: article, error: articleErr } = await articleQuery.maybeSingle()
  if (articleErr || !article) {
    return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 })
  }

  const { data: comments, error } = await supabaseAdmin
    .from('article_comments')
    .select('id, body, created_at, user_id, parent_id')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar comentários (admin):', error)
    return NextResponse.json({ error: 'Erro ao buscar comentários.' }, { status: 500 })
  }

  if (!comments?.length) {
    return NextResponse.json({ comments: [] })
  }

  const userIds = [...new Set(comments.map((c) => c.user_id))]
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, nome, email, avatar_url')
    .in('id', userIds)

  const profileByUserId = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      {
        name: (p.nome && p.nome.trim()) || p.email || null,
        email: p.email ?? null,
        avatar_url: p.avatar_url ?? null,
      },
    ])
  )

  const items: AdminArticleCommentItem[] = (comments ?? []).map((c) => {
    const profile = profileByUserId.get(c.user_id)
    return {
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      user_id: c.user_id,
      parent_id: c.parent_id ?? null,
      author_name: profile?.name ?? null,
      author_email: profile?.email ?? null,
      author_avatar_url: profile?.avatar_url ?? null,
    }
  })

  return NextResponse.json({ comments: items })
}

/** DELETE: apagar um comentário (admin). */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  const userId = await getAdminUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { articleId } = await context.params
  const commentId = request.nextUrl.searchParams.get('commentId')
  if (!articleId || !commentId) {
    return NextResponse.json({ error: 'articleId e commentId são obrigatórios.' }, { status: 400 })
  }

  const { tenantId } = await getBrandConfigFromRequest(request)
  const supabaseAdmin = getSupabaseAdmin()

  let articleQuery = supabaseAdmin.from('articles').select('id').eq('id', articleId)
  if (tenantId) articleQuery = articleQuery.eq('tenant_id', tenantId)
  const { data: article, error: articleErr } = await articleQuery.maybeSingle()
  if (articleErr || !article) {
    return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('article_comments')
    .delete()
    .eq('id', commentId)
    .eq('article_id', articleId)

  if (error) {
    console.error('Erro ao apagar comentário (admin):', error)
    return NextResponse.json({ error: 'Erro ao apagar comentário.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
