import { getArticles } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { ArticleAdminPanel } from './ArticleAdminPanel'

export default async function AdminConteudoPage() {
  const tenantId = await getTenantIdForRequest()
  const artigos = await getArticles('all', tenantId)

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold uppercase tracking-wide text-white">
          Gerenciar conteúdo
        </h2>
        <p className="text-sm text-slate-400">
          Publique artigos, dicas e materiais exclusivos para a comunidade.
        </p>
      </div>

      <ArticleAdminPanel initialArticles={artigos} />
    </section>
  )
}
