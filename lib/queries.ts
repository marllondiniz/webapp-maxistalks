import { getSupabaseServer } from './supabaseServer'
import { getSupabaseAdmin } from './supabaseAdmin'
import type { ProfileRecord } from './profile'

export type EventRecord = {
  id: string
  titulo: string
  descricao: string | null
  data_horario: string
  slug?: string | null
  local_nome: string
  local_detalhe: string | null
  localizacao_maps?: string | null
  preco: number | null
  gratuito: boolean | null
  participantes_confirmados: number | null
  capacidade_maxima: number | null
  destaque: boolean | null
  banner_id?: string | null
}

export type EventBannerRecord = {
  id: string
  titulo: string | null
  subtitulo: string | null
  event_id: string | null
  image_url: string
  image_path: string
  is_active: boolean | null
  palestrante_instagram?: string | null
  palestrante_descricao?: string | null
  created_at: string
}

export type ArticleGalleryRecord = {
  id: string
  article_id: string
  image_url: string
  image_path: string
  ordem: number | null
  created_at: string
}

export type ArticleRecord = {
  id: string
  titulo: string
  autor_handle: string
  slug?: string | null
  categoria: string | null
  resumo: string | null
  conteudo: string | null
  icone: string | null
  publicado_em: string | null
  image_url: string | null
  image_path: string | null
  tipo_conteudo: string | null
}

export type ToolRecord = {
  id: string
  tenant_id: string | null
  titulo: string
  descricao: string | null
  youtube_url: string | null
  pdf_url: string | null
  pdf_nome: string | null
  ordem: number | null
  ativo: boolean | null
  created_at: string
}

export type UserPainRecord = {
  id: string
  user_id: string
  tenant_id: string | null
  dor: string
  created_at: string
}

export type LiveSessionRecord = {
  id: string
  tenant_id: string | null
  titulo: string | null
  youtube_url: string
  ativo: boolean | null
  created_at: string
}

export async function getTools(tenantId?: string | null): Promise<ToolRecord[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('tools')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
  if (tenantId) query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
  const { data, error } = await query
  if (error) {
    console.error('Erro ao buscar ferramentas:', error)
    return []
  }
  return data ?? []
}

export async function getActiveLiveSession(tenantId?: string | null): Promise<LiveSessionRecord | null> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('live_sessions')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: false })
    .limit(1)
  if (tenantId) query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
  const { data, error } = await query
  if (error) {
    console.error('Erro ao buscar sessão ao vivo:', error)
    return null
  }
  return data?.[0] ?? null
}

export async function getEvents(tenantId?: string | null): Promise<EventRecord[]> {
  const supabase = getSupabaseServer()
  let query = supabase.from('events').select('*').order('created_at', { ascending: true, nullsFirst: false })
  if (tenantId) query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
  const { data, error } = await query

  if (error?.code === '42703') {
    let fallbackQuery = supabase.from('events').select('*').order('data_horario', { ascending: true })
    if (tenantId) fallbackQuery = fallbackQuery.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
    const { data: fallback, error: err } = await fallbackQuery
    if (err) {
      console.error('Erro ao buscar eventos:', err)
      return []
    }
    return fallback ?? []
  }

  if (error) {
    console.error('Erro ao buscar eventos:', error)
    return []
  }

  return data ?? []
}

export async function getActiveEventBanners(tenantId?: string | null): Promise<EventBannerRecord[]> {
  const supabase = getSupabaseServer()
  let query = supabase
    .from('event_banners')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (tenantId) query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar banners ativos:', error)
    return []
  }

  return data ?? []
}

export async function getEventBanners(tenantId?: string | null): Promise<EventBannerRecord[]> {
  const supabase = getSupabaseServer()
  let query = supabase.from('event_banners').select('*').order('created_at', { ascending: false })
  if (tenantId) query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
  const { data, error } = await query

  if (error) {
    console.error('Erro ao listar banners:', error)
    return []
  }

  return data ?? []
}

