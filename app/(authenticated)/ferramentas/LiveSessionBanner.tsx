'use client'

import { useState, useEffect, useCallback } from 'react'
import { Radio, X, Youtube, Maximize2 } from 'lucide-react'
import type { LiveSessionRecord } from '@/lib/queries'

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

export function LiveSessionBanner({ session }: { session: LiveSessionRecord }) {
  const [open, setOpen] = useState(false)
  const embedId = getYoutubeEmbedId(session.youtube_url)

  const close = useCallback(() => setOpen(false), [])

  // Fecha com Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, close])

  // Trava scroll do body quando modal está aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Banner "Ao Vivo" */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-400">Ao vivo</span>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="group flex w-full items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-left transition hover:border-red-500/60 hover:bg-red-500/15 active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/20">
            <Radio className="h-6 w-6 text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white">{session.titulo ?? 'Evento ao vivo'}</p>
            <p className="mt-0.5 text-sm text-red-300/80">Clique para assistir agora</p>
          </div>
          <Maximize2 className="h-5 w-5 shrink-0 text-red-400 transition group-hover:scale-110" />
        </button>
      </section>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Caixa do modal */}
          <div className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-red-500/20 bg-slate-900 shadow-2xl shadow-black/60">
            {/* Cabeçalho */}
            <div className="flex items-center gap-3 border-b border-slate-700/60 px-4 py-3 sm:px-5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <p className="min-w-0 flex-1 truncate font-semibold text-white">
                {session.titulo ?? 'Ao vivo'}
              </p>
              {embedId && (
                <a
                  href={session.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-600/40 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500/60 hover:text-white"
                >
                  <Youtube className="h-3.5 w-3.5 text-red-400" />
                  YouTube
                </a>
              )}
              <button
                onClick={close}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-600/40 bg-slate-800 text-slate-400 transition hover:border-slate-500/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Player */}
            {embedId ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`}
                  title={session.titulo ?? 'Ao vivo'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <Youtube className="h-12 w-12 text-red-400" />
                <p className="text-slate-300">Link não reconhecido como YouTube. Abra diretamente:</p>
                <a
                  href={session.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-500"
                >
                  Abrir transmissão
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
