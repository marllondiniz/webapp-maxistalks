import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleById, getArticleGallery } from '@/lib/queries'
import { ChevronLeft } from 'lucide-react'
import { ArticleGalleryCarousel } from './ArticleGalleryCarousel'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [artigo, gallery] = await Promise.all([
    getArticleById(id),
    getArticleGallery(id),
  ])

  if (!artigo) {
    notFound()
  }

  const dataPublicacao = artigo.publicado_em
    ? new Date(artigo.publicado_em).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#f5f5f5]"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar ao conteúdo
      </Link>

      <header className="space-y-4">
        {artigo.categoria && (
          <span className="inline-block rounded-full bg-[#3b82f6]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">
            {artigo.categoria}
          </span>
        )}
        <h1 className="text-2xl font-bold leading-tight text-[#f5f5f5] sm:text-3xl">
          {artigo.titulo}
        </h1>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>{artigo.autor_handle || '@maxistalks'}</span>
          {dataPublicacao && (
            <>
              <span className="text-slate-600">•</span>
              <time dateTime={artigo.publicado_em ?? undefined}>{dataPublicacao}</time>
            </>
          )}
        </div>
      </header>

      {artigo.image_url && (
        <div className="relative my-8 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={artigo.image_url}
            alt={artigo.titulo}
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {gallery.length > 0 && (
        <ArticleGalleryCarousel photos={gallery} />
      )}

      <div className="prose prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#c9c9d2]">
          {artigo.conteudo || artigo.resumo || 'Conteúdo em breve.'}
        </div>
      </div>

      <div className="mt-12 border-t border-slate-600/30 pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-600/40 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-[#f5f5f5] transition hover:border-slate-500/50 hover:bg-slate-700/60"
        >
          <ChevronLeft className="h-4 w-4" />
          Ver mais artigos
        </Link>
      </div>
    </article>
  )
}
