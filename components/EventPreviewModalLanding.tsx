'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, Calendar, MapPin } from 'lucide-react'

export type EventPreviewLanding = {
  id: string
  titulo: string
  descricao?: string | null
  data_horario: string
  local_nome: string
  destaque?: boolean | null
  banner?: {
    image_url: string
    titulo: string | null
    subtitulo: string | null
    palestrante_instagram?: string | null
    palestrante_descricao?: string | null
  } | null
}

type EventPreviewModalLandingProps = {
  event: EventPreviewLanding | null
  isOpen: boolean
  onClose: () => void
  isPast?: boolean
}

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getPreviewDescription(descricao: string | null | undefined): string {
  if (!descricao?.trim()) return ''
  try {
    const parsed = JSON.parse(descricao) as {
      sections?: Array<{ titulo?: string | null; conteudo?: string | null }>
    }
    const first = parsed?.sections?.[0]?.conteudo
    if (typeof first === 'string' && first.trim()) {
      const text = first.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
      return text.length > 280 ? text.slice(0, 280) + '...' : text
    }
  } catch {
    // ignore
  }
  if (descricao.includes('---')) {
    const part = descricao.split(/^-{3,}$|---+/gm)[0]?.trim() || ''
    const text = part.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    return text.length > 280 ? text.slice(0, 280) + '...' : text
  }
  const text = descricao.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return text.length > 280 ? text.slice(0, 280) + '...' : text
}

export function EventPreviewModalLanding({
  event,
  isOpen,
  onClose,
  isPast = false,
}: EventPreviewModalLandingProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !event) return null

  const titulo = event.banner?.titulo ?? event.titulo
  const nomePalestrante = event.banner?.subtitulo ?? event.titulo
  const previewText = getPreviewDescription(event.descricao)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f172a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-[#3b82f6]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
              Próxima edição
            </span>
            <span className="text-xs text-slate-500">
              {formatDate(event.data_horario)} • {formatTime(event.data_horario)}h
            </span>
          </div>

          <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
            {titulo}
          </h2>

          <div className="mt-3 space-y-1">
            <h3 className="text-lg font-semibold text-white">{nomePalestrante}</h3>
            {event.banner?.palestrante_instagram && (
              <a
                href={`https://instagram.com/${event.banner.palestrante_instagram.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                @{event.banner.palestrante_instagram.replace(/^@/, '')}
              </a>
            )}
            {event.banner?.palestrante_descricao && (
              <p className="text-sm leading-relaxed text-slate-400">
                {event.banner.palestrante_descricao}
              </p>
            )}
          </div>

          {previewText && (
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {previewText}
            </p>
          )}

          {event.local_nome && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="text-xs text-slate-500">Local</p>
                <p className="font-medium text-white">{event.local_nome}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={isPast ? '#' : '/login?mode=signUp'}
              onClick={onClose}
              className={`flex-1 rounded-xl py-3.5 text-center text-sm font-bold uppercase tracking-wider transition ${
                isPast
                  ? 'cursor-default bg-white/[0.06] text-slate-400'
                  : 'btn-glow bg-[#3b82f6] text-white hover:bg-[#2563eb]'
              }`}
            >
              {isPast ? 'Evento realizado' : 'Inscreva-se'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
