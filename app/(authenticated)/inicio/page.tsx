import { Suspense } from 'react'
import { InicioContent } from './InicioContent'

function InicioSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 rounded-xl bg-slate-800/80" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-20 rounded-xl bg-slate-800/80" />
        <div className="h-20 rounded-xl bg-slate-800/80" />
        <div className="h-20 rounded-xl bg-slate-800/80" />
      </div>
      <div className="space-y-3">
        <div className="h-24 rounded-xl bg-slate-800/80" />
        <div className="h-24 rounded-xl bg-slate-800/80" />
      </div>
    </div>
  )
}

export default function InicioPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-3 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-blue-400/80">
          MaxisTalks
        </span>
        <h2 className="text-3xl font-bold uppercase tracking-tight text-[#f5f5f5] sm:text-4xl">
          Bem-vindo de volta
        </h2>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-400">
          Confira os próximos eventos e palestras, e mergulhe na comunidade.
        </p>
      </header>

      <Suspense fallback={<InicioSkeleton />}>
        <InicioContent />
      </Suspense>
    </section>
  )
}