export async function getArticleGallery(articleId: string): Promise<ArticleGalleryRecord[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('article_gallery')
    .select('*')
    .eq('article_id', articleId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar galeria do artigo:', error)
    return []
  }

  return data ?? []
}

export type ArticlesFilter = 'blog' | 'inicio' | 'comunidade' | 'geral' | 'all'

export async function getArticles(tipo?: ArticlesFilter, tenantId?: string | null): Promise<ArticleRecord[]> {
  const supabase = getSupabaseServer()
  let query = supabase.from('articles').select('*').order('publicado_em', { ascending: false })
  if (tipo && tipo !== 'all') {
    query = query.or(`tipo_conteudo.eq.${tipo},tipo_conteudo.eq.geral`)
  }
  if (tenantId) query = query.eq('tenant_id', tenantId)
  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar artigos:', error)
    return []
  }

  return data ?? []
}

export async function getArticleById(id: string, tenantId?: string | null): Promise<ArticleRecord | null> {
  const supabase = getSupabaseServer()
  let query = supabase.from('articles').select('*').eq('id', id)
  if (tenantId) query = query.eq('tenant_id', tenantId)
  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('Erro ao buscar artigo:', error)
    return null
  }

  return data ?? null
}

export async function getArticleBySlugOrId(slugOrId: string, tenantId?: string | null): Promise<ArticleRecord | null> {
  const supabase = getSupabaseServer()
  let query = supabase.from('articles').select('*').or(`id.eq.${slugOrId},slug.eq.${slugOrId}`)
  if (tenantId) query = query.eq('tenant_id', tenantId)
  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('Erro ao buscar artigo por slug ou id:', error)
    return null
  }

  return data ?? null
}

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Erro ao buscar perfil:', error)
    return null
  }

  return data ?? null
}

// Registrations para dashboard admin
export type EventRegistrationWithDetails = {
  id?: string
  event_id: string
  user_id: string
  ticket_url: string | null
  created_at: string
  event_titulo: string
  event_data_horario: string
  event_local: string
  event_capacidade: number | null
  user_nome: string | null
  user_email: string | null
  user_telefone: string | null
  user_empresa: string | null
  user_instagram: string | null
  user_cidade: string | null
  user_area: string | null
}

export type DashboardStats = {
  totalInscricoes: number
  totalUsuariosUnicos: number
  inscricoesPorEvento: { eventoId: string; titulo: string; total: number }[]
}

export async function getEventRegistrationsWithDetails(tenantId?: string | null): Promise<
  EventRegistrationWithDetails[]
