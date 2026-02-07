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
    <section className="space-y-6">
      <header className="space-y-2 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f5f5f5]/80">
          MaxisTalks
        </span>
        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#f5f5f5]">
          Bem-vindo de volta
        </h2>
        <p className="text-sm text-[#c9c9d2]">
          Confira os próximos eventos e palestras, e mergulhe na comunidade.
        </p>
      </header>

      <Suspense fallback={<InicioSkeleton />}>
        <InicioContent />
      </Suspense>
    </section>
  )
}
