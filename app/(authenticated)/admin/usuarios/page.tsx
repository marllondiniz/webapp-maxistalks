import { unstable_noStore } from 'next/cache'
import { getAllUsersWithProfiles, getEventRegistrationsWithDetails } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { UsersPanel } from './UsersPanel'

export const dynamic = 'force-dynamic'

export default async function AdminUsuariosPage() {
  unstable_noStore()
  const tenantId = await getTenantIdForRequest()
  let allUsers = await getAllUsersWithProfiles(tenantId)
  let registrations: Awaited<ReturnType<typeof getEventRegistrationsWithDetails>> = []
  try {
    registrations = await getEventRegistrationsWithDetails(tenantId)
  } catch {
    // ignora erro de config
  }

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
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
              Usuários
            </h1>
            <p className="text-sm text-slate-400">
              Lista de usuários com perfil completo. Busque, filtre e exporte.
            </p>
          </div>
        </div>
      </header>

      <UsersPanel allUsers={allUsers} registrations={registrations} />
    </div>
  )
}
