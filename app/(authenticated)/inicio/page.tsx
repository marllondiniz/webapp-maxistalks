import { Suspense } from 'react'
import { InicioContent } from './InicioContent'
import { WelcomeHeader } from './WelcomeHeader'

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
      <WelcomeHeader />

      <Suspense fallback={<InicioSkeleton />}>
        <InicioContent />
      </Suspense>
    </section>
  )
}
