import Link from 'next/link'
import { getChallenges, getEvents, getDashboardStats } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function AdminHomePage() {
  const [eventos, desafios, stats] = await Promise.all([
    getEvents(),
    getChallenges(),
    getDashboardStats().catch(() => ({
      totalInscricoes: 0,
      totalUsuariosUnicos: 0,
      inscricoesPorEvento: [],
    })),
  ])

  return (
    <section className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-lg font-semibold uppercase tracking-wide text-white sm:text-xl">
          Visão geral
        </h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Atalhos rápidos para gerenciar o conteúdo do MaxisTalks.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Link
          href="/admin/dashboard"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-4 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80 sm:p-5"
        >
          <h3 className="text-sm font-semibold text-white sm:text-lg">Dashboard</h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {stats.totalInscricoes} inscrição(ões) em {stats.inscricoesPorEvento.length} evento(s).
          </p>
          <span className="mt-3 inline-flex text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] sm:mt-4 sm:text-xs">
            Ver detalhes →
          </span>
        </Link>
        <Link
          href="/admin/eventos"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-4 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80 sm:p-5"
        >
          <h3 className="text-sm font-semibold text-white sm:text-lg">Eventos</h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {eventos.length} evento(s) cadastrados.
          </p>
          <span className="mt-3 inline-flex text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] sm:mt-4 sm:text-xs">
            Gerenciar →
          </span>
        </Link>

        <Link
          href="/admin/conteudo"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-4 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80 sm:p-5"
        >
          <h3 className="text-sm font-semibold text-white sm:text-lg">Conteúdo</h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Publicações do blog e dicas para a comunidade.
          </p>
          <span className="mt-3 inline-flex text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] sm:mt-4 sm:text-xs">
            Gerenciar →
          </span>
        </Link>

        <Link
          href="/admin/desafios"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-4 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80 sm:p-5"
        >
          <h3 className="text-sm font-semibold text-white sm:text-lg">Desafios</h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {desafios.length} desafio(s) ativos esta semana.
          </p>
          <span className="mt-3 inline-flex text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] sm:mt-4 sm:text-xs">
            Gerenciar →
          </span>
        </Link>
      </div>
    </section>
  )
}
