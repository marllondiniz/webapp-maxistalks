import Link from 'next/link'
import Image from 'next/image'
import {
  getActiveEventBanners,
  getEvents,
  getArticles,
  getActiveLiveSession,
  type EventBannerRecord,
  type EventRecord,
  type ArticleRecord,
} from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { Calendar, BookOpenText, ChevronRight, AlertCircle } from 'lucide-react'
import { InstagramLink } from '@/components/InstagramLink'
import { PainForm } from '../ferramentas/PainForm'
import { LiveSessionBanner } from '../ferramentas/LiveSessionBanner'

/** Formata data/hora do evento no fuso de Brasília (evita erro quando o Server Component roda em UTC). */
function formatEventDate(date: string | null) {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
    .format(new Date(date))
    .replace('.', '')
}

function EventCard({
  evento,
  banner,
  isDestaque,
}: {
  evento: EventRecord
  banner: EventBannerRecord | null
  isDestaque?: boolean
}) {
  const titulo = banner?.titulo ?? evento.titulo
  const subtitulo = banner?.subtitulo ?? evento.titulo
  return (
    <Link
      href={`/eventos/${evento.id}`}
      className={`group relative flex overflow-hidden rounded-xl border border-slate-600/20 bg-slate-800/90 shadow-lg transition-all hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 ${
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
              : 'w-36 self-stretch'
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
        <div className={`relative shrink-0 overflow-hidden ${isDestaque ? 'h-44 w-full md:h-32 md:w-36' : 'w-36 self-stretch'} flex items-center justify-center bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-slate-700/30`}>
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
    </Link>
  )
}

function ConteudoDestaqueCard({ artigo }: { artigo: ArticleRecord }) {
  return (
    <Link
      href={`/blog/${artigo.id}`}
      className="group relative flex items-stretch overflow-hidden rounded-xl border border-slate-600/20 bg-slate-800/90 shadow-lg transition-all hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 min-h-[128px]"
    >
      {artigo.image_url ? (
        <div className="relative w-36 shrink-0 overflow-hidden self-stretch md:h-32 md:self-auto">
          <Image
            src={artigo.image_url}
            alt={artigo.titulo}
            fill
            sizes="144px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="relative w-36 shrink-0 overflow-hidden self-stretch md:h-32 md:self-auto flex items-center justify-center bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-slate-700/30">
          <BookOpenText className="h-12 w-12 text-blue-400/40" />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center p-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 w-fit">
            <BookOpenText className="h-3.5 w-3.5 text-blue-400" />
            <p className="text-[11px] font-bold uppercase tracking-wide text-blue-300">
              Artigo
            </p>
          </div>
          <h4 className="text-base font-bold leading-snug text-white line-clamp-2">
            {artigo.titulo}
          </h4>
          <p className="text-sm font-medium text-blue-300">{artigo.autor_handle}</p>
        </div>
      </div>
      <div className="flex items-center pr-5">
        <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-400" />
      </div>
    </Link>
  )
}

export async function InicioContent() {
  const tenantId = await getTenantIdForRequest()
  const [eventos, banners, artigosInicio, liveSession] = await Promise.all([
    getEvents(tenantId),
    getActiveEventBanners(tenantId),
    getArticles('inicio', tenantId),
    getActiveLiveSession(tenantId),
  ])

  const eventosOrdenados = [...eventos].sort(
    (a, b) => new Date(a.data_horario).getTime() - new Date(b.data_horario).getTime()
  )
  const agora = new Date()
  const eventosFuturos = eventosOrdenados.filter((e) => new Date(e.data_horario) >= agora)
  const eventosParaMostrar =
    eventosFuturos.length > 0 ? eventosFuturos.slice(0, 4) : eventosOrdenados.slice(0, 4)
  const proximoEvento = eventosParaMostrar[0]
  const destaqueBanner: EventBannerRecord | null =
    proximoEvento?.id ? banners.find((b) => b.event_id === proximoEvento.id) ?? null : null

  return (
    <div className="space-y-8">
      {/* Ao vivo */}
      {liveSession && <LiveSessionBanner session={liveSession} />}

      {/* Próximos eventos - único bloco */}
      {eventosOrdenados.length > 0 ? (
        <div className="pb-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Próximos eventos
            </h3>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-300 transition hover:text-blue-200"
            >
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            <EventCard
              evento={proximoEvento!}
              banner={destaqueBanner}
              isDestaque
            />
            {eventosParaMostrar.slice(1).map((evento) => {
              const banner = banners.find((b) => b.event_id === evento.id) ?? null
              return (
                <EventCard key={evento.id} evento={evento} banner={banner} />
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-600/30 bg-slate-800/80 p-10 text-center shadow-sm">
          <Calendar className="mx-auto h-14 w-14 text-slate-500" />
          <p className="mt-4 text-lg font-semibold text-[#f5f5f5]">Nenhum evento em breve</p>
          <p className="mt-2 text-sm text-slate-400">
            Fique ligado! Novas palestras e encontros serão anunciados em breve.
          </p>
          <Link
            href="/eventos"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-5 py-2.5 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/30"
          >
            Ver eventos
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Conteúdo em destaque */}
      {artigosInicio.length > 0 && (
        <div className="pb-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Conteúdo em destaque
            </h3>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-300 transition hover:text-blue-200"
            >
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {artigosInicio.slice(0, 3).map((artigo) => (
              <ConteudoDestaqueCard key={artigo.id} artigo={artigo} />
            ))}
          </div>
        </div>
      )}

      {/* Registrar desafio */}
      <div className="pb-4">
        <div className="mb-3">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            Registrar meu desafio
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Compartilhe seu maior desafio. Isso nos ajuda a criar conteúdos e ferramentas mais relevantes para você.
          </p>
        </div>
        <div className="rounded-xl border border-slate-600/30 bg-slate-800/80 p-4">
          <PainForm tenantId={tenantId} />
        </div>
      </div>
    </div>
  )
}
