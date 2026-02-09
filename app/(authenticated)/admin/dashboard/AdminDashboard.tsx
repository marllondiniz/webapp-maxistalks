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
  MessageCircle,
} from 'lucide-react'
import type {
  EventRegistrationWithDetails,
  DashboardStats,
  UserWithProfile,
} from '@/lib/queries'

type Props = {
  registrations: EventRegistrationWithDetails[]
  stats: DashboardStats
  allUsers: UserWithProfile[]
  configError?: string | null
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

export function AdminDashboard({ registrations, stats, allUsers, configError }: Props) {
  const [filterEvent, setFilterEvent] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'event' | 'name'>('recent')
  const [expanded, setExpanded] = useState(true)
  const [expandedUsers, setExpandedUsers] = useState(true)
  const [userSortBy, setUserSortBy] = useState<'name' | 'recent'>('recent')

  const filtered =
    filterEvent === 'all'
      ? registrations
      : registrations.filter((r) => r.event_id === filterEvent)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'recent') {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
      return timeB - timeA
    }
    if (sortBy === 'event') {
      return a.event_titulo.localeCompare(b.event_titulo, 'pt-BR')
    }
    return (a.user_nome ?? a.user_email ?? '').localeCompare(
      b.user_nome ?? b.user_email ?? '',
      'pt-BR'
    )
  })

  const sortedUsers = [...allUsers].sort((a, b) => {
    if (userSortBy === 'recent') {
      const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return timeB - timeA
    }
    return (a.nome ?? a.email ?? '').localeCompare(b.nome ?? b.email ?? '', 'pt-BR')
  })

  return (
    <section className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-semibold uppercase tracking-wide text-white sm:text-xl">
          Dashboard
        </h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Dados de todos os usuários inscritos na plataforma e interesses em eventos.
        </p>
      </div>

      {configError && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-200 sm:px-5 sm:py-4">
          <p className="font-semibold">Configuração necessária</p>
          <p className="mt-1 text-sm">{configError}</p>
          <p className="mt-2 text-xs text-amber-300/80">
            Vercel → Project Settings → Environment Variables
          </p>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-[#3b82f6]/20 p-2 sm:p-2.5">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#3b82f6]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-400 truncate">Total de interesses</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalInscricoes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2 sm:p-2.5">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-400 truncate">Usuários únicos</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalUsuariosUnicos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2 sm:p-2.5">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-400 truncate">Eventos com interesses</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {stats.inscricoesPorEvento.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-violet-500/20 p-2 sm:p-2.5">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-400 truncate">Média por evento</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
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

      {/* Todos os usuários inscritos */}
      <div className="rounded-xl border border-white/10 bg-[#1e293b] overflow-hidden">
        <button
          type="button"
          onClick={() => setExpandedUsers(!expandedUsers)}
          className="flex w-full items-center justify-between gap-2 p-4 text-left hover:bg-white/5 transition sm:gap-4 sm:p-5"
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Users className="h-5 w-5 flex-shrink-0 text-slate-400" />
            <h3 className="truncate font-semibold text-white">Todos os usuários inscritos</h3>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300 flex-shrink-0">
              {allUsers.length} usuário(s)
            </span>
          </div>
          {expandedUsers ? (
            <ChevronUp className="h-5 w-5 flex-shrink-0 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />
          )}
        </button>

        {expandedUsers && (
          <div className="border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3 sm:gap-3 sm:px-5">
              <select
                value={userSortBy}
                onChange={(e) => setUserSortBy(e.target.value as 'name' | 'recent')}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] sm:flex-initial"
              >
                <option value="recent">Mais recente primeiro</option>
                <option value="name">Por nome</option>
              </select>
            </div>

            {sortedUsers.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-400 sm:px-5">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <>
                <div className="space-y-4 p-4 md:hidden max-h-[70vh] overflow-y-auto">
                  {sortedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="font-semibold text-white">{u.nome || '—'}</p>
                      {u.email && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {u.email}
                        </p>
                      )}
                      {u.telefone && (
                        <p className="mt-0.5 text-xs text-slate-400">{u.telefone}</p>
                      )}
                      {u.cidade_estado && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {u.cidade_estado}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        {u.posicao_mercado === 'empreendedor' && (u.empresa_projeto || u.segmento_negocio) && (
                          <>Empresa: {u.empresa_projeto || '—'} • Setor: {u.segmento_negocio || '—'} • {u.faixa_faturamento || ''}</>
                        )}
                        {u.posicao_mercado === 'lider' && (u.empresa_atual || u.area_gestao) && (
                          <>{u.cargo_atual || ''} • {u.empresa_atual || '—'} • {u.area_gestao || ''}</>
                        )}
                      </p>
                      {u.o_que_quer_aprender && u.o_que_quer_aprender.length > 0 && (
                        <p className="mt-2 text-xs text-slate-300">
                          <span className="font-medium text-slate-400">Quer aprender:</span>{' '}
                          {u.o_que_quer_aprender.join(', ')}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {u.telefone && (
                          <a
                            href={`https://wa.me/55${u.telefone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-400"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </a>
                        )}
                        {u.instagram && (
                          <a
                            href={`https://instagram.com/${u.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3b82f6]/20 px-3 py-2 text-sm font-medium text-[#3b82f6]"
                          >
                            {u.instagram}
                          </a>
                        )}
                        {u.linkedin && (
                          <a
                            href={u.linkedin.startsWith('http') ? u.linkedin : `https://${u.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a66c2]/20 px-3 py-2 text-sm font-medium text-[#0a66c2]"
                          >
                            LinkedIn
                          </a>
                        )}
                        {!u.telefone && !u.instagram && !u.linkedin && (
                          <span className="text-sm text-slate-500">Sem contato</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto max-h-[480px] overflow-y-auto md:block">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="sticky top-0 bg-[#1e293b] text-left">
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Nome</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Telefone</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Email</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Empresa</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Faturamento</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Setor</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Cidade & Estado</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Quer aprender</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Contato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map((u) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="px-4 py-3 sm:px-5">
                            <p className="font-medium text-white">{u.nome || '—'}</p>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <p className="text-slate-300">{u.telefone || '—'}</p>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <p className="flex items-center gap-1.5 text-slate-300">
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{u.email || '—'}</span>
                            </p>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <p className="text-slate-300 max-w-[140px] truncate" title={u.empresa_projeto || u.empresa_atual || undefined}>
                              {u.empresa_projeto || u.empresa_atual || '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <p className="text-slate-300 text-xs">{u.faixa_faturamento || '—'}</p>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <p className="text-slate-300 text-xs max-w-[100px] truncate" title={u.segmento_negocio || undefined}>
                              {u.segmento_negocio || '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <p className="flex items-center gap-1.5 text-slate-300 text-xs">
                              {u.cidade_estado ? (
                                <>
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  {u.cidade_estado}
                                </>
                              ) : (
                                '—'
                              )}
                            </p>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            {u.o_que_quer_aprender && u.o_que_quer_aprender.length > 0 ? (
                              <p className="text-slate-300 text-xs max-w-[180px] line-clamp-2" title={u.o_que_quer_aprender.join(', ')}>
                                {u.o_que_quer_aprender.join(', ')}
                              </p>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <div className="flex flex-col gap-1">
                              {u.telefone && (
                                <a
                                  href={`https://wa.me/55${u.telefone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  WhatsApp
                                </a>
                              )}
                              {u.instagram && (
                                <a
                                  href={`https://instagram.com/${u.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[#3b82f6] hover:underline"
                                >
                                  {u.instagram}
                                </a>
                              )}
                              {u.linkedin && (
                                <a
                                  href={u.linkedin.startsWith('http') ? u.linkedin : `https://${u.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[#0a66c2] hover:underline"
                                >
                                  LinkedIn
                                </a>
                              )}
                              {!u.telefone && !u.instagram && !u.linkedin && (
                                <span className="text-slate-500">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Inscrições por evento */}
      {stats.inscricoesPorEvento.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1e293b] p-4 sm:p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-300 sm:mb-4 sm:text-sm">
            Interesses por evento
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
          className="flex w-full items-center justify-between gap-2 p-4 text-left hover:bg-white/5 transition sm:gap-4 sm:p-5"
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Filter className="h-5 w-5 flex-shrink-0 text-slate-400" />
            <h3 className="truncate font-semibold text-white">Lista de interesses</h3>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300 flex-shrink-0">
              {registrations.length} registro(s)
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 flex-shrink-0 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />
          )}
        </button>

        {expanded && (
          <div className="border-t border-white/10">
            {/* Filtros e ordenação */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3 sm:gap-3 sm:px-5">
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] sm:flex-initial"
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
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] sm:flex-initial"
              >
                <option value="recent">Mais recente primeiro</option>
                <option value="event">Por evento</option>
                <option value="name">Por nome</option>
              </select>
            </div>

            {sorted.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-400 sm:px-5">
                Nenhum interesse encontrado.
              </div>
            ) : (
              <>
                {/* Layout mobile: cards */}
                <div className="space-y-4 p-4 md:hidden max-h-[70vh] overflow-y-auto">
                  {sorted.map((r) => (
                    <div
                      key={r.id || `${r.event_id}-${r.user_id}`}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="mb-3 text-xs text-slate-500">{formatDate(r.created_at)}</p>
                      <p className="font-semibold text-white">{r.user_nome || '—'}</p>
                      {r.user_email && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {r.user_email}
                        </p>
                      )}
                      {r.user_cidade && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {r.user_cidade}
                        </p>
                      )}
                      <p className="mt-3 font-medium text-white">{r.event_titulo}</p>
                      <p className="text-xs text-slate-400">{formatEventDate(r.event_data_horario)}</p>
                      {r.user_empresa && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-300">
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                          {r.user_empresa}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.user_telefone && (
                          <a
                            href={`https://wa.me/55${r.user_telefone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-400"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </a>
                        )}
                        {r.user_instagram && (
                          <a
                            href={`https://instagram.com/${r.user_instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3b82f6]/20 px-3 py-2 text-sm font-medium text-[#3b82f6]"
                          >
                            {r.user_instagram}
                          </a>
                        )}
                        {!r.user_telefone && !r.user_instagram && (
                          <span className="text-sm text-slate-500">Sem contato</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Layout desktop: tabela */}
                <div className="hidden overflow-x-auto max-h-[480px] overflow-y-auto md:block">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="sticky top-0 bg-[#1e293b] text-left">
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Data</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Participante</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Evento</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Empresa</th>
                        <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">Contato / WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((r) => (
                        <tr
                          key={r.id || `${r.event_id}-${r.user_id}`}
                          className="border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap sm:px-5">
                            {formatDate(r.created_at)}
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <div className="space-y-0.5">
                              <p className="font-medium text-white">{r.user_nome || '—'}</p>
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
                          <td className="px-4 py-3 sm:px-5">
                            <div className="space-y-0.5">
                              <p className="font-medium text-white">{r.event_titulo}</p>
                              <p className="text-xs text-slate-400">{formatEventDate(r.event_data_horario)}</p>
                              <p className="text-xs text-slate-400">{r.event_local}</p>
                              {r.event_capacidade != null && (
                                <p className="text-xs text-slate-500">Capacidade: {r.event_capacidade}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
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
                          <td className="px-4 py-3 sm:px-5">
                            <div className="flex flex-col gap-1">
                              {r.user_telefone && (
                                <a
                                  href={`https://wa.me/55${r.user_telefone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  WhatsApp
                                </a>
                              )}
                              {r.user_instagram && (
                                <a
                                  href={`https://instagram.com/${r.user_instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[#3b82f6] hover:underline"
                                >
                                  {r.user_instagram}
                                </a>
                              )}
                              {!r.user_telefone && !r.user_instagram && (
                                <span className="text-slate-500">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