> {
  const supabase = getSupabaseAdmin()

  // Se multi-tenant, restringe a inscrições em eventos do tenant (inclui tenant_id null = legado)
  let eventIdsForTenant: string[] | null = null
  if (tenantId) {
    const { data: tenantEvents } = await supabase
      .from('events')
      .select('id')
      .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
    eventIdsForTenant = (tenantEvents ?? []).map((e) => e.id)
    if (eventIdsForTenant.length === 0) return []
  }

  // Tenta registered_at primeiro (comum no Supabase); se não existir, tenta created_at
  let registrations: { event_id: string; user_id: string; ticket_url: string | null; created_at?: string }[] = []
  const { data: dataWithRegistered, error: errRegistered } = await supabase
    .from('event_registrations')
    .select('event_id, user_id, ticket_url, registered_at')
    .order('registered_at', { ascending: false })
    .limit(5000)

  if (!errRegistered && dataWithRegistered?.length) {
    registrations = (dataWithRegistered as { event_id: string; user_id: string; ticket_url: string | null; registered_at?: string }[]).map(
      (r) => ({ event_id: r.event_id, user_id: r.user_id, ticket_url: r.ticket_url ?? null, created_at: r.registered_at ?? '' })
    )
  } else if (errRegistered?.code === '42703') {
    // registered_at não existe - tenta created_at
    const { data: dataWithCreated, error: errWithCreated } = await supabase
      .from('event_registrations')
      .select('event_id, user_id, ticket_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)
    if (!errWithCreated && dataWithCreated?.length) {
      registrations = dataWithCreated ?? []
    } else if (errWithCreated?.code === '42703') {
      const { data: dataFallback, error: errFallback } = await supabase
        .from('event_registrations')
        .select('event_id, user_id, ticket_url')
        .limit(5000)
      if (errFallback) {
        console.error('Erro ao buscar inscrições:', errFallback)
        return []
      }
      registrations = (dataFallback ?? []).map((r) => ({ ...r, created_at: '' }))
    } else if (errWithCreated) {
      console.error('Erro ao buscar inscrições:', errWithCreated)
      return []
    }
  } else if (errRegistered) {
    console.error('Erro ao buscar inscrições:', errRegistered)
    return []
  }

  if (tenantId && eventIdsForTenant) {
    const set = new Set(eventIdsForTenant)
    registrations = registrations.filter((r) => set.has(r.event_id))
  }

  if (!registrations?.length) return []

  const eventIds = [...new Set(registrations.map((r) => r.event_id))]
  const userIds = [...new Set(registrations.map((r) => r.user_id))]

  const [{ data: events }, { data: profiles }] = await Promise.all([
    supabase.from('events').select('id, titulo, data_horario, local_nome, capacidade_maxima').in('id', eventIds),
    supabase.from('profiles').select('id, nome, email, telefone, empresa_projeto, empresa_atual, instagram, cidade_estado, area_principal, area_gestao').in('id', userIds),
  ])

  const eventsMap = new Map((events ?? []).map((e) => [e.id, e]))
  const profilesMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return registrations.map((r) => {
    const event = eventsMap.get(r.event_id)
    const profile = profilesMap.get(r.user_id)
    return {
      id: `${r.event_id}-${r.user_id}`,
      event_id: r.event_id,
      user_id: r.user_id,
      ticket_url: r.ticket_url ?? null,
      created_at: r.created_at ?? '',
      event_titulo: event?.titulo ?? 'Evento removido',
      event_data_horario: event?.data_horario ?? '',
      event_local: event?.local_nome ?? '',
      event_capacidade: event?.capacidade_maxima ?? null,
      user_nome: profile?.nome ?? null,
      user_email: profile?.email ?? null,
      user_telefone: profile?.telefone ?? null,
      user_empresa: profile?.empresa_projeto ?? profile?.empresa_atual ?? null,
      user_instagram: profile?.instagram ?? null,
      user_cidade: profile?.cidade_estado ?? null,
      user_area: profile?.area_gestao ?? profile?.area_principal ?? null,
    }
  })
}

export type UserWithProfile = {
  id: string
  nome: string | null
  email: string | null
  telefone: string | null
  cidade_estado: string | null
  empresa_projeto: string | null
  empresa_atual: string | null
  faixa_faturamento: string | null
  segmento_negocio: string | null
  o_que_quer_aprender: string[] | null
  instagram: string | null
  linkedin: string | null
  area_principal: string | null
  area_gestao: string | null
  posicao_mercado: string | null
  cargo_atual: string | null
  updated_at: string | null
  invited_by_user_id: string | null
}

export async function getAllUsersWithProfiles(tenantId?: string | null): Promise<UserWithProfile[]> {
  const supabase = getSupabaseAdmin()

  let query = supabase
    .from('profiles')
    .select('id, nome, email, telefone, cidade_estado, empresa_projeto, empresa_atual, faixa_faturamento, segmento_negocio, o_que_quer_aprender, instagram, linkedin, area_principal, area_gestao, posicao_mercado, cargo_atual, updated_at, invited_by_user_id')
    .eq('is_complete', true)
    .neq('is_admin', true)
    .order('updated_at', { ascending: false })
    .limit(2000)
  if (tenantId) query = query.eq('tenant_id', tenantId)
  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar usuários:', error)
    return []
  }

  return (data ?? []).map((p) => ({
    id: p.id,
    nome: p.nome ?? null,
    email: p.email ?? null,
    telefone: p.telefone ?? null,
    cidade_estado: p.cidade_estado ?? null,
    empresa_projeto: p.empresa_projeto ?? null,
    empresa_atual: p.empresa_atual ?? null,
    faixa_faturamento: p.faixa_faturamento ?? null,
    segmento_negocio: p.segmento_negocio ?? null,
    o_que_quer_aprender: Array.isArray(p.o_que_quer_aprender) ? p.o_que_quer_aprender : null,
    instagram: p.instagram ?? null,
    linkedin: p.linkedin ?? null,
    area_principal: p.area_principal ?? null,
    area_gestao: p.area_gestao ?? null,
    posicao_mercado: p.posicao_mercado ?? null,
    cargo_atual: p.cargo_atual ?? null,
    updated_at: p.updated_at ?? null,
    invited_by_user_id: p.invited_by_user_id ?? null,
  }))
}

