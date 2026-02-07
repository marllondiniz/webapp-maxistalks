import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const [{ data: eventsData, error: eventsError }, { data: bannersData, error: bannersError }] =
      await Promise.all([
        supabase
          .from('events')
          .select('id, titulo, descricao, data_horario, local_nome, destaque')
          .order('data_horario', { ascending: false }),
        supabase
          .from('event_banners')
          .select('event_id, image_url, titulo, subtitulo')
          .eq('is_active', true),
      ])

    if (eventsError) {
      console.error('Erro ao buscar eventos:', eventsError)
      return NextResponse.json({ events: [] })
    }

    const events = (eventsData ?? []).slice(0, 12)
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
