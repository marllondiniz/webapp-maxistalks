import Image from 'next/image'
import Link from 'next/link'
import { getArticles } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { Activity, Coffee, Heart, Sparkles, Lightbulb, type LucideIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const CATEGORIA_ICONS: Record<string, LucideIcon> = {
  treino: Activity,
  nutricao: Coffee,
  'bem-estar': Heart,
  dicas: Lightbulb,
  inspiracao: Sparkles,
  desenvolvimento: Heart,
  palestras: Activity,
  vendas: Sparkles,
  marketing: Lightbulb,
}

function resolveIcon(icone: string | null, categoria: string | null): LucideIcon {
  const Icon = categoria ? CATEGORIA_ICONS[categoria.toLowerCase()] : null
  return Icon ?? Sparkles
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const t = await getTranslations('UserBlog')
  const { categoria } = await searchParams
  const tenantId = await getTenantIdForRequest()
  const artigos = await getArticles('blog', tenantId)

  const CATEGORIAS = [
    { value: 'todos', label: t('catAll') },
    { value: 'inspiracao', label: t('catInspiracao') },
    { value: 'dicas', label: t('catDicas') },
    { value: 'desenvolvimento', label: t('catDesenvolvimento') },
    { value: 'palestras', label: t('catPalestras') },
    { value: 'vendas', label: t('catVendas') },
    { value: 'marketing', label: t('catMarketing') },
  ]

  const artigosFiltrados =
    categoria && categoria !== 'todos'
      ? artigos.filter((a) => a.categoria?.toLowerCase() === categoria.toLowerCase())
      : artigos

  return (
    <section className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#f5f5f5]">
          {t('title')}
        </h2>
        <p className="text-sm text-[#c9c9d2]">
          {t('subtitle')}
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIAS.map((filtro) => {
          const isActive =
            (filtro.value === 'todos' && !categoria) || categoria === filtro.value
          return (
            <Link
              key={filtro.value}
              href={filtro.value === 'todos' ? '/blog' : `/blog?categoria=${filtro.value}`}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                isActive
                  ? 'border border-blue-400/40 bg-blue-500/20 text-blue-200'
                  : 'border border-slate-600/40 bg-[var(--brand-surface)]/80 text-slate-300 hover:border-slate-500/50 hover:bg-[var(--brand-surface)]/60 hover:text-slate-200'
              }`}
            >
              {filtro.label}
            </Link>
          )
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {artigosFiltrados.map((artigo) => {
          const detailPath = `/blog/${artigo.id}`
          return (
          <Link
            key={artigo.id}
            href={detailPath}
            className="group overflow-hidden rounded-xl border border-slate-600/30 bg-[var(--brand-surface)]/80 shadow-lg transition hover:border-slate-500/40 hover:shadow-xl"
          >
            <div className="flex flex-col">
              {artigo.image_url ? (
                <div className="relative aspect-[16/10] w-full shrink-0">
                  <Image
                    src={artigo.image_url}
                    alt={artigo.titulo}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition group-hover:scale-[1.02]"
                  />
                  {artigo.categoria && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                      {artigo.categoria}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-slate-700/50 to-slate-800/80">
                  {(() => {
                    const Icon = resolveIcon(artigo.icone, artigo.categoria)
                    return <Icon className="h-12 w-12 text-slate-500" />
                  })()}
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-bold text-[#f5f5f5] line-clamp-2 transition group-hover:text-white">
                  {artigo.titulo}
                </h3>
                <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                  por {artigo.autor_handle || '@maxistalks'}
                </p>
                {artigo.resumo && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{artigo.resumo}</p>
                )}
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)] transition group-hover:text-blue-400">
                  {t('readLink')}
                  <span className="inline-block transition group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </div>
          </Link>
        )})}
      </div>

      {artigosFiltrados.length === 0 && (
        <div className="rounded-xl border border-slate-600/30 bg-[var(--brand-surface)]/80 p-12 text-center">
          <p className="text-sm text-[var(--brand-text-muted)]">{t('emptyContent')}</p>
          <Link
            href="/eventos"
            className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)] transition hover:text-blue-400"
          >
            {t('seeEvents')}
          </Link>
        </div>
      )}
    </section>
  )
}
