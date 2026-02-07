import { getEvents } from '@/lib/queries'
import { EventAdminPanel } from './EventAdminPanel'

export default async function AdminEventosPage() {
  const eventos = await getEvents()

  return (
    <div className="space-y-8">
      <header className="space-y-3 rounded-2xl border border-white/10 bg-[#1e293b] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3b82f6]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
              Gerenciar Eventos
            </h1>
            <p className="text-sm text-slate-400">
              Crie eventos e adicione banners promocionais
            </p>
          </div>
        </div>
      </header>

      <EventAdminPanel initialEvents={eventos} />
    </div>
  )
}
