import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEvents, getActiveEventBanners } from '@/lib/queries'
import { getBrandForRequest, getTenantIdForRequest } from '@/lib/brand'
import { EventDetailClient } from './EventDetailClient'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const [brand, tenantId] = await Promise.all([getBrandForRequest(), getTenantIdForRequest()])
  const [eventos, banners] = await Promise.all([
    getEvents(tenantId),
    getActiveEventBanners(tenantId),
  ])

  const event = eventos.find((e) => e.id === id)
  if (!event) {
    return {
      title: `${brand.name} | ${brand.tagline}`,
      description: brand.tagline,
    }
  }

  const banner = banners.find((b) => b.event_id === event.id) ?? null
  const descriptionBase = event.descricao
    ? event.descricao.replace(/<[^>]+>/g, '').slice(0, 200)
    : `${event.local_nome} — ${new Date(event.data_horario).toLocaleString('pt-BR')}`

  const url = new URL(`/eventos/${event.id}`, brand.baseUrl)

  return {
    title: event.titulo,
    description: descriptionBase,
    openGraph: {
      title: event.titulo,
      description: descriptionBase,
      url,
      siteName: brand.name,
      images: banner
        ? [
            {
              url: banner.image_url,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: event.titulo,
      description: descriptionBase,
      images: banner ? [banner.image_url] : undefined,
    },
  }
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