export async function getDashboardStats(tenantId?: string | null): Promise<DashboardStats> {
  const registrations = await getEventRegistrationsWithDetails(tenantId)
  const uniqueUsers = new Set(registrations.map((r) => r.user_id))

  const byEvent = new Map<string, { titulo: string; total: number }>()
  for (const r of registrations) {
    const current = byEvent.get(r.event_id)
    if (current) {
      current.total += 1
    } else {
      byEvent.set(r.event_id, { titulo: r.event_titulo, total: 1 })
    }
  }

  const inscricoesPorEvento = [...byEvent.entries()].map(([eventoId, { titulo, total }]) => ({
    eventoId,
    titulo,
    total,
  }))

  return {
    totalInscricoes: registrations.length,
    totalUsuariosUnicos: uniqueUsers.size,
    inscricoesPorEvento,
  }
}

export type ReferralStats = {
  totalReferred: number
  topReferrers: { referrerId: string; referrerName: string; count: number }[]
}

export async function getReferralStats(tenantId?: string | null): Promise<ReferralStats> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('profiles')
    .select('invited_by_user_id')
    .not('invited_by_user_id', 'is', null)
  if (tenantId) query = query.eq('tenant_id', tenantId)
  const { data, error } = await query
  if (error) {
    console.error('Erro ao buscar indicações:', error)
    return { totalReferred: 0, topReferrers: [] }
  }
  const rows = (data ?? []) as { invited_by_user_id: string }[]
  const totalReferred = rows.length
  const byReferrer = new Map<string, number>()
  for (const r of rows) {
    const id = r.invited_by_user_id
    byReferrer.set(id, (byReferrer.get(id) ?? 0) + 1)
  }
  const referrerIds = [...byReferrer.keys()]
  if (referrerIds.length === 0) {
    return { totalReferred, topReferrers: [] }
  }
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome')
    .in('id', referrerIds)
  const nameMap = new Map((profiles ?? []).map((p: { id: string; nome: string | null }) => [p.id, p.nome ?? '—']))
  const topReferrers = [...byReferrer.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([referrerId, count]) => ({
      referrerId,
      referrerName: nameMap.get(referrerId) ?? '—',
      count,
    }))
  return { totalReferred, topReferrers }
}

export type ContentStats = {
  totalArticles: number
  byTipo: Record<string, number>
  lastArticles: { id: string; titulo: string; publicado_em: string | null }[]
}

export async function getContentStats(tenantId?: string | null): Promise<ContentStats> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('articles')
    .select('id, titulo, publicado_em, tipo_conteudo')
    .order('publicado_em', { ascending: false })
    .limit(500)
  if (tenantId) query = query.eq('tenant_id', tenantId)
  const { data, error } = await query
  if (error) {
    console.error('Erro ao buscar conteúdo:', error)
    return { totalArticles: 0, byTipo: {}, lastArticles: [] }
  }
  const articles = (data ?? []) as { id: string; titulo: string; publicado_em: string | null; tipo_conteudo: string | null }[]
  const byTipo: Record<string, number> = {}
  for (const a of articles) {
    const t = a.tipo_conteudo ?? 'geral'
    byTipo[t] = (byTipo[t] ?? 0) + 1
  }
  const lastArticles = articles.slice(0, 5).map((a) => ({
    id: a.id,
    titulo: a.titulo,
    publicado_em: a.publicado_em,
  }))
  return {
    totalArticles: articles.length,
    byTipo,
    lastArticles,
  }
}

