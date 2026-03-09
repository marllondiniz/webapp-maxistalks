import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfigFromRequest } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabase = getSupabaseAdmin()
    const now = new Date().toISOString()

    let bannersQuery = supabase
      .from('event_banners')
      .select('event_id, image_url, titulo, subtitulo, palestrante_instagram, palestrante_descricao')
      .eq('is_active', true)
    if (tenantId) bannersQuery = bannersQuery.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)

    const selectCols = 'id, titulo, descricao, data_horario, local_nome, destaque, created_at'

    let futureQuery = supabase
      .from('events')
      .select(selectCols)
      .gte('data_horario', now)
      .order('data_horario', { ascending: true })
      .limit(12)
    if (tenantId) futureQuery = futureQuery.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)

    let pastQuery = supabase
      .from('events')
      .select(selectCols)
      .lt('data_horario', now)
      .order('data_horario', { ascending: false })
      .limit(12)
    if (tenantId) pastQuery = pastQuery.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)

    const [{ data: futureData, error: futureError }, { data: pastData, error: pastError }, { data: bannersData, error: bannersError }] =
      await Promise.all([futureQuery, pastQuery, bannersQuery])

    let events: Record<string, unknown>[] = []
    if (futureError?.code === '42703') {
      let fallback = supabase.from('events').select('id, titulo, descricao, data_horario, local_nome, destaque').order('data_horario', { ascending: true }).limit(24)
      if (tenantId) fallback = fallback.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
      const { data: d, error: e } = await fallback
      if (!e && d) {
        const list = d as Record<string, unknown>[]
        const future = list.filter((ev) => new Date(String(ev.data_horario)) >= new Date())
        const past = list.filter((ev) => new Date(String(ev.data_horario)) < new Date()).reverse()
        events = [...future, ...past].slice(0, 12)
      }
    } else if (futureError) {
      console.error('Erro ao buscar eventos (futuros):', futureError)
      if (!pastError && pastData?.length) events = (pastData as Record<string, unknown>[]).slice(0, 12)
    } else {
      const future = (futureData ?? []) as Record<string, unknown>[]
      const past = (pastData ?? []) as Record<string, unknown>[]
      events = future.length >= 12 ? future.slice(0, 12) : [...future, ...past].slice(0, 12)
    }

    if (events.length === 0 && !pastError && pastData?.length) {
      events = (pastData as Record<string, unknown>[]).slice(0, 12)
    }
    const banners = bannersData ?? []

    const eventsWithBanners = events.map((event) => {
      const banner = banners.find((b) => b.event_id === event.id)
      return {
        ...event,
        banner: banner
          ? {
              image_url: banner.image_url,
              titulo: banner.titulo,
              subtitulo: banner.subtitulo,
              palestrante_instagram: banner.palestrante_instagram ?? null,
              palestrante_descricao: banner.palestrante_descricao ?? null,
            }
          : null,
      }
    })

    return NextResponse.json(
      { events: eventsWithBanners },
    )
  } catch {
    return NextResponse.json({ events: [] })
  }
}
