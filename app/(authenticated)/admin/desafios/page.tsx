import { getChallenges } from '@/lib/queries'
import { ChallengeAdminPanel } from './ChallengeAdminPanel'

export default async function AdminDesafiosPage() {
  const desafios = await getChallenges()

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold uppercase tracking-wide text-white">
          Gerenciar desafios
        </h2>
        <p className="text-sm text-[var(--brand-text-muted)]">
          Configure os desafios semanais e acompanhe o progresso dos membros.
        </p>
      </div>

      <ChallengeAdminPanel initialChallenges={desafios} />
    </section>
  )
}
