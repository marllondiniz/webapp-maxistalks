import { getEventRegistrationsWithDetails, getDashboardStats } from '@/lib/queries'
import { AdminDashboard } from './AdminDashboard'

export default async function AdminDashboardPage() {
  let registrations: Awaited<ReturnType<typeof getEventRegistrationsWithDetails>> = []
  let stats: Awaited<ReturnType<typeof getDashboardStats>> = {
    totalInscricoes: 0,
    totalUsuariosUnicos: 0,
    inscricoesPorEvento: [],
  }

  try {
    ;[registrations, stats] = await Promise.all([
      getEventRegistrationsWithDetails(),
      getDashboardStats(),
    ])
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err)
  }

  return <AdminDashboard registrations={registrations} stats={stats} />
}
