import { unstable_noStore } from 'next/cache'
import { getEvents, getEventInteressados } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { ConvidadosPanel } from './ConvidadosPanel'

export const dynamic = 'force-dynamic'

export default async function AdminConvidadosPage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string }>
}) {
  unstable_noStore()
  const tenantId = await getTenantIdForRequest()
  const params = await searchParams
  const events = await getEvents(tenantId)

  const futureEvents = events
    .filter((e) => e.data_horario >= new Date().toISOString())
    .sort((a, b) => (a.data_horario > b.data_horario ? 1 : -1))

  const allEvents = [
    ...futureEvents,
    ...events
      .filter((e) => e.data_horario < new Date().toISOString())
      .sort((a, b) => (a.data_horario < b.data_horario ? 1 : -1)),
  ]

  const selectedEventId = params.evento ?? allEvents[0]?.id ?? null
  const selectedEvent = allEvents.find((e) => e.id === selectedEventId) ?? null

  const interessados = selectedEventId ? await getEventInteressados(selectedEventId) : []

  return (
    <div className="space-y-8">
      <header className="space-y-3 rounded-2xl border border-white/10 bg-[#1e293b] p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Convidados</h1>
            <p className="text-sm text-slate-400">
              Selecione os interessados que serão convidados para cada evento e dispare os convites via WhatsApp.
            </p>
          </div>
        </div>
      </header>

      <ConvidadosPanel
        events={allEvents}
        selectedEventId={selectedEventId}
        selectedEvent={selectedEvent}
        interessados={interessados}
      />
    </div>
  )
}
