import { getActiveEventBanners, getEvents } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { getTranslations } from 'next-intl/server'
import { EventList } from './EventList'

export default async function EventosPage() {
  const t = await getTranslations('UserEventosPage')
  const tenantId = await getTenantIdForRequest()
  const [eventos, banners] = await Promise.all([getEvents(tenantId), getActiveEventBanners(tenantId)])

  return (
    <section className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#f5f5f5]">
          {t('pageTitle')}
        </h2>
        <p className="text-sm text-[#c9c9d2]">
          {t('pageSubtitle')}
        </p>
      </header>

      <EventList events={eventos} activeBanners={banners} />
    </section>
  )
}


