import { getTranslations } from 'next-intl/server'

export default async function AuthenticatedLoading() {
  const t = await getTranslations('UserCommon')
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      <p className="text-sm text-slate-400">{t('loading')}</p>
    </div>
  )
}
