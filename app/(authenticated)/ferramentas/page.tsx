import { unstable_noStore } from 'next/cache'
import { getTools, getActiveLiveSession } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { Wrench, Youtube, FileDown, Radio, AlertCircle } from 'lucide-react'
import { PainForm } from './PainForm'

export const dynamic = 'force-dynamic'

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

export default async function FerramentasPage() {
  unstable_noStore()
  const tenantId = await getTenantIdForRequest()
  const [tools, liveSession] = await Promise.all([
    getTools(tenantId),
    getActiveLiveSession(tenantId),
  ])

  const toolsComVideo = tools.filter((t) => t.youtube_url)
  const toolsComPdf = tools.filter((t) => t.pdf_url)

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Ferramentas</h1>
        <p className="mt-1 text-sm text-slate-400">
          Recursos, materiais e conteúdos para acelerar o seu negócio.
        </p>
      </div>

      {/* Ao vivo */}
      {liveSession && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Ao vivo</span>
            </span>
          </div>
          <a
            href={liveSession.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 transition hover:border-red-500/60 hover:bg-red-500/15"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <Radio className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">{liveSession.titulo ?? 'Evento ao vivo'}</p>
              <p className="mt-0.5 text-sm text-red-300/80">Clique para assistir no YouTube</p>
            </div>
            <Youtube className="h-5 w-5 shrink-0 text-red-400 transition group-hover:scale-110" />
          </a>
        </section>
      )}

      {/* Ferramentas — sem conteúdo */}
      {tools.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-600/30 bg-slate-800/50 px-6 py-14 text-center">
          <Wrench className="h-12 w-12 text-slate-600" />
          <p className="text-base font-semibold text-slate-300">Nenhuma ferramenta disponível</p>
          <p className="text-sm text-slate-500">Em breve novos recursos serão publicados aqui.</p>
        </div>
      )}

      {/* Aulas em vídeo */}
      {toolsComVideo.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-slate-300">
            <Youtube className="h-4 w-4 text-red-400" />
            Aulas
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {toolsComVideo.map((tool) => {
              const embedId = tool.youtube_url ? getYoutubeEmbedId(tool.youtube_url) : null
              return (
                <div
                  key={tool.id}
                  className="overflow-hidden rounded-2xl border border-slate-600/30 bg-slate-800/80 shadow-lg"
                >
                  {embedId ? (
                    <div className="relative aspect-video w-full">
                      <iframe
                        src={`https://www.youtube.com/embed/${embedId}`}
                        title={tool.titulo}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  ) : (
                    <a
                      href={tool.youtube_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex aspect-video w-full items-center justify-center bg-slate-900"
                    >
                      <Youtube className="h-10 w-10 text-red-400" />
                    </a>
                  )}
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-white">{tool.titulo}</h3>
                    {tool.descricao && (
                      <p className="text-sm text-slate-400 leading-relaxed">{tool.descricao}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* PDFs */}
      {toolsComPdf.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-slate-300">
            <FileDown className="h-4 w-4 text-blue-400" />
            Downloads
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {toolsComPdf.map((tool) => (
              <a
                key={tool.id}
                href={tool.pdf_url!}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="group flex items-center gap-4 rounded-2xl border border-slate-600/30 bg-slate-800/80 px-4 py-4 shadow-lg transition hover:border-blue-500/40 hover:bg-slate-800"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                  <FileDown className="h-5 w-5 text-blue-400 transition group-hover:translate-y-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{tool.titulo}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {tool.pdf_nome ?? 'Baixar PDF'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Registrar dor */}
      <section className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-slate-300">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            Registrar meu desafio
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Compartilhe seu maior desafio. Isso nos ajuda a criar conteúdos e ferramentas mais relevantes para você.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-600/30 bg-slate-800/80 p-4">
          <PainForm tenantId={tenantId} />
        </div>
      </section>
    </div>
  )
}
