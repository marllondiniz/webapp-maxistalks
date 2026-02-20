'use client'

import { useState, useTransition } from 'react'
import { Send, Check } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'

export function PainForm({ tenantId }: { tenantId: string | null }) {
  const supabase = getSupabaseClient()
  const [dor, setDor] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dor.trim()) return

    startTransition(async () => {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Você precisa estar logado.')
        return
      }

      const { error: insertError } = await supabase.from('user_pains').insert({
        user_id: user.id,
        tenant_id: tenantId,
        dor: dor.trim(),
      })

      if (insertError) {
        setError('Não foi possível registrar. Tente novamente.')
        return
      }

      setSubmitted(true)
      setDor('')
    })
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-200">Registrado com sucesso!</p>
          <p className="text-xs text-emerald-300/80">Obrigado por compartilhar. Isso nos ajuda a melhorar o conteúdo.</p>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="ml-auto text-xs text-emerald-400 underline hover:no-underline"
        >
          Registrar outra
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={dor}
        onChange={(e) => setDor(e.target.value)}
        placeholder="Descreva o seu maior desafio ou dificuldade atual no negócio..."
        rows={4}
        maxLength={600}
        className="w-full resize-none rounded-xl border border-slate-600/40 bg-slate-900 px-4 py-3 text-sm text-[#f5f5f5] placeholder:text-[#54545b] focus:border-slate-500/60 focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">{dor.length}/600</span>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isPending || !dor.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {isPending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  )
}
