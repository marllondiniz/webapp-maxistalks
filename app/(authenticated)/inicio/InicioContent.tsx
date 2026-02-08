import Link from 'next/link'
import Image from 'next/image'
import {
  getActiveEventBanners,
  getEvents,
  getArticles,
  type EventBannerRecord,
  type EventRecord,
  type ArticleRecord,
} from '@/lib/queries'
import { Calendar, BookOpenText, UsersRound, ChevronRight } from 'lucide-react'
import { InstagramLink } from '@/components/InstagramLink'

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

function QuickLink({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-slate-600/30 bg-slate-800/80 p-4 transition hover:border-slate-500/40 hover:bg-slate-700/50"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700/60 text-[#f5f5f5] transition group-hover:bg-slate-600/50">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#f5f5f5]">{label}</p>
        <p className="text-xs text-[#9a9aa2]">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:text-[#f5f5f5]" />
    </Link>
  )
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
      className={`group relative flex overflow-hidden rounded-xl border border-slate-600/30 shadow-lg transition hover:border-slate-500/40 ${
        isDestaque
          ? 'min-h-[200px] flex-col'
          : 'flex-row bg-slate-800/80'
      } ${isDestaque && banner ? 'bg-slate-900' : isDestaque ? 'bg-slate-800/80' : ''}`}
    >
      {banner && (
        <div
          className={`relative shrink-0 ${
            isDestaque ? 'h-48 w-full' : 'h-28 w-28'
          }`}
        >
          <Image
            src={banner.image_url}
            alt={titulo}
            fill
            sizes={isDestaque ? '(max-width: 768px) 100vw, 480px' : '96px'}
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10]/95 via-[#0f0f10]/50 to-transparent" />
        </div>
      )}
      <div className="relative z-10 flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {formatEventDate(evento.data_horario)}
          </p>
          <h3 className="mt-1 font-semibold text-[#f5f5f5] line-clamp-2">{titulo}</h3>
          {banner?.palestrante_instagram && (
            <InstagramLink
              handle={banner.palestrante_instagram}
              className="mt-0.5 inline-block cursor-pointer text-xs font-semibold text-blue-300 transition hover:text-blue-200"
            />
          )}
          {!isDestaque && !banner?.palestrante_instagram && (
            <p className="mt-0.5 text-xs text-[#9a9aa2] line-clamp-1">{subtitulo}</p>
          )}
        </div>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-300 transition group-hover:text-blue-200">
          Ver detalhes
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function ConteudoDestaqueCard({ artigo }: { artigo: ArticleRecord }) {
  return (
    <Link
      href={`/blog/${artigo.id}`}
      className="group flex overflow-hidden rounded-xl border border-slate-600/30 bg-slate-800/80 transition hover:border-slate-500/40"
    >
      {artigo.image_url ? (
        <div className="relative h-20 w-24 shrink-0">
          <Image
            src={artigo.image_url}
            alt={artigo.titulo}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      ) : (
        <span className="flex h-20 w-24 shrink-0 items-center justify-center bg-white/5" />
      )}
      <div className="flex flex-1 flex-col justify-center p-4">
        <h4 className="font-semibold text-[#f5f5f5] line-clamp-1">{artigo.titulo}</h4>
        <p className="text-xs text-slate-400">{artigo.autor_handle}</p>
      </div>
      <ChevronRight className="mr-3 h-5 w-5 shrink-0 text-slate-500 group-hover:text-[#f5f5f5]" />
    </Link>
  )
}

export async function InicioContent() {
  const [eventos, banners, artigosInicio] = await Promise.all([
    getEvents(),
    getActiveEventBanners(),
    getArticles('inicio'),
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
    <div className="space-y-6">
      {/* Próximos eventos - único bloco */}
      {eventosOrdenados.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Próximos eventos
            </h3>
            <Link
              href="/eventos"
              className="text-xs font-semibold text-blue-300 transition hover:text-blue-200"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
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
        <div className="rounded-xl border border-slate-600/30 bg-slate-800/80 p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-500" />
          <p className="mt-3 font-semibold text-[#f5f5f5]">Nenhum evento em breve</p>
          <p className="mt-1 text-sm text-[#9a9aa2]">
            Fique ligado! Novas palestras e encontros serão anunciados em breve.
          </p>
          <Link
            href="/eventos"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/30"
          >
            Ver eventos
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Conteúdo em destaque */}
      {artigosInicio.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Conteúdo em destaque
            </h3>
            <Link
              href="/blog"
              className="text-xs font-semibold text-blue-300 transition hover:text-blue-200"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {artigosInicio.slice(0, 3).map((artigo) => (
              <ConteudoDestaqueCard key={artigo.id} artigo={artigo} />
            ))}
          </div>
        </div>
      )}

      {/* Acesso rápido */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Acesso rápido
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickLink
            href="/eventos"
            icon={Calendar}
            label="Eventos"
            description="Próximas palestras e encontros"
          />
          <QuickLink
            href="/clube"
            icon={UsersRound}
            label="Comunidade"
            description="Conecte-se com outros membros"
          />
          <QuickLink
            href="/blog"
            icon={BookOpenText}
            label="Conteúdo"
            description="Artigos e inspirações"
          />
        </div>
      </div>
    </div>
  )
}
