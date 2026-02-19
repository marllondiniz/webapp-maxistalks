import { unstable_noStore } from 'next/cache'
import {
  getEventRegistrationsWithDetails,
  getDashboardStats,
  getAllUsersWithProfiles,
  getReferralStats,
  getContentStats,
  getEvents,
} from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { AdminDashboard } from './AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  unstable_noStore()
  const tenantId = await getTenantIdForRequest()
  let registrations: Awaited<ReturnType<typeof getEventRegistrationsWithDetails>> = []
  let stats: Awaited<ReturnType<typeof getDashboardStats>> = {
    totalInscricoes: 0,
    totalUsuariosUnicos: 0,
    inscricoesPorEvento: [],
  }
  let allUsers: Awaited<ReturnType<typeof getAllUsersWithProfiles>> = []
  let referralStats: Awaited<ReturnType<typeof getReferralStats>> = { totalReferred: 0, topReferrers: [] }
  let contentStats: Awaited<ReturnType<typeof getContentStats>> = {
    totalArticles: 0,
    byTipo: {},
    lastArticles: [],
  }
  let events: Awaited<ReturnType<typeof getEvents>> = []
  let configError: string | null = null

  try {
    ;[registrations, stats, allUsers, referralStats, contentStats, events] = await Promise.all([
      getEventRegistrationsWithDetails(tenantId),
      getDashboardStats(tenantId),
      getAllUsersWithProfiles(tenantId),
      getReferralStats(tenantId),
      getContentStats(tenantId),
      getEvents(tenantId),
    ])
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err)
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('service role') || msg.includes('não configurada')) {
      configError = 'Configure SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel.'
    }
  }

  return (
    <AdminDashboard
      registrations={registrations}
      stats={stats}
      allUsers={allUsers}
      referralStats={referralStats}
      contentStats={contentStats}
      events={events}
      configError={configError}
    />
  )
}
