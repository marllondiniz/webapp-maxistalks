import { unstable_noStore } from 'next/cache'
import { getEventRegistrationsWithDetails, getDashboardStats } from '@/lib/queries'
import { AdminDashboard } from './AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  unstable_noStore()
  let registrations: Awaited<ReturnType<typeof getEventRegistrationsWithDetails>> = []
  let stats: Awaited<ReturnType<typeof getDashboardStats>> = {
    totalInscricoes: 0,
    totalUsuariosUnicos: 0,
    inscricoesPorEvento: [],
  }
  let configError: string | null = null

  try {
    ;[registrations, stats] = await Promise.all([
      getEventRegistrationsWithDetails(),
      getDashboardStats(),
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
      configError={configError}
    />
  )
}
