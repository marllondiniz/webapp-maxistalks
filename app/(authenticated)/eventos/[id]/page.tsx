import { notFound } from 'next/navigation'
import { getEvents, getActiveEventBanners } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { EventDetailClient } from './EventDetailClient'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const tenantId = await getTenantIdForRequest()
  const [eventos, banners] = await Promise.all([
    getEvents(tenantId),
    getActiveEventBanners(tenantId),
  ])

  const event = eventos.find((e) => e.id === id)
  if (!event) {
    notFound()
  }

  const banner = banners.find((b) => b.event_id === event.id) ?? null
  const outrosEventos = eventos
    .filter((e) => e.id !== id)
    .sort((a, b) => new Date(a.data_horario).getTime() - new Date(b.data_horario).getTime())
    .slice(0, 4)

  return (
    <EventDetailClient
      event={event}
      banner={banner}
      outrosEventos={outrosEventos}
      bannersAtivos={banners}
    />
  )
}

