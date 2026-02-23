import { getTenantIdForRequest } from '@/lib/brand'
import CustomizacaoPanel from './CustomizacaoPanel'

export default async function CustomizacaoPage() {
  await getTenantIdForRequest()
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold uppercase tracking-wide text-white">
          Customização
        </h2>
        <p className="text-sm text-slate-400">
          Configure a identidade visual e as informações da página principal desta empresa.
        </p>
      </div>
      <CustomizacaoPanel />
    </section>
  )
}
