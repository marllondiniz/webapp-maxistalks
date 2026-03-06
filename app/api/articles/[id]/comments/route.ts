import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

/** Cria cliente Supabase com o JWT do usuário (sessão no localStorage no client envia no header). */
function createSupabaseWithToken(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

export type ArticleCommentItem = {
  id: string
  body: string
  created_at: string
  user_id: string
  parent_id: string | null
  author_name: string | null
  author_avatar_url: string | null
  author_bio: string | null
  author_linkedin: string | null
  author_instagram: string | null
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: articleId } = await context.params
  if (!articleId) {
    return NextResponse.json({ error: 'ID do artigo é obrigatório.' }, { status: 400 })
  }

  const supabase = getSupabaseServer()
  const { data: comments, error } = await supabase
    .from('article_comments')
    .select('id, body, created_at, user_id, parent_id')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar comentários:', error)
    return NextResponse.json({ error: 'Erro ao buscar comentários.' }, { status: 500 })
  }

  if (!comments?.length) {
    return NextResponse.json({ comments: [] })
  }

  const userIds = [...new Set(comments.map((c) => c.user_id))]
  const admin = getSupabaseAdmin()
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, nome, email, avatar_url, bio, linkedin, instagram')
    .in('id', userIds)

  const profileByUserId = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      {
        name: (p.nome && p.nome.trim()) || p.email || null,
        avatar_url: p.avatar_url ?? null,
        bio: p.bio?.trim() || null,
        linkedin: p.linkedin?.trim() || null,
        instagram: p.instagram?.trim() || null,
      },
    ])
  )

  const items: ArticleCommentItem[] = (comments ?? []).map((c) => {
    const profile = profileByUserId.get(c.user_id)
    return {
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      user_id: c.user_id,
      parent_id: c.parent_id ?? null,
      author_name: profile?.name ?? null,
      author_avatar_url: profile?.avatar_url ?? null,
      author_bio: profile?.bio ?? null,
      author_linkedin: profile?.linkedin ?? null,
      author_instagram: profile?.instagram ?? null,
    }
  })

  return NextResponse.json({ comments: items })
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: articleId } = await context.params
  if (!articleId) {
    return NextResponse.json({ error: 'ID do artigo é obrigatório.' }, { status: 400 })
  }

  const auth = await getAuthenticatedUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Faça login para comentar.' }, { status: 401 })
  }
  const { user, supabase } = auth

  let body: { body?: string; parent_id?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }

  const text = typeof body.body === 'string' ? body.body.trim() : ''
  if (!text) {
    return NextResponse.json({ error: 'O comentário não pode estar vazio.' }, { status: 400 })
  }

  const parentId = typeof body.parent_id === 'string' && body.parent_id.trim() ? body.parent_id.trim() : null
  if (parentId) {
    const { data: parent } = await supabase
      .from('article_comments')
      .select('id')
      .eq('id', parentId)
      .eq('article_id', articleId)
      .maybeSingle()
    if (!parent) {
      return NextResponse.json({ error: 'Comentário pai não encontrado.' }, { status: 400 })
    }
  }

  const { data, error } = await supabase
    .from('article_comments')
    .insert({
      article_id: articleId,
      user_id: user.id,
      body: text,
      ...(parentId ? { parent_id: parentId } : {}),
    })
    .select('id, body, created_at, user_id, parent_id')
    .single()

  if (error) {
    if (error.code === '23503') {
      return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 })
    }
    console.error('Erro ao criar comentário:', error)
    return NextResponse.json({ error: 'Erro ao publicar comentário.' }, { status: 500 })
  }

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('nome, email, avatar_url, bio, linkedin, instagram')
    .eq('id', user.id)
    .maybeSingle()

  const authorName = (profile?.nome && profile.nome.trim()) || profile?.email || null

  const item: ArticleCommentItem = {
    id: data.id,
    body: data.body,
    created_at: data.created_at,
    user_id: data.user_id,
    parent_id: data.parent_id ?? null,
    author_name: authorName,
    author_avatar_url: profile?.avatar_url ?? null,
    author_bio: profile?.bio?.trim() || null,
    author_linkedin: profile?.linkedin?.trim() || null,
    author_instagram: profile?.instagram?.trim() || null,
  }

  return NextResponse.json({ comment: item })
}

/** Obtém o usuário autenticado (cookie ou Bearer token). */
async function getAuthenticatedUser(request: Request): Promise<{ user: { id: string }; supabase: ReturnType<typeof createSupabaseWithToken> } | null> {
  const authHeader = request.headers.get('Authorization')
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (accessToken) {
    const clientWithToken = createSupabaseWithToken(accessToken)
    const { data: { user }, error } = await clientWithToken.auth.getUser()
    if (!error && user) return { user, supabase: clientWithToken }
  }

  const supabase = getSupabaseServer()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!error && user) return { user, supabase }
  return null
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: articleId } = await context.params
  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get('commentId')

  if (!articleId || !commentId) {
    return NextResponse.json({ error: 'ID do artigo e do comentário são obrigatórios.' }, { status: 400 })
  }

  const auth = await getAuthenticatedUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Faça login para editar.' }, { status: 401 })
  }

  let body: { body?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }

  const text = typeof body.body === 'string' ? body.body.trim() : ''
  if (!text) {
    return NextResponse.json({ error: 'O comentário não pode estar vazio.' }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from('article_comments')
    .update({ body: text })
    .eq('id', commentId)
    .eq('article_id', articleId)
    .eq('user_id', auth.user.id)
    .select('id, body, created_at, user_id, parent_id')
    .maybeSingle()

  if (error) {
    console.error('Erro ao editar comentário:', error)
    return NextResponse.json({ error: 'Erro ao editar comentário.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Comentário não encontrado ou você não pode editá-lo.' }, { status: 404 })
  }

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('nome, email, avatar_url, bio, linkedin, instagram')
    .eq('id', auth.user.id)
    .maybeSingle()
  const authorName = (profile?.nome && profile.nome.trim()) || profile?.email || null

  return NextResponse.json({
    comment: {
      id: data.id,
      body: data.body,
      created_at: data.created_at,
      user_id: data.user_id,
      parent_id: data.parent_id ?? null,
      author_name: authorName,
      author_avatar_url: profile?.avatar_url ?? null,
      author_bio: profile?.bio?.trim() || null,
      author_linkedin: profile?.linkedin?.trim() || null,
      author_instagram: profile?.instagram?.trim() || null,
    } satisfies ArticleCommentItem,
  })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: articleId } = await context.params
  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get('commentId')

  if (!articleId || !commentId) {
    return NextResponse.json({ error: 'ID do artigo e do comentário são obrigatórios.' }, { status: 400 })
  }

  const auth = await getAuthenticatedUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Faça login para excluir.' }, { status: 401 })
  }

  const { error } = await auth.supabase
    .from('article_comments')
    .delete()
    .eq('id', commentId)
    .eq('article_id', articleId)
    .eq('user_id', auth.user.id)

  if (error) {
    console.error('Erro ao excluir comentário:', error)
    return NextResponse.json({ error: 'Erro ao excluir comentário.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
