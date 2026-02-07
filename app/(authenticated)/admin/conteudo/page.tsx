import { getArticles } from '@/lib/queries'
import { ArticleAdminPanel } from './ArticleAdminPanel'

export default async function AdminConteudoPage() {
  const artigos = await getArticles()

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
