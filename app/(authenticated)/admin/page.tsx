import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getEvents, getDashboardStats, getPlataformaLeads } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { isPlataformaSalesEnabled } from '@/lib/plataformaSales'

export const dynamic = 'force-dynamic'

export default async function AdminHomePage() {
  const t = await getTranslations('AdminHome')
  const tenantId = await getTenantIdForRequest()
  const plataformaEnabled = isPlataformaSalesEnabled()
  const [eventos, stats, plataformaLeads] = await Promise.all([
    getEvents(tenantId),
    getDashboardStats(tenantId).catch(() => ({
      totalInscricoes: 0,
      totalUsuariosUnicos: 0,
      inscricoesPorEvento: [],
    })),
    plataformaEnabled ? getPlataformaLeads(tenantId) : Promise.resolve([]),
  ])

  return (
    <section className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-lg font-semibold uppercase tracking-wide text-white sm:text-xl">
          {t('title')}
        </h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Link
          href="/admin/dashboard"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-4 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80 sm:p-5"
        >
          <h3 className="text-sm font-semibold text-white sm:text-lg">{t('cardDashboardTitle')}</h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {t('cardDashboardDesc', {
              totalInscricoes: String(stats.totalInscricoes),
              totalEventos: String(stats.inscricoesPorEvento.length),
            })}
          </p>
          <span className="mt-3 inline-flex text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] sm:mt-4 sm:text-xs">
            {t('viewDetails')} →
          </span>
        </Link>
        <Link
          href="/admin/eventos"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-4 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80 sm:p-5"
        >
          <h3 className="text-sm font-semibold text-white sm:text-lg">{t('cardEventsTitle')}</h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {t('cardEventsDesc', { count: String(eventos.length) })}
          </p>
          <span className="mt-3 inline-flex text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] sm:mt-4 sm:text-xs">
            {t('manage')} →
          </span>
        </Link>

        <Link
          href="/admin/conteudo"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-4 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80 sm:p-5"
        >
          <h3 className="text-sm font-semibold text-white sm:text-lg">{t('cardContentTitle')}</h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {t('cardContentDesc')}
          </p>
          <span className="mt-3 inline-flex text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] sm:mt-4 sm:text-xs">
            {t('manage')} →
          </span>
        </Link>
        {plataformaEnabled && (
        <Link
          href="/admin/plataforma-interesse"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-4 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80 sm:p-5"
        >
          <h3 className="text-sm font-semibold text-white sm:text-lg">{t('cardPlataformaLeadsTitle')}</h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {t('cardPlataformaLeadsDesc', { count: String(plataformaLeads.length) })}
          </p>
          <span className="mt-3 inline-flex text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] sm:mt-4 sm:text-xs">
            {t('viewDetails')} →
          </span>
        </Link>
        )}
      </div>
    </section>
  )
}
