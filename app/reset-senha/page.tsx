import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { ResetPasswordClient } from './ResetPasswordClient'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'ResetPassword' })
  return {
    title: t('metaTitle'),
  }
}

export default function ResetSenhaPage() {
  return <ResetPasswordClient />
}

