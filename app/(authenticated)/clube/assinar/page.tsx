import Link from 'next/link'
import { UsersRound, ArrowRight } from 'lucide-react'

export default function AssinarPage() {
  return (
    <section className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
      <div className="mx-auto w-full max-w-xl space-y-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6]/20 to-[#6366f1]/20">
          <UsersRound className="h-10 w-10 text-[var(--brand-primary)]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f5] sm:text-3xl">
          Comunidade MaxisTalks
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#c9c9d2]">
          Reúne empreendedores, líderes e gestores que buscam aprender, conectar e crescer.
          Palestras práticas, networking qualificado e experiências exclusivas.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm font-medium text-blue-300">
            Em breve você terá acesso completo à comunidade MaxisTalks.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
          >
            Ver eventos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
