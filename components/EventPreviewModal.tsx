'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Calendar, MapPin, Banknote, Clock } from 'lucide-react'
import type { EventRecord, EventBannerRecord } from '@/lib/queries'
import { InstagramLink } from '@/components/InstagramLink'

type EventPreviewModalProps = {
  evento: EventRecord | null
  banner: EventBannerRecord | null
  isOpen: boolean
  onClose: () => void
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateString: string | null) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EventPreviewModal({
  evento,
  banner,
  isOpen,
  onClose,
}: EventPreviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !evento) return null

  const titulo = banner?.titulo ?? evento.titulo
  const subtitulo = banner?.subtitulo ?? evento.titulo
  const isFreeEvent = !evento.preco || evento.preco === 0

  // Extrair primeira seção da descrição se for JSON estruturado
  let previewDescription = ''
  if (evento.descricao) {
    try {
      const parsed = JSON.parse(evento.descricao) as {
        sections?: Array<{ titulo?: string | null; conteudo?: string | null }>
      }
      if (parsed?.sections?.[0]?.conteudo) {
        previewDescription = parsed.sections[0].conteudo
      }
    } catch {
      // Se não for JSON, usar descrição completa ou primeira parte
      if (evento.descricao.includes('---')) {
        previewDescription = evento.descricao.split(/^-{3,}$|---+/gm)[0]?.trim() || ''
      } else {
        previewDescription = evento.descricao.trim()
      }
    }
  }

  // Limitar descrição para prévia (remover HTML tags e limitar caracteres)
  const textOnly = previewDescription
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
  const shortDescription = textOnly.length > 200 ? textOnly.substring(0, 200) + '...' : textOnly

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-600/30 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/90 text-slate-400 transition hover:bg-slate-700 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        {banner?.image_url && (
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={banner.image_url}
              alt={titulo}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-16rem)] p-6">
          {/* Header */}
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
                Evento
              </span>
              <span className="text-xs text-slate-400">
                {formatDate(evento.data_horario)} • {formatTime(evento.data_horario)}
              </span>
            </div>

            <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
              {titulo}
            </h2>

            {banner?.palestrante_instagram && (
              <div className="space-y-1">
                {banner.subtitulo && (
                  <h3 className="text-lg font-semibold text-white">
                    {banner.subtitulo}
                  </h3>
                )}
                <InstagramLink
                  handle={banner.palestrante_instagram}
                  className="text-sm font-semibold text-blue-300 transition hover:text-blue-200"
                />
                {banner.palestrante_descricao && (
                  <p className="text-sm leading-relaxed text-slate-400">
                    {banner.palestrante_descricao}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description preview */}
          {shortDescription && (
            <div className="mb-6">
              <p className="text-sm leading-relaxed text-slate-300">
                {shortDescription}
              </p>
            </div>
          )}

          {/* Event details */}
          <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Data e hora</p>
                <p className="font-medium text-white">
                  {formatDate(evento.data_horario)} às {formatTime(evento.data_horario)}
                </p>
              </div>
            </div>

            {evento.local_nome && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Local</p>
                  <p className="font-medium text-white">{evento.local_nome}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Banknote className="h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Valor</p>
                <p className="font-medium text-white">
                  {isFreeEvent ? 'Gratuito' : `R$ ${evento.preco?.toFixed(2).replace('.', ',')}`}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/eventos/${evento.id}`}
              onClick={onClose}
              className="flex-1 rounded-lg bg-blue-500 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Ver detalhes completos
            </Link>
            {evento.localizacao_maps && (
              <a
                href={evento.localizacao_maps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <MapPin className="h-4 w-4" />
                Ver no mapa
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
