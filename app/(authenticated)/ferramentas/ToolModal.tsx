'use client'

import { useEffect, useCallback } from 'react'
import { X, Youtube, FileDown, Wrench } from 'lucide-react'
import type { ToolRecord } from '@/lib/queries'
import { useTranslations } from 'next-intl'

function getYoutubeEmbedId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function ToolModal({
  tool,
  onClose,
}: {
  tool: ToolRecord
  onClose: () => void
}) {
  const t = useTranslations('UserToolModal')
  const embedId = tool.youtube_url ? getYoutubeEmbedId(tool.youtube_url) : null
  const hasPdf = Boolean(tool.pdf_url)
  const hasVideo = Boolean(tool.youtube_url)

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [close])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Painel */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-slate-700/60 bg-[var(--brand-surface-alt)] shadow-2xl shadow-black/60 sm:rounded-2xl">

        {/* Barra de arrasto (mobile) */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-600 sm:hidden" />

        {/* Cabeçalho */}
        <div className="flex items-start gap-3 px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-surface)]">
            {hasVideo ? (
              <Youtube className="h-5 w-5 text-red-400" />
            ) : hasPdf ? (
              <FileDown className="h-5 w-5 text-blue-400" />
            ) : (
              <Wrench className="h-5 w-5 text-[var(--brand-text-muted)]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-snug text-white">{tool.titulo}</h2>
            {hasVideo && hasPdf && (
              <p className="mt-0.5 text-xs font-medium text-[var(--brand-text-muted)]">{t('lessonAndPdf')}</p>
            )}
            {hasVideo && !hasPdf && (
              <p className="mt-0.5 text-xs font-medium text-[var(--brand-text-muted)]">{t('videoLesson')}</p>
            )}
            {!hasVideo && hasPdf && (
              <p className="mt-0.5 text-xs font-medium text-[var(--brand-text-muted)]">{t('downloadMaterial')}</p>
            )}
          </div>
          <button
            onClick={close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700/60 bg-[var(--brand-surface)] text-[var(--brand-text-muted)] transition hover:border-slate-600 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Player de vídeo */}
        {hasVideo && (
          <div className="w-full bg-black">
            {embedId ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${embedId}?rel=0`}
                  title={tool.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : (
              <a
                href={tool.youtube_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex aspect-video w-full items-center justify-center bg-slate-950"
              >
                <Youtube className="h-12 w-12 text-red-400" />
              </a>
            )}
          </div>
        )}

        {/* Corpo */}
        <div className="space-y-4 overflow-y-auto px-5 pb-6 pt-4 sm:px-6">
          {/* Descrição */}
          {tool.descricao && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t('descriptionLabel')}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{tool.descricao}</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-3">
            {hasPdf && (
              <a
                href={tool.pdf_url!}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 active:scale-95"
              >
                <FileDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
                {t('downloadPdf')} {tool.pdf_nome ? `"${tool.pdf_nome}"` : 'PDF'}
              </a>
            )}
            {hasVideo && tool.youtube_url && (
              <a
                href={tool.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600/50 bg-[var(--brand-surface)] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500/70 hover:text-white active:scale-95"
              >
                <Youtube className="h-4 w-4 text-red-400" />
                {t('openYoutube')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
