import { getArticles } from '@/lib/queries'
import { Activity, Coffee, Heart, Sparkles, Lightbulb, type LucideIcon } from 'lucide-react'

const filtros = ['Todos', 'Inspiração', 'Dicas', 'Desenvolvimento', 'Palestras']

const CATEGORIA_ICONS: Record<string, LucideIcon> = {
  treino: Activity,
  nutricao: Coffee,
  'bem-estar': Heart,
  dicas: Lightbulb,
  inspiracao: Sparkles,
  desenvolvimento: Heart,
  palestras: Activity,
}

function resolveIcon(icone: string | null, categoria: string | null): LucideIcon {
  const Icon = categoria ? CATEGORIA_ICONS[categoria.toLowerCase()] : null
  return Icon ?? Sparkles
}

export default async function BlogPage() {
  const artigos = await getArticles()

  return (
    <section className="space-y-6">
      <header className="space-y-1 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#f5f5f5]">
          Artigos e inspirações
        </h2>
        <p className="text-sm text-[#c9c9d2]">
          Conteúdos para aprender, refletir e se desenvolver com a comunidade.
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {filtros.map((filtro, index) => (
          <button
            key={filtro}
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              index === 0
                ? 'border border-blue-400/40 bg-blue-500/20 text-blue-200'
                : 'border border-slate-600/40 bg-slate-800/80 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/60 hover:text-slate-200'
            }`}
          >
            {filtro}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {artigos.map((artigo) => (
          <article
            key={artigo.id}
            className="flex items-center justify-between rounded-lg border border-slate-600/30 bg-slate-800/80 p-5 shadow-lg transition hover:border-slate-500/40"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#f5f5f5]">
                {(() => {
                  const Icon = resolveIcon(artigo.icone, artigo.categoria)
                  return <Icon className="h-6 w-6" />
                })()}
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#f5f5f5]">{artigo.titulo}</h3>
                <p className="text-sm text-[#c9c9d2]">
                  por {artigo.autor_handle || '@maxistalks'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#f5f5f5] transition hover:bg-[#f5f5f5] hover:text-[#0f0f10]"
            >
              Ler
            </button>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="w-full rounded-2xl border border-white/30 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#f5f5f5] transition hover:bg-[#f5f5f5] hover:text-[#0f0f10]"
      >
        Ver mais artigos
      </button>

      <div className="rounded-lg border border-slate-600/30 bg-slate-800/80 p-6 text-center shadow-lg">
        <h3 className="text-lg font-bold text-[#f5f5f5]">
          Quer publicar seu conteúdo aqui?
        </h3>
        <p className="mt-2 text-sm text-[#c9c9d2]">
          Compartilhe seus insights com a comunidade e inspire outros membros.
        </p>
        <button
          type="button"
          className="mt-5 rounded-full bg-[#f5f5f5] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#0f0f10] transition hover:brightness-95"
        >
          Contribua com a comunidade
        </button>
      </div>
    </section>
  )
}


