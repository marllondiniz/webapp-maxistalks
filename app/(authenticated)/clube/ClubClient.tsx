'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/lib/useUserRole'
import { HighlightCardList, type DestaqueCard } from './HighlightCardList'

type ClubClientProps = {
  cards: DestaqueCard[]
  proximoEventoDesc: string | null
}

export function ClubClient({ cards, proximoEventoDesc }: ClubClientProps) {
  const { role, loading } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (role === 'FREE') {
      router.replace('/clube/assinar')
    }
  }, [role, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[#9a9aa2]">Carregando...</p>
      </div>
    )
  }

  if (role === 'FREE') {
    return null
  }

  return (
    <section className="space-y-6">
      <header className="space-y-4 text-center">
        <h2 className="text-3xl font-black uppercase leading-snug tracking-tight text-[#f5f5f5]">
          A COMUNIDADE
          <br />
          QUE INSPIRA
          <br />
          E TRANSFORMA
        </h2>
        <p className="text-sm text-[#c9c9d2]">
          Mais do que palestras. Uma comunidade que aprende junto, celebra junto e se inspira.
        </p>
      </header>

      <HighlightCardList cards={cards} />

      <div className="space-y-4 rounded-lg border border-white/20 bg-gradient-to-b from-[#f5f5f5] to-[#dcdcdc] p-6 text-center text-[#0f0f10] shadow-xl">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#2f2f2f]">
          Em breve
        </span>
        <h3 className="text-xl font-black uppercase tracking-tight">MAXISTALKS PREMIUM</h3>
        <p className="text-sm font-medium text-[#2f2f2f]">
          {proximoEventoDesc ?? 'Palestras exclusivas, mentorias e benefícios VIP para quem quer se inspirar e transformar.'}
        </p>
        <button
          type="button"
          className="mx-auto mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#f5f5f5] transition hover:brightness-110"
        >
          Quero saber quando lançar
        </button>
      </div>
    </section>
  )
}

