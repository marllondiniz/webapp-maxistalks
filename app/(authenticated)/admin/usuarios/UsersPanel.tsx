'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Mail,
  MapPin,
  MessageCircle,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { UserWithProfile, EventRegistrationWithDetails } from '@/lib/queries'
import { normalizePhoneForWhatsApp } from '@/lib/phone'

const PAGE_SIZE = 50

type Props = {
  allUsers: UserWithProfile[]
  registrations: EventRegistrationWithDetails[]
}

export function UsersPanel({ allUsers, registrations }: Props) {
  const t = useTranslations('AdminUsers')
  const [userSearch, setUserSearch] = useState('')
  const [userFilterPosicao, setUserFilterPosicao] = useState<string>('all')
  const [userFilterCidade, setUserFilterCidade] = useState<string>('all')
  const [userFilterSegmento, setUserFilterSegmento] = useState<string>('all')
  const [userSortBy, setUserSortBy] = useState<'name' | 'recent'>('recent')
  const [page, setPage] = useState(1)

  const registrationsCountByUser = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of registrations) {
      m.set(r.user_id, (m.get(r.user_id) ?? 0) + 1)
    }
    return m
  }, [registrations])

  const referrerNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const u of allUsers) {
      if (u.nome) m.set(u.id, u.nome)
    }
    return m
  }, [allUsers])

  const filteredUsers = useMemo(() => {
    let list = allUsers
    const q = userSearch.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (u) =>
          (u.nome ?? '').toLowerCase().includes(q) ||
          (u.email ?? '').toLowerCase().includes(q)
      )
    }
    if (userFilterPosicao !== 'all') {
      list = list.filter((u) => (u.posicao_mercado ?? '') === userFilterPosicao)
    }
    if (userFilterCidade !== 'all') {
      list = list.filter((u) => (u.cidade_estado ?? '') === userFilterCidade)
    }
    if (userFilterSegmento !== 'all') {
      list = list.filter((u) => (u.segmento_negocio ?? '') === userFilterSegmento)
    }
    return list
  }, [allUsers, userSearch, userFilterPosicao, userFilterCidade, userFilterSegmento])

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (userSortBy === 'recent') {
        const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return timeB - timeA
      }
      return (a.nome ?? a.email ?? '').localeCompare(b.nome ?? b.email ?? '', 'pt-BR')
    })
  }, [filteredUsers, userSortBy])

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return sortedUsers.slice(start, start + PAGE_SIZE)
  }, [sortedUsers, currentPage])

  const uniqueCidades = useMemo(() => {
    const set = new Set(allUsers.map((u) => u.cidade_estado).filter(Boolean) as string[])
    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [allUsers])
  const uniqueSegmentos = useMemo(() => {
    const set = new Set(allUsers.map((u) => u.segmento_negocio).filter(Boolean) as string[])
    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [allUsers])

  const handleExportUsersCsv = () => {
    const headers = [
      t('csvName'),
      t('csvEmail'),
      t('csvPhone'),
      t('csvCityState'),
      t('csvPosition'),
      t('csvCompanyProject'),
      t('csvCompanyCurrent'),
      t('csvSector'),
      t('csvRevenue'),
      t('csvWantToLearn'),
      t('csvReferredBy'),
      t('csvRegistrations'),
    ]
    const rows = sortedUsers.map((u) => [
      u.nome ?? '',
      u.email ?? '',
      u.telefone ?? '',
      u.cidade_estado ?? '',
      u.posicao_mercado ?? '',
      u.empresa_projeto ?? '',
      u.empresa_atual ?? '',
      u.segmento_negocio ?? '',
      u.faixa_faturamento ?? '',
      (u.o_que_quer_aprender ?? []).join('; '),
      u.invited_by_user_id ? referrerNameById.get(u.invited_by_user_id) ?? '' : '',
      String(registrationsCountByUser.get(u.id) ?? 0),
    ])
    const csv = [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${t('csvFilenamePrefix')}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1e293b] overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3 sm:gap-3 sm:px-5">
        <div className="relative min-w-0 flex-1 sm:max-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={userSearch}
            onChange={(e) => { setUserSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-white/10 bg-[#0f172a] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
          />
        </div>
        <select
          value={userFilterPosicao}
          onChange={(e) => { setUserFilterPosicao(e.target.value); setPage(1) }}
          className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
        >
          <option value="all">{t('positionAll')}</option>
          <option value="empreendedor">{t('positionEmpreendedor')}</option>
          <option value="lider">{t('positionLider')}</option>
        </select>
        <select
          value={userFilterCidade}
          onChange={(e) => { setUserFilterCidade(e.target.value); setPage(1) }}
          className="min-w-0 max-w-[180px] rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
        >
          <option value="all">{t('cityAll')}</option>
          {uniqueCidades.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={userFilterSegmento}
          onChange={(e) => { setUserFilterSegmento(e.target.value); setPage(1) }}
          className="min-w-0 max-w-[160px] rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
        >
          <option value="all">{t('sectorAll')}</option>
          {uniqueSegmentos.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={userSortBy}
          onChange={(e) => setUserSortBy(e.target.value as 'name' | 'recent')}
          className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
        >
          <option value="recent">{t('sortRecent')}</option>
          <option value="name">{t('sortName')}</option>
        </select>
        <button
          type="button"
          onClick={handleExportUsersCsv}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/30"
        >
          <Download className="h-4 w-4" />
          {t('exportCsv')}
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 sm:px-5">
        <span className="text-sm text-slate-400">
          {sortedUsers.length === allUsers.length
            ? t('usersCountOne', { count: String(allUsers.length) })
            : t('usersCountFiltered', { filtered: String(sortedUsers.length), total: String(allUsers.length) })}
          {totalPages > 1 && ` · ${t('pageOf', { current: String(currentPage), total: String(totalPages) })}`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border border-white/10 bg-[#0f172a] p-2 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-white/10 bg-[#0f172a] p-2 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {paginatedUsers.length === 0 ? (
        <div className="px-4 py-12 text-center text-slate-400 sm:px-5">
          {t('noUsersFound')}
        </div>
      ) : (
        <>
          <div className="space-y-4 p-4 md:hidden max-h-[70vh] overflow-y-auto">
            {paginatedUsers.map((u) => (
              <div key={u.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{u.nome || '—'}</p>
                {u.email && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    {u.email}
                  </p>
                )}
                {u.cidade_estado && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {u.cidade_estado}
                  </p>
                )}
                {(u.invited_by_user_id || (registrationsCountByUser.get(u.id) ?? 0) > 0) && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    {u.invited_by_user_id && <span>{t('referredBy')} {referrerNameById.get(u.invited_by_user_id) ?? '—'}</span>}
                    {(registrationsCountByUser.get(u.id) ?? 0) > 0 && (
                      <span className={u.invited_by_user_id ? ' ml-2' : ''}>
                        {t('eventsCount', { count: String(registrationsCountByUser.get(u.id) ?? 0) })}
                      </span>
                    )}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {u.telefone && (
                    <a href={`https://wa.me/${normalizePhoneForWhatsApp(u.telefone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-400">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  )}
                  {u.instagram && (
                    <a href={`https://instagram.com/${u.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#3b82f6]/20 px-3 py-2 text-sm font-medium text-[#3b82f6]">
                      {u.instagram}
                    </a>
                  )}
                  {u.linkedin && (
                    <a href={u.linkedin.startsWith('http') ? u.linkedin : `https://${u.linkedin}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a66c2]/20 px-3 py-2 text-sm font-medium text-[#0a66c2]">
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="sticky top-0 bg-[#1e293b] text-left">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">{t('thName')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">{t('thPhone')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">{t('thEmail')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">{t('thCompany')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">{t('thCity')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">{t('thReferredBy')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">{t('thEvents')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-300 sm:px-5">{t('thContact')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 sm:px-5">
                      <p className="font-medium text-white">{u.nome || '—'}</p>
                    </td>
                    <td className="px-4 py-3 sm:px-5 text-slate-300">{u.telefone || '—'}</td>
                    <td className="px-4 py-3 sm:px-5">
                      <span className="truncate max-w-[180px] block text-slate-300">{u.email || '—'}</span>
                    </td>
                    <td className="px-4 py-3 sm:px-5 text-slate-300 max-w-[140px] truncate" title={u.empresa_projeto || u.empresa_atual || undefined}>
                      {u.empresa_projeto || u.empresa_atual || '—'}
                    </td>
                    <td className="px-4 py-3 sm:px-5 text-slate-300 text-xs">{u.cidade_estado || '—'}</td>
                    <td className="px-4 py-3 sm:px-5 text-slate-300 text-xs max-w-[120px] truncate">
                      {u.invited_by_user_id ? referrerNameById.get(u.invited_by_user_id) ?? '—' : '—'}
                    </td>
                    <td className="px-4 py-3 sm:px-5 text-slate-300 text-xs">{registrationsCountByUser.get(u.id) ?? 0}</td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex flex-col gap-1">
                        {u.telefone && (
                          <a href={`https://wa.me/${normalizePhoneForWhatsApp(u.telefone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline text-xs">
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        )}
                        {u.instagram && (
                          <a href={`https://instagram.com/${u.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:underline text-xs">
                            {u.instagram}
                          </a>
                        )}
                        {u.linkedin && (
                          <a href={u.linkedin.startsWith('http') ? u.linkedin : `https://${u.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#0a66c2] hover:underline text-xs">
                            LinkedIn
                          </a>
                        )}
                        {!u.telefone && !u.instagram && !u.linkedin && <span className="text-slate-500 text-xs">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none"
              >
                {t('prev')}
              </button>
              <span className="text-sm text-slate-400">
                {t('pageOf', { current: String(currentPage), total: String(totalPages) })}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none"
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
