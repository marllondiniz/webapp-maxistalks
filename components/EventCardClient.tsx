'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'
import type { EventRecord, EventBannerRecord } from '@/lib/queries'
import { InstagramLink } from '@/components/InstagramLink'
import { EventPreviewModal } from './EventPreviewModal'

function formatEventDate(date: string | null) {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date(date))
    .replace('.', '')
}

export function EventCardClient({
  evento,
  banner,
  isDestaque,
}: {
  evento: EventRecord
  banner: EventBannerRecord | null
  isDestaque?: boolean
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const titulo = banner?.titulo ?? evento.titulo
  const subtitulo = banner?.subtitulo ?? evento.titulo

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={`group relative flex cursor-pointer overflow-hidden rounded-xl border border-slate-600/20 bg-slate-800/90 shadow-lg transition-all hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 ${
          isDestaque
            ? 'min-h-[200px] flex-col md:flex-row md:min-h-[128px]'
            : 'flex-row min-h-[128px]'
        }`}
      >
        {banner ? (
          <div
            className={`relative shrink-0 overflow-hidden ${
              isDestaque 
                ? 'h-44 w-full md:h-32 md:w-36' 
                : 'h-32 w-36'
            }`}
          >
            <Image
              src={banner.image_url}
              alt={titulo}
              fill
              sizes={isDestaque ? '(max-width: 768px) 100vw, 144px' : '144px'}
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            {isDestaque && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent md:hidden" />
            )}
          </div>
        ) : (
          <div className={`relative shrink-0 overflow-hidden ${isDestaque ? 'h-44 w-full md:h-32 md:w-36' : 'h-32 w-36'} flex items-center justify-center bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-slate-700/30`}>
            <Calendar className="h-12 w-12 text-blue-400/40" />
          </div>
        )}
        <div className={`relative z-10 flex flex-1 flex-col ${isDestaque ? 'justify-between md:justify-center' : 'justify-center'} p-5`}>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 w-fit">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-300">
                {formatEventDate(evento.data_horario)}
              </p>
            </div>
            <h3 className="text-base font-bold leading-snug text-white line-clamp-2">
              {titulo}
            </h3>
            {banner?.palestrante_instagram ? (
              <InstagramLink
                handle={banner.palestrante_instagram}
                className="text-sm font-medium text-blue-300 transition hover:text-blue-200"
              />
            ) : (
              <p className="text-sm text-slate-400 line-clamp-1">{subtitulo}</p>
            )}
          </div>
          {isDestaque && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition group-hover:text-blue-200 md:hidden">
              Ver detalhes
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className={`${isDestaque ? 'hidden md:flex' : 'flex'} items-center pr-5`}>
          <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-400" />
        </div>
      </div>

      <EventPreviewModal
        evento={evento}
        banner={banner}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
