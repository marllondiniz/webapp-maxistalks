import { unstable_noStore } from 'next/cache'
import { getTools, getActiveLiveSession } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { getTranslations } from 'next-intl/server'
import { Wrench } from 'lucide-react'
import { LiveSessionBanner } from './LiveSessionBanner'
import { ToolList } from './ToolList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FerramentasPage() {
  unstable_noStore()
  const t = await getTranslations('UserFerramentasPage')
  const tenantId = await getTenantIdForRequest()
  const [tools, liveSession] = await Promise.all([
    getTools(tenantId),
    getActiveLiveSession(tenantId),
  ])

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{t('pageTitle')}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {t('pageSubtitle')}
        </p>
      </div>

      {/* Ao vivo */}
      {liveSession && <LiveSessionBanner session={liveSession} />}

      {/* Lista de ferramentas */}
      {tools.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-600/30 bg-slate-800/50 px-6 py-14 text-center">
          <Wrench className="h-12 w-12 text-slate-600" />
          <p className="text-base font-semibold text-slate-300">{t('noTools')}</p>
          <p className="text-sm text-slate-500">{t('noToolsHint')}</p>
        </div>
      ) : (
        <section className="space-y-3">
          <ToolList tools={tools} />
        </section>
      )}
    </div>
  )
}
