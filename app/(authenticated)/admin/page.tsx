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
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold uppercase tracking-wide text-white">
          Visão geral
        </h2>
        <p className="text-sm text-slate-400">
          Atalhos rápidos para gerenciar o conteúdo do MaxisTalks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Link
          href="/admin/dashboard"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-5 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80"
        >
          <h3 className="text-lg font-semibold text-white">Dashboard</h3>
          <p className="mt-1 text-sm text-slate-400">
            {stats.totalInscricoes} inscrição(ões) em {stats.inscricoesPorEvento.length} evento(s).
          </p>
          <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">
            Ver detalhes →
          </span>
        </Link>
        <Link
          href="/admin/eventos"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-5 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80"
        >
          <h3 className="text-lg font-semibold text-white">Eventos</h3>
          <p className="mt-1 text-sm text-slate-400">
            {eventos.length} evento(s) cadastrados.
          </p>
          <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">
            Gerenciar →
          </span>
        </Link>

        <Link
          href="/admin/conteudo"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-5 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80"
        >
          <h3 className="text-lg font-semibold text-white">Conteúdo</h3>
          <p className="mt-1 text-sm text-slate-400">
            Publicações do blog e dicas para a comunidade.
          </p>
          <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">
            Gerenciar →
          </span>
        </Link>

        <Link
          href="/admin/desafios"
          className="rounded-xl border border-white/10 bg-[#1e293b] p-5 shadow-lg transition hover:border-[#3b82f6]/50 hover:bg-[#1e293b]/80"
        >
          <h3 className="text-lg font-semibold text-white">Desafios</h3>
          <p className="mt-1 text-sm text-slate-400">
            {desafios.length} desafio(s) ativos esta semana.
          </p>
          <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">
            Gerenciar →
          </span>
        </Link>
      </div>
    </section>
  )
}
