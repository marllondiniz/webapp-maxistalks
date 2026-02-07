import { getChallenges, getChallengeProgress } from '@/lib/queries'
import { getSupabaseServer } from '@/lib/supabaseServer'

export default async function DesafiosPage() {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [desafios, progressoUsuario] = await Promise.all([
    getChallenges(),
    user ? getChallengeProgress(user.id) : Promise.resolve([]),
  ])

  const progressoMap = new Map(
    progressoUsuario.map((registro) => [registro.challenge_id, registro.progresso ?? 0])
  )

  const totalPontos = progressoUsuario.reduce((acc, registro) => acc + (registro.progresso ?? 0), 0)

  return (
    <section className="space-y-6">
      <header className="space-y-1 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#f5f5f5]">
          DESAFIOS DA SEMANA 💪
        </h2>
        <p className="text-sm text-[#c9c9d2]">
          Complete, marque presença e ganhe Ritmo Points.
        </p>
      </header>

      <div className="space-y-3 rounded-lg border border-white/20 bg-gradient-to-br from-[#f5f5f5] to-[#dcdcdc] p-6 text-[#0f0f10] shadow-xl">
        <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f2f2f]">
          Total acumulado
        </span>
          <span className="rounded-full bg-slate-900/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
            Em breve
          </span>
        </div>
        <p className="mt-3 text-4xl font-bold tracking-tight">{totalPontos}</p>
        <p className="text-sm font-medium text-[#2f2f2f]">
          Ritmo Points acumulados ☕🏅
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {desafios.map((desafio) => {
          const progresso = Math.min(
            100,
            Math.max(0, progressoMap.get(desafio.id) ?? desafio.progresso_padrao ?? 0)
          )

          return (
            <article
              key={desafio.id}
              className="space-y-3 rounded-lg border border-slate-600/30 bg-slate-800/80 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#f5f5f5]">{desafio.titulo}</h3>
                <span className="text-sm font-semibold text-[#f5f5f5]">{progresso}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700/60">
                <div
                  className="h-full rounded-full bg-[#f5f5f5] transition-all"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="text-xs uppercase tracking-wider text-[#9a9aa2]">
                {desafio.descricao || 'Marque presença nos eventos e registre suas conquistas.'}
              </p>
            </article>
          )
        })}
      </div>

      <div className="space-y-2">
      <button
        type="button"
        className="w-full rounded-2xl bg-[#f5f5f5] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#0f0f10] transition hover:brightness-95"
      >
        Ver ranking da comunidade
      </button>
        <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-[#9a9aa2]">
          Ranking completo disponível em breve
        </p>
      </div>
    </section>
  )
}
