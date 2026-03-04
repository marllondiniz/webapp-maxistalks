import { unstable_noStore } from 'next/cache'
import { getEvents } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { AvaliacoesPanel } from './AvaliacoesPanel'

export const dynamic = 'force-dynamic'

export default async function AdminAvaliacoesPage() {
  unstable_noStore()
  const tenantId = await getTenantIdForRequest()
  const events = await getEvents(tenantId)

  const pastEvents = events
    .filter((e) => e.data_horario < new Date().toISOString())
    .sort((a, b) => (a.data_horario < b.data_horario ? 1 : -1))

  const futureEvents = events
    .filter((e) => e.data_horario >= new Date().toISOString())
    .sort((a, b) => (a.data_horario > b.data_horario ? 1 : -1))

  const allEvents = [...pastEvents, ...futureEvents]

  return (
    <div className="space-y-8">
      <header className="space-y-3 rounded-2xl border border-white/10 bg-[var(--brand-surface)] p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Avaliações</h1>
            <p className="text-sm text-[var(--brand-text-muted)]">
              Envie pesquisas de avaliação por e-mail para convidados de cada evento e acompanhe os resultados.
            </p>
          </div>
        </div>
      </header>

      <AvaliacoesPanel events={allEvents} />
    </div>
  )
}
