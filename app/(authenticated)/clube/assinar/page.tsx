import Link from 'next/link'
import { UsersRound, ArrowRight } from 'lucide-react'

export default function AssinarPage() {
  return (
    <section className="mx-auto max-w-xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6]/20 to-[#6366f1]/20">
          <UsersRound className="h-10 w-10 text-[#3b82f6]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f5] sm:text-3xl">
          Comunidade MaxisTalks
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#c9c9d2]">
          Reúne empreendedores, líderes e gestores que buscam aprender, conectar e crescer.
          Palestras práticas, networking qualificado e experiências exclusivas.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-600/30 bg-slate-800/60 p-6 backdrop-blur sm:p-8">
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-400">
            O plano premium está em preparação. Em breve você poderá ter acesso completo à comunidade.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <Link href="/politica-de-privacidade" className="transition hover:text-slate-400">
              Política de Privacidade
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/termos-de-uso" className="transition hover:text-slate-400">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/eventos"
          className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
        >
          Ver eventos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
