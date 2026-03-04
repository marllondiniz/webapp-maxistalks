import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleById, getArticleGallery } from '@/lib/queries'
import { getBrandForRequest, getTenantIdForRequest } from '@/lib/brand'
import { ChevronLeft } from 'lucide-react'
import { ArticleGalleryCarousel } from './ArticleGalleryCarousel'
import { ArticleComments } from './ArticleComments'
import { getTranslations, getLocale } from 'next-intl/server'

type ArticlePageParams = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ArticlePageParams): Promise<Metadata> {
  const { id } = await params
  const [brand, tenantId, t] = await Promise.all([
    getBrandForRequest(),
    getTenantIdForRequest(),
    getTranslations('UserBlogDetail'),
  ])
  const artigo = await getArticleById(id, tenantId)

  if (!artigo) {
    return {
      title: `${brand.name} | ${brand.tagline}`,
      description: brand.tagline,
    }
  }

  const url = new URL(`/blog/${artigo.id}`, brand.baseUrl)
  const description =
    artigo.resumo ||
    (artigo.conteudo ? artigo.conteudo.replace(/<[^>]+>/g, '').slice(0, 160) : brand.tagline)

  return {
    title: artigo.titulo,
    description,
    openGraph: {
      title: artigo.titulo,
      description,
      url,
      siteName: brand.name,
      type: 'article',
      images: artigo.image_url
        ? [
            {
              url: artigo.image_url,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: artigo.titulo,
      description,
      images: artigo.image_url ? [artigo.image_url] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageParams) {
  const { id } = await params
  const [t, locale, tenantId] = await Promise.all([
    getTranslations('UserBlogDetail'),
    getLocale(),
    getTenantIdForRequest(),
  ])
  const [artigo, gallery] = await Promise.all([
    getArticleById(id, tenantId),
    getArticleGallery(id),
  ])

  if (!artigo) {
    notFound()
  }

  const dataPublicacao = artigo.publicado_em
    ? new Date(artigo.publicado_em).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--brand-text-muted)] transition hover:text-[#f5f5f5]"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('backToContent')}
      </Link>

      <header className="space-y-4">
        {artigo.categoria && (
          <span className="inline-block rounded-full bg-[var(--brand-primary)]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
            {artigo.categoria}
          </span>
        )}
        <h1 className="text-2xl font-bold leading-tight text-[#f5f5f5] sm:text-3xl">
          {artigo.titulo}
        </h1>
        <div className="flex items-center gap-3 text-sm text-[var(--brand-text-muted)]">
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
        <div 
          className="text-[15px] leading-relaxed text-[#c9c9d2] 
            [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:leading-tight
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:leading-tight
            [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:leading-tight
            [&_p]:mb-4 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:space-y-2
            [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:space-y-2
            [&_li]:mb-2 [&_li]:leading-relaxed
            [&_strong]:font-bold [&_strong]:text-white
            [&_em]:italic
            [&_u]:underline
            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-slate-300
            [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-blue-300
            [&_pre]:bg-black/30 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0
            [&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-300 [&_a]:transition-colors
            [&_img]:rounded-lg [&_img]:my-6 [&_img]:w-full [&_img]:h-auto [&_img]:shadow-lg"
          dangerouslySetInnerHTML={{ __html: artigo.conteudo || artigo.resumo || `<p>${t('contentSoon')}</p>` }}
        />
      </div>

      <ArticleComments articleId={id} />

      <div className="mt-8 border-t border-slate-600/30 pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-600/40 bg-[var(--brand-surface)]/80 px-5 py-3 text-sm font-semibold text-[#f5f5f5] transition hover:border-slate-500/50 hover:bg-[var(--brand-surface)]/60"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('seeMoreArticles')}
        </Link>
      </div>
    </article>
  )
}
