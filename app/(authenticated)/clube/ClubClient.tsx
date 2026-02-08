'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/lib/useUserRole'
import { HighlightCardList, type DestaqueCard } from './HighlightCardList'
import type { ArticleRecord } from '@/lib/queries'

type ClubClientProps = {
  cards: DestaqueCard[]
  proximoEventoDesc: string | null
  artigosComunidade: ArticleRecord[]
}

export function ClubClient({ cards, proximoEventoDesc, artigosComunidade }: ClubClientProps) {
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
      <div className="rounded-xl border border-slate-600/30 bg-slate-800/50 p-5 text-center">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
          O que é a comunidade MaxisTalks?
        </h3>
        <p className="text-sm leading-relaxed text-[#c9c9d2]">
          A comunidade MaxisTalks reúne empreendedores, líderes e gestores que buscam aprender, conectar e crescer.
          Aqui você encontra palestras práticas, networking qualificado, cupons de parceiros e experiências exclusivas.
          É o espaço para quem quer gerar valor, trocar ideias e evoluir junto com pessoas que estão no mesmo caminho.
        </p>
      </div>

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

      {artigosComunidade.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Conteúdos da comunidade
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {artigosComunidade.map((artigo) => (
              <Link
                key={artigo.id}
                href={`/blog/${artigo.id}`}
                className="group flex overflow-hidden rounded-xl border border-slate-600/30 bg-slate-800/80 transition hover:border-slate-500/40"
              >
                {artigo.image_url ? (
                  <div className="relative h-24 w-28 shrink-0">
                    <Image
                      src={artigo.image_url}
                      alt={artigo.titulo}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span className="flex h-24 w-28 shrink-0 items-center justify-center bg-white/5" />
                )}
                <div className="flex flex-1 flex-col justify-center p-4">
                  <h4 className="font-semibold text-[#f5f5f5] line-clamp-2">{artigo.titulo}</h4>
                  <p className="mt-1 text-xs text-slate-400">{artigo.autor_handle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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

