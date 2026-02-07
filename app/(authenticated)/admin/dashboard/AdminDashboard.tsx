'use client'

import { useState } from 'react'
import {
  Users,
  Calendar,
  Building2,
  Mail,
  MapPin,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type {
  EventRegistrationWithDetails,
  DashboardStats,
} from '@/lib/queries'

type Props = {
  registrations: EventRegistrationWithDetails[]
  stats: DashboardStats
}

function formatDate(value: string) {
  if (!value) return '-'
  const d = new Date(value)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatEventDate(value: string) {
  if (!value) return '-'
  const d = new Date(value)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminDashboard({ registrations, stats }: Props) {
  const [filterEvent, setFilterEvent] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'event' | 'name'>('recent')
  const [expanded, setExpanded] = useState(true)

  const filtered =
    filterEvent === 'all'
      ? registrations
      : registrations.filter((r) => r.event_id === filterEvent)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy === 'event') {
      return a.event_titulo.localeCompare(b.event_titulo, 'pt-BR')
    }
    return (a.user_nome ?? a.user_email ?? '').localeCompare(
      b.user_nome ?? b.user_email ?? '',
      'pt-BR'
    )
  })

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold uppercase tracking-wide text-white">
          Dashboard de inscrições
        </h2>
        <p className="text-sm text-slate-400">
          Quem se inscreveu em qual evento e informações dos participantes.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#3b82f6]/20 p-2.5">
              <Users className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total de inscrições</p>
              <p className="text-2xl font-bold text-white">{stats.totalInscricoes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2.5">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Usuários únicos</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsuariosUnicos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2.5">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Eventos com inscrições</p>
              <p className="text-2xl font-bold text-white">
                {stats.inscricoesPorEvento.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/20 p-2.5">
              <Users className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Média por evento</p>
              <p className="text-2xl font-bold text-white">
                {stats.inscricoesPorEvento.length > 0
                  ? Math.round(
                      stats.totalInscricoes / stats.inscricoesPorEvento.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inscrições por evento */}
      {stats.inscricoesPorEvento.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Inscrições por evento
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.inscricoesPorEvento
              .sort((a, b) => b.total - a.total)
              .map(({ eventoId, titulo, total }) => (
                <span
                  key={eventoId}
                  className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-200"
                >
                  {titulo}: <strong className="text-white">{total}</strong>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Lista de inscrições */}
      <div className="rounded-xl border border-white/10 bg-[#1e293b] overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-white">Lista de inscrições</h3>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {registrations.length} registro(s)
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>

        {expanded && (
          <div className="border-t border-white/10">
            {/* Filtros e ordenação */}
            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/5 px-5 py-3">
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
              >
                <option value="all">Todos os eventos</option>
                {stats.inscricoesPorEvento.map(({ eventoId, titulo }) => (
                  <option key={eventoId} value={eventoId}>
                    {titulo}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'event' | 'name')}
                className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
              >
                <option value="recent">Mais recente primeiro</option>
                <option value="event">Por evento</option>
                <option value="name">Por nome</option>
              </select>
            </div>

            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#1e293b] text-left">
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 font-semibold text-slate-300">Data</th>
                    <th className="px-5 py-3 font-semibold text-slate-300">Participante</th>
                    <th className="px-5 py-3 font-semibold text-slate-300">Evento</th>
                    <th className="px-5 py-3 font-semibold text-slate-300">Empresa</th>
                    <th className="px-5 py-3 font-semibold text-slate-300">Contato</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-center text-slate-400" colSpan={5}>
                        Nenhuma inscrição encontrada.
                      </td>
                    </tr>
                  ) : (
                    sorted.map((r) => (
                      <tr
                        key={r.id || `${r.event_id}-${r.user_id}`}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="px-5 py-3 text-slate-300 whitespace-nowrap">
                          {formatDate(r.created_at)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="space-y-0.5">
                            <p className="font-medium text-white">
                              {r.user_nome || '—'}
                            </p>
                            {r.user_email && (
                              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Mail className="h-3 w-3" />
                                {r.user_email}
                              </p>
                            )}
                            {r.user_cidade && (
                              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                <MapPin className="h-3 w-3" />
                                {r.user_cidade}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="space-y-0.5">
                            <p className="font-medium text-white">
                              {r.event_titulo}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatEventDate(r.event_data_horario)}
                            </p>
                            <p className="text-xs text-slate-400">{r.event_local}</p>
                            {r.event_capacidade != null && (
                              <p className="text-xs text-slate-500">
                                Capacidade: {r.event_capacidade}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="space-y-0.5">
                            {r.user_empresa && (
                              <p className="flex items-center gap-1.5 text-slate-300">
                                <Building2 className="h-3 w-3" />
                                {r.user_empresa}
                              </p>
                            )}
                            {r.user_area && (
                              <p className="text-xs text-slate-400">{r.user_area}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {r.user_instagram && (
                            <a
                              href={`https://instagram.com/${r.user_instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#3b82f6] hover:underline"
                            >
                              {r.user_instagram}
                            </a>
                          )}
                          {!r.user_instagram && (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