export type EventInteressado = {
  userId: string
  nome: string | null
  email: string | null
  telefone: string | null
  cidade_estado: string | null
  empresa: string | null
  segmento_negocio: string | null
  posicao_mercado: string | null
  faixa_faturamento: string | null
  o_que_quer_aprender: string[] | null
  instagram: string | null
  linkedin: string | null
  interessadoEm: string
  convidado_selecionado: boolean
  convite_enviado_em: string | null
}

export async function getEventInteressados(eventId: string): Promise<EventInteressado[]> {
  const supabase = getSupabaseAdmin()

  const { data: regs, error } = await supabase
    .from('event_registrations')
    .select('user_id, created_at, convidado_selecionado, convite_enviado_em')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error || !regs?.length) return []

  const userIds = regs.map((r: { user_id: string }) => r.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome, email, telefone, cidade_estado, empresa_projeto, empresa_atual, segmento_negocio, posicao_mercado, faixa_faturamento, o_que_quer_aprender, instagram, linkedin')
    .in('id', userIds)

  const profileMap = new Map((profiles ?? []).map((p: { id: string }) => [p.id, p]))

  return regs.map((r: { user_id: string; created_at: string; convidado_selecionado: boolean | null; convite_enviado_em: string | null }) => {
    const p = profileMap.get(r.user_id) as {
      id: string; nome: string | null; email: string | null; telefone: string | null;
      cidade_estado: string | null; empresa_projeto: string | null; empresa_atual: string | null;
      segmento_negocio: string | null; posicao_mercado: string | null; faixa_faturamento: string | null;
      o_que_quer_aprender: string[] | null; instagram: string | null; linkedin: string | null;
    } | undefined
    return {
      userId: r.user_id,
      nome: p?.nome ?? null,
      email: p?.email ?? null,
      telefone: p?.telefone ?? null,
      cidade_estado: p?.cidade_estado ?? null,
      empresa: p?.empresa_projeto ?? p?.empresa_atual ?? null,
      segmento_negocio: p?.segmento_negocio ?? null,
      posicao_mercado: p?.posicao_mercado ?? null,
      faixa_faturamento: p?.faixa_faturamento ?? null,
      o_que_quer_aprender: Array.isArray(p?.o_que_quer_aprender) ? p.o_que_quer_aprender : null,
      instagram: p?.instagram ?? null,
      linkedin: p?.linkedin ?? null,
      interessadoEm: r.created_at,
      convidado_selecionado: r.convidado_selecionado ?? false,
      convite_enviado_em: r.convite_enviado_em ?? null,
    }
  })
}

export type PlataformaLeadRecord = {
  id: string
  tenant_id: string | null
  nome: string
  email: string
  telefone: string | null
  empresa: string | null
  mensagem: string | null
  plano_interesse: string | null
  atendido: boolean | null
  created_at: string
}

export async function getPlataformaLeads(tenantId: string | null): Promise<PlataformaLeadRecord[]> {
  const supabase = getSupabaseAdmin()
  let q = supabase
    .from('plataforma_leads')
    .select('id, tenant_id, nome, email, telefone, empresa, mensagem, plano_interesse, atendido, created_at')
    .order('created_at', { ascending: false })
  if (tenantId) {
    q = q.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
  }
  const { data, error } = await q
  if (error) {
    console.error('Erro ao buscar plataforma_leads:', error)
    return []
  }
  return (data ?? []) as PlataformaLeadRecord[]
}

