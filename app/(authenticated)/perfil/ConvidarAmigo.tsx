'use client'

import { useCallback, useMemo, useState } from 'react'
import { UserPlus, Copy, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ConvidarAmigoProps = {
  userId: string
}

export function ConvidarAmigo({ userId }: ConvidarAmigoProps) {
  const t = useTranslations('UserConvidar')
  const [copied, setCopied] = useState(false)

  const referralUrl = useMemo(() => {
    if (typeof window === 'undefined' || !userId) return ''
    return `${window.location.origin}/login?mode=signUp&ref=${encodeURIComponent(userId)}`
  }, [userId])

  const copyLink = useCallback(async () => {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }, [referralUrl])

  return (
    <div className="rounded-xl border border-slate-600/30 bg-slate-800/60 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{t('title')}</h3>
          <p className="text-xs text-slate-400">{t('subtitle')}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={referralUrl}
          className="flex-1 rounded-lg border border-slate-600/50 bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
          aria-label={t('referralLinkLabel')}
        />
        <button
          type="button"
          onClick={copyLink}
          disabled={!referralUrl || copied}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? t('copied') : t('copy')}
        </button>
      </div>
    </div>
  )
}
