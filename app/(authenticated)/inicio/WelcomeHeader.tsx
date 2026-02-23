'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useBrand } from '@/app/(components)/BrandProvider'

export function WelcomeHeader() {
  const brand = useBrand()
  const t = useTranslations('UserInicio')
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!isMounted || !user) return
      supabase
        .from('profiles')
        .select('nome')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (isMounted && data?.nome?.trim()) setUserName(data.nome.trim())
        })
    })
    return () => { isMounted = false }
  }, [])

  return (
    <header className="space-y-3 text-center">
      <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-blue-400/80">
        {brand.name}
      </span>
      <h2 className="text-3xl font-bold uppercase tracking-tight text-[#f5f5f5] sm:text-4xl">
        {t('welcomeBack')}{userName ? `, ${userName}` : ''}
      </h2>
      <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-400">
        {t('subtitle')}
      </p>
    </header>
  )
}
