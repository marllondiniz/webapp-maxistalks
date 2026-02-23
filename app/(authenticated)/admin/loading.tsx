import { getTranslations } from 'next-intl/server'

export default async function AdminLoading() {
  const t = await getTranslations('Admin')
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      <p className="text-sm text-slate-400">{t('loadingPanel')}</p>
    </div>
  )
}
