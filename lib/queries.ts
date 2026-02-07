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
  created_at: string
}

export type ArticleRecord = {
  id: string
  titulo: string
  autor_handle: string
  categoria: string | null
  resumo: string | null
  icone: string | null
  publicado_em: string | null
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
    .order('data_horario', { ascending: true })

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

export async function getArticles(): Promise<ArticleRecord[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('publicado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar artigos:', error)
    return []
  }

  return data ?? []
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

  // Tenta com created_at; se não existir, usa fallback
  let registrations: { event_id: string; user_id: string; ticket_url: string | null; created_at?: string }[] = []
  const { data: dataWithCreated, error: errWithCreated } = await supabase
    .from('event_registrations')
    .select('event_id, user_id, ticket_url, created_at')
    .order('created_at', { ascending: false })

  if (errWithCreated?.code === '42703') {
    // Coluna created_at não existe - usa query sem ordenação por data
    const { data: dataFallback, error: errFallback } = await supabase
      .from('event_registrations')
      .select('event_id, user_id, ticket_url')
    if (errFallback) {
      console.error('Erro ao buscar inscrições:', errFallback)
      return []
    }
    registrations = (dataFallback ?? []).map((r) => ({ ...r, created_at: '' }))
  } else if (errWithCreated) {
    console.error('Erro ao buscar inscrições:', errWithCreated)
    return []
  } else {
    registrations = dataWithCreated ?? []
  }

  if (!registrations?.length) return []

  const eventIds = [...new Set(registrations.map((r) => r.event_id))]
  const userIds = [...new Set(registrations.map((r) => r.user_id))]

  const [{ data: events }, { data: profiles }] = await Promise.all([
    supabase.from('events').select('id, titulo, data_horario, local_nome, capacidade_maxima').in('id', eventIds),
    supabase.from('profiles').select('id, nome, email, telefone, empresa_projeto, instagram, cidade_estado, area_principal').in('id', userIds),
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
      user_empresa: profile?.empresa_projeto ?? null,
      user_instagram: profile?.instagram ?? null,
      user_cidade: profile?.cidade_estado ?? null,
      user_area: profile?.area_principal ?? null,
    }
  })
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

