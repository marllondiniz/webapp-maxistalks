'use client'

import { useState, useMemo } from 'react'
import { Youtube, FileDown, ChevronRight } from 'lucide-react'
import type { ToolRecord } from '@/lib/queries'
import { ToolModal } from './ToolModal'

const FILTROS_TEMA = [
  { value: 'all', label: 'Todos' },
  { value: 'aula', label: 'Aulas' },
  { value: 'ferramenta', label: 'Ferramentas' },
] as const

function getYoutubeThumb(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg`
  }
  return null
}

function ToolCard({ tool, onClick }: { tool: ToolRecord; onClick: () => void }) {
  const thumb = tool.youtube_url ? getYoutubeThumb(tool.youtube_url) : null
  const hasPdf = Boolean(tool.pdf_url)
  const hasVideo = Boolean(tool.youtube_url)

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-stretch overflow-hidden rounded-2xl border border-slate-600/30 bg-slate-800/80 text-center shadow-lg transition hover:border-slate-500/50 hover:bg-slate-800 active:scale-[0.99]"
    >
      {/* Thumbnail ou ícone */}
      <div className="relative flex h-auto w-28 shrink-0 items-center justify-center overflow-hidden bg-slate-900 sm:w-36">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={tool.titulo}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : hasPdf ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/20 to-slate-800">
            <FileDown className="h-10 w-10 text-blue-400/60" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800">
            <Youtube className="h-10 w-10 text-slate-600" />
          </div>
        )}

        {/* Badge tipo */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {hasVideo && (
            <span className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-red-400 backdrop-blur-sm">
              <Youtube className="h-3 w-3" />
              Aula
            </span>
          )}
          {hasPdf && (
            <span className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-blue-400 backdrop-blur-sm">
              <FileDown className="h-3 w-3" />
              PDF
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-4 py-4 text-center">
        <p className="font-bold leading-snug text-white line-clamp-2">{tool.titulo}</p>
        {tool.descricao && (
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{tool.descricao}</p>
        )}
      </div>

      {/* Seta */}
      <div className="flex items-center pr-4">
        <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-1 group-hover:text-slate-300" />
      </div>
    </button>
  )
}

export function ToolList({ tools }: { tools: ToolRecord[] }) {
  const [selected, setSelected] = useState<ToolRecord | null>(null)
  const [filterTema, setFilterTema] = useState<string>('all')

  const filteredTools = useMemo(() => {
    if (filterTema === 'all') return tools
    if (filterTema === 'aula') return tools.filter((t) => t.youtube_url)
    if (filterTema === 'ferramenta') return tools.filter((t) => t.pdf_url)
    return tools
  }, [tools, filterTema])

  const countLabel =
    filterTema === 'aula'
      ? filteredTools.length === 1
        ? 'aula'
        : 'aulas'
      : filteredTools.length === 1
        ? 'ferramenta'
        : 'ferramentas'

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {FILTROS_TEMA.map((f) => {
          const isActive = filterTema === f.value
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilterTema(f.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                isActive
                  ? 'border border-blue-400/40 bg-blue-500/20 text-blue-200'
                  : 'border border-slate-600/40 bg-slate-800/80 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/60 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <p className="text-center text-sm text-slate-400">
        {filteredTools.length} {countLabel}
      </p>

      <div className="space-y-3">
        {filteredTools.length === 0 ? (
          <p className="rounded-2xl border border-slate-600/30 bg-slate-800/50 px-6 py-8 text-center text-sm text-slate-400">
            {filterTema === 'aula' ? 'Nenhuma aula neste filtro.' : 'Nenhuma ferramenta neste filtro.'}
          </p>
        ) : (
          filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onClick={() => setSelected(tool)} />
          ))
        )}
      </div>

      {selected && (
        <ToolModal tool={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
