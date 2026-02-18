import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfigFromRequest } from '@/lib/brand'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabase = getSupabaseAdmin()

    let eventsQuery = supabase
      .from('events')
      .select('id, titulo, descricao, data_horario, local_nome, destaque, created_at')
      .order('created_at', { ascending: true, nullsFirst: false })
    if (tenantId) eventsQuery = eventsQuery.eq('tenant_id', tenantId)

    let bannersQuery = supabase
      .from('event_banners')
      .select('event_id, image_url, titulo, subtitulo, palestrante_instagram, palestrante_descricao')
      .eq('is_active', true)
    if (tenantId) bannersQuery = bannersQuery.eq('tenant_id', tenantId)

    const [{ data: eventsData, error: eventsError }, { data: bannersData, error: bannersError }] =
      await Promise.all([eventsQuery, bannersQuery])

    let events: Record<string, unknown>[] = eventsData ?? []
    if (eventsError?.code === '42703') {
      let fallbackQuery = supabase
        .from('events')
        .select('id, titulo, descricao, data_horario, local_nome, destaque')
        .order('data_horario', { ascending: true })
      if (tenantId) fallbackQuery = fallbackQuery.eq('tenant_id', tenantId)
      const { data: fallbackData, error: fallbackError } = await fallbackQuery
      if (fallbackError) {
        console.error('Erro ao buscar eventos:', fallbackError)
        return NextResponse.json({ events: [] })
      }
      events = fallbackData ?? []
    } else if (eventsError) {
      console.error('Erro ao buscar eventos:', eventsError)
      return NextResponse.json({ events: [] })
    }

    const eventsLimit = events.slice(0, 12)
    const banners = bannersData ?? []

    const eventsWithBanners = eventsLimit.map((event) => {
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
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch {
    return NextResponse.json({ events: [] })
  }
}
