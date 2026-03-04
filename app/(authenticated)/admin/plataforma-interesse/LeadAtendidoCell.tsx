'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Check, Clock, Loader2 } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'

type Props = {
  leadId: string
  atendido: boolean | null
}

export function LeadAtendidoCell({ leadId, atendido }: Props) {
  const t = useTranslations('AdminPlataformaLeads')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(!!atendido)

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      const res = await fetch(`/api/admin/plataforma-leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ atendido: !value }),
      })
      if (res.ok) {
        setValue(!value)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      title={value ? t('markPending') : t('markAttended')}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
        value
          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
          : 'bg-white/5 text-[var(--brand-text-muted)] hover:bg-white/10 hover:text-slate-300'
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : value ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Clock className="h-3.5 w-3.5" />
      )}
      {value ? t('attended') : t('pending')}
    </button>
  )
}
