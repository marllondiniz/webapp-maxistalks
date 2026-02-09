import { getSupabaseServer } from './supabaseServer'
import { getSupabaseAdmin } from './supabaseAdmin'
import type { ProfileRecord } from './profile'

export type EventRecord = {
  id: string
  titulo: string
  descricao: string | null
  data_horario: string
  local_nome: string
  local_detalhe: string | null
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
  categoria: string | null
  resumo: string | null
  conteudo: string | null
  icone: string | null
  publicado_em: string | null
  image_url: string | null
  image_path: string | null
  tipo_conteudo: string | null
}

export type ChallengeRecord = {
  id: string
  titulo: string
  descricao: string | null
  progresso_padrao: number | null
  ordem: number | null
  semana_referencia: string | null
}

export type ChallengeProgressRecord = {
  challenge_id: string
  progresso: number | null
}

export async function getEvents(): Promise<EventRecord[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: true, nullsFirst: false })

  if (error?.code === '42703') {
    // Coluna created_at não existe - ordena por data_horario (mais antigo primeiro)
    const { data: fallback, error: err } = await supabase
      .from('events')
      .select('*')
      .order('data_horario', { ascending: true })
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

export async function getActiveEventBanners(): Promise<EventBannerRecord[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('event_banners')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar banners ativos:', error)
    return []
  }

  return data ?? []
}

export async function getEventBanners(): Promise<EventBannerRecord[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('event_banners')
    .select('*')
    .order('created_at', { ascending: false })

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

export async function getArticles(tipo?: ArticlesFilter): Promise<ArticleRecord[]> {
  const supabase = getSupabaseServer()
  let query = supabase
    .from('articles')
    .select('*')
    .order('publicado_em', { ascending: false })

  if (tipo && tipo !== 'all') {
    query = query.or(`tipo_conteudo.eq.${tipo},tipo_conteudo.eq.geral`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar artigos:', error)
    return []
  }

  return data ?? []
}

export async function getArticleById(id: string): Promise<ArticleRecord | null> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Erro ao buscar artigo:', error)
    return null
  }

  return data ?? null
}

export async function getChallenges(): Promise<ChallengeRecord[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('ordem', { ascending: true })

  if (error) {
    console.error('Erro ao buscar desafios:', error)
    return []
  }

  return data ?? []
}

export async function getChallengeProgress(userId: string): Promise<ChallengeProgressRecord[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('challenge_progress')
    .select('challenge_id, progresso')
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao buscar progresso de desafios:', error)
    return []
  }

  return data ?? []
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

export async function getEventRegistrationsWithDetails(): Promise<
  EventRegistrationWithDetails[]
> {
  const supabase = getSupabaseAdmin()

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
}

export async function getAllUsersWithProfiles(): Promise<UserWithProfile[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, telefone, cidade_estado, empresa_projeto, empresa_atual, faixa_faturamento, segmento_negocio, o_que_quer_aprender, instagram, linkedin, area_principal, area_gestao, posicao_mercado, cargo_atual, updated_at')
    .eq('is_complete', true)
    .neq('is_admin', true)
    .order('updated_at', { ascending: false })
    .limit(2000)

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
  }))
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const registrations = await getEventRegistrationsWithDetails()
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

