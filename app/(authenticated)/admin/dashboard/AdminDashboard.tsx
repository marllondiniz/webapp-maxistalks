'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  Users,
  Calendar,
  Building2,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  UserPlus,
  FileText,
  CalendarClock,
  Download,
  Search,
  TrendingUp,
  Award,
  BarChart3,
  Layers,
  ArrowUpRight,
  Clock,
  DollarSign,
} from 'lucide-react'
import type {
  EventRegistrationWithDetails,
  DashboardStats,
  UserWithProfile,
  ReferralStats,
  ContentStats,
} from '@/lib/queries'
import type { EventRecord } from '@/lib/queries'
import { normalizePhoneForWhatsApp } from '@/lib/phone'

type Props = {
  registrations: EventRegistrationWithDetails[]
  stats: DashboardStats
  allUsers: UserWithProfile[]
  referralStats: ReferralStats
  contentStats: ContentStats
  events: EventRecord[]
  configError?: string | null
}

function formatDate(v: string) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatEventDate(v: string) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatEventShort(v: string) {
  if (!v) return '—'
  const d = new Date(v)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const UFS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

/** Normaliza "Vila Velha", "Vila Velha ES", "Vila Velha / ES", "Guarapari // ES" para formato único "Cidade / UF" ou "Cidade". */
function normalizeCidadeEstado(value: string | null | undefined): string {
  if (!value) return ''
  const raw = value.trim().replace(/\s*\/+\s*\/+\s*/g, ' / ').replace(/\s+/g, ' ').trim()
  if (!raw) return ''
  const upper = raw.toUpperCase()
  for (const uf of UFS_BR) {
    if (upper.endsWith(' ' + uf) || upper.endsWith('/' + uf) || upper.endsWith(' - ' + uf)) {
      const cidade = raw.slice(0, raw.length - uf.length).replace(/[\s/\-]+$/g, '').trim()
      return cidade ? `${cidade} / ${uf}` : uf
    }
  }
  return raw
}

function ProgressBar({ value, max, color = 'bg-[#3b82f6]' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 flex-shrink-0 text-right text-xs font-semibold text-white">{value}</span>
    </div>
  )
}

function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: 'blue' | 'emerald' | 'amber' | 'cyan' | 'violet'
}) {
  const cfg = {
    blue:    { ring: 'border-[#3b82f6]/20',  bg: 'bg-[#3b82f6]/10',    text: 'text-[#3b82f6]' },
    emerald: { ring: 'border-emerald-500/20', bg: 'bg-emerald-500/10',  text: 'text-emerald-400' },
    amber:   { ring: 'border-amber-500/20',   bg: 'bg-amber-500/10',    text: 'text-amber-400' },
    cyan:    { ring: 'border-cyan-500/20',    bg: 'bg-cyan-500/10',     text: 'text-cyan-400' },
    violet:  { ring: 'border-violet-500/20',  bg: 'bg-violet-500/10',   text: 'text-violet-400' },
  }[color]
  return (
    <div className={`rounded-2xl border ${cfg.ring} bg-[#1e293b] p-4 sm:p-5`}>
      <div className={`mb-3 inline-flex rounded-xl p-2 ${cfg.bg} ${cfg.text}`}>{icon}</div>
      <p className="text-2xl font-bold text-white sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-sm text-slate-400">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function SideWidget({ icon, title, color, children, action }: {
  icon: React.ReactNode
  title: string
  color: string
  children: React.ReactNode
  action?: { label: string; href: string }
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1e293b] overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className={`flex items-center gap-2.5 ${color}`}>
          {icon}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {action && (
          <Link href={action.href} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition">
            {action.label}<ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export function AdminDashboard({
  registrations,
  stats,
  allUsers,
  referralStats,
  contentStats,
  events,
  configError,
}: Props) {
  const t = useTranslations('AdminDashboard')
  const [filterEvent, setFilterEvent] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'event' | 'name'>('recent')
  const [expandedReg, setExpandedReg] = useState(true)
  const [expandedUsers, setExpandedUsers] = useState(true)
  const [userSortBy, setUserSortBy] = useState<'name' | 'recent' | 'faturamento'>('recent')
  const [userSearch, setUserSearch] = useState('')
  const [userFilterPosicao, setUserFilterPosicao] = useState<string>('all')
  const [userFilterCidade, setUserFilterCidade] = useState<string>('all')
  const [userFilterSegmento, setUserFilterSegmento] = useState<string>('all')
  const [userFilterFaturamento, setUserFilterFaturamento] = useState<string>('all')

  /* ── memos ──────────────────────────────────────────── */
  const registrationsCountByUser = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of registrations) m.set(r.user_id, (m.get(r.user_id) ?? 0) + 1)
    return m
  }, [registrations])

  const referrerNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const u of allUsers) if (u.nome) m.set(u.id, u.nome)
    return m
  }, [allUsers])

  const filteredUsers = useMemo(() => {
    let list = allUsers
    const q = userSearch.trim().toLowerCase()
    if (q) list = list.filter((u) => (u.nome ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q))
    if (userFilterPosicao !== 'all') list = list.filter((u) => (u.posicao_mercado ?? '') === userFilterPosicao)
    if (userFilterCidade  !== 'all') list = list.filter((u) => normalizeCidadeEstado(u.cidade_estado) === userFilterCidade)
    if (userFilterSegmento !== 'all') list = list.filter((u) => (u.segmento_negocio ?? '') === userFilterSegmento)
    if (userFilterFaturamento !== 'all') list = list.filter((u) => (u.faixa_faturamento ?? '') === userFilterFaturamento)
    return list
  }, [allUsers, userSearch, userFilterPosicao, userFilterCidade, userFilterSegmento, userFilterFaturamento])

  const FATURAMENTO_ORDER: Record<string, number> = {
    'Prefiro não informar': 0,
    'R$0–20k': 1,
    'R$20k–50k': 2,
    'R$50k–100k': 3,
    'R$100k–300k': 4,
    'R$300k–1M': 5,
    'R$1M+': 6,
  }
  const faturamentoOrder = (faixa: string | null) => (faixa ? (FATURAMENTO_ORDER[faixa] ?? -1) : -1)

  const sortedUsers = useMemo(() => [...filteredUsers].sort((a, b) => {
    if (userSortBy === 'recent') {
      return (b.updated_at ? new Date(b.updated_at).getTime() : 0)
           - (a.updated_at ? new Date(a.updated_at).getTime() : 0)
    }
    if (userSortBy === 'faturamento') {
      const ordA = faturamentoOrder(a.faixa_faturamento)
      const ordB = faturamentoOrder(b.faixa_faturamento)
      if (ordB !== ordA) return ordB - ordA
      return (a.nome ?? a.email ?? '').localeCompare(b.nome ?? b.email ?? '', 'pt-BR')
    }
    return (a.nome ?? a.email ?? '').localeCompare(b.nome ?? b.email ?? '', 'pt-BR')
  }), [filteredUsers, userSortBy])

  const uniqueCidades   = useMemo(() => {
    const normalized = allUsers.map((u) => normalizeCidadeEstado(u.cidade_estado)).filter(Boolean) as string[]
    return [...new Set(normalized)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [allUsers])
  const uniqueSegmentos = useMemo(() => [...new Set(allUsers.map((u) => u.segmento_negocio).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'pt-BR')), [allUsers])
  const uniqueFaturamentos = useMemo(() => {
    const faixas = ['R$0–20k', 'R$20k–50k', 'R$50k–100k', 'R$100k–300k', 'R$300k–1M', 'R$1M+', 'Prefiro não informar']
    const present = new Set(allUsers.map((u) => u.faixa_faturamento).filter(Boolean) as string[])
    return faixas.filter((f) => present.has(f))
  }, [allUsers])

  const topCidades = useMemo(() => {
    const m = new Map<string, number>()
    for (const u of allUsers) { const c = normalizeCidadeEstado(u.cidade_estado); if (c) m.set(c, (m.get(c) ?? 0) + 1) }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [allUsers])

  const topAprender = useMemo(() => {
    const m = new Map<string, number>()
    for (const u of allUsers) for (const item of u.o_que_quer_aprender ?? []) { const k = String(item).trim(); if (k) m.set(k, (m.get(k) ?? 0) + 1) }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [allUsers])

  const faturamentoByFaixa = useMemo(() => {
    const m = new Map<string, number>()
    for (const u of allUsers) {
      const f = u.faixa_faturamento?.trim() || 'Não informado'
      m.set(f, (m.get(f) ?? 0) + 1)
    }
    const order = ['R$1M+', 'R$300k–1M', 'R$100k–300k', 'R$50k–100k', 'R$20k–50k', 'R$0–20k', 'Prefiro não informar', 'Não informado']
    return order.filter((faixa) => m.has(faixa)).map((faixa) => ({ faixa, total: m.get(faixa)! }))
  }, [allUsers])

  const totalEmpreendedores = allUsers.filter((u) => u.posicao_mercado === 'empreendedor').length
  const totalLideres        = allUsers.filter((u) => u.posicao_mercado === 'lider').length
  const mediaEvento         = stats.inscricoesPorEvento.length > 0 ? Math.round(stats.totalInscricoes / stats.inscricoesPorEvento.length) : 0

  const nextEvents = useMemo(() => {
    const now = new Date().toISOString()
    return events.filter((e) => e.data_horario >= now).sort((a, b) => (a.data_horario > b.data_horario ? 1 : -1)).slice(0, 5)
  }, [events])
  const countByEvent = useMemo(() => new Map(stats.inscricoesPorEvento.map((i) => [i.eventoId, i.total])), [stats])

  const filteredReg = filterEvent === 'all' ? registrations : registrations.filter((r) => r.event_id === filterEvent)
  const sortedReg   = [...filteredReg].sort((a, b) => {
    if (sortBy === 'recent') return (b.created_at ? new Date(b.created_at).getTime() : 0) - (a.created_at ? new Date(a.created_at).getTime() : 0)
    if (sortBy === 'event')  return a.event_titulo.localeCompare(b.event_titulo, 'pt-BR')
    return (a.user_nome ?? a.user_email ?? '').localeCompare(b.user_nome ?? b.user_email ?? '', 'pt-BR')
  })

  const handleExportUsersCsv = () => {
    const headers = ['Nome','Email','Telefone','Cidade/Estado','Posição','Empresa/Projeto','Empresa atual','Setor','Faturamento','O que quer aprender','Indicado por','Inscrições em eventos']
    const rows = sortedUsers.map((u) => [
      u.nome ?? '', u.email ?? '', u.telefone ?? '', u.cidade_estado ?? '', u.posicao_mercado ?? '',
      u.empresa_projeto ?? '', u.empresa_atual ?? '', u.segmento_negocio ?? '', u.faixa_faturamento ?? '',
      (u.o_que_quer_aprender ?? []).join('; '),
      u.invited_by_user_id ? referrerNameById.get(u.invited_by_user_id) ?? '' : '',
      String(registrationsCountByUser.get(u.id) ?? 0),
    ])
    const csv = [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `usuarios-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  /* ── render ─────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{t('title')}</h2>
          <p className="mt-0.5 text-sm text-slate-400">{t('subtitle')}</p>
        </div>
        <p className="text-xs text-slate-500 sm:text-right">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {configError && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-amber-200">
          <p className="font-semibold">{t('configTitle')}</p>
          <p className="mt-1 text-sm">{configError}</p>
          <p className="mt-2 text-xs text-amber-300/70">{t('configHint')}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard icon={<TrendingUp className="h-5 w-5" />} color="blue"   label={t('kpiInterests')}  value={stats.totalInscricoes}          sub={t('kpiInterestsSub', { avg: mediaEvento })} />
        <KpiCard icon={<Users      className="h-5 w-5" />} color="emerald" label={t('kpiUsers')}     value={allUsers.length}                 sub={t('kpiUsersSub', { unique: stats.totalUsuariosUnicos })} />
        <KpiCard icon={<Calendar   className="h-5 w-5" />} color="amber"   label={t('kpiEvents')}    value={stats.inscricoesPorEvento.length} sub={t('kpiEventsSub', { total: events.length })} />
        <KpiCard icon={<UserPlus   className="h-5 w-5" />} color="cyan"    label={t('kpiReferred')}  value={referralStats.totalReferred}     sub={referralStats.topReferrers.length > 0 ? t('kpiReferredSub', { count: referralStats.topReferrers.length }) : t('kpiReferredNone')} />
      </div>

      {/* Layout principal: conteúdo largo + sidebar */}
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">

        {/* ── COLUNA PRINCIPAL ── */}
        <div className="min-w-0 space-y-5">

          {/* Tabela de usuários */}
          <div className="rounded-2xl border border-white/10 bg-[#1e293b] overflow-hidden">
            <button type="button" onClick={() => setExpandedUsers(!expandedUsers)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition">
              <div className="rounded-xl bg-[#3b82f6]/10 p-2 text-[#3b82f6]"><Users className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{t('usersTitle')}</p>
                <p className="text-xs text-slate-400">
                  {sortedUsers.length === allUsers.length ? t('usersCount', { count: allUsers.length }) : t('usersCountFiltered', { filtered: sortedUsers.length, total: allUsers.length })}
                </p>
              </div>
              <Link href="/admin/usuarios" onClick={(e) => e.stopPropagation()}
                className="mr-2 hidden items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 sm:flex">
                {t('viewAll')} <ArrowUpRight className="h-3 w-3" />
              </Link>
              {expandedUsers ? <ChevronUp className="h-5 w-5 flex-shrink-0 text-slate-400" /> : <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />}
            </button>

            {expandedUsers && (
              <div className="border-t border-white/10">
                {/* Barra de filtros */}
                <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                  <div className="relative min-w-0 flex-1 sm:max-w-[220px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="search" placeholder={t('searchUserPlaceholder')} value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#0f172a] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]" />
                  </div>
                  <select value={userFilterPosicao} onChange={(e) => setUserFilterPosicao(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:outline-none">
                    <option value="all">{t('filterPositionAll')}</option>
                    <option value="empreendedor">{t('positionEntrepreneur')}</option>
                    <option value="lider">{t('positionLeader')}</option>
                  </select>
                  <select value={userFilterCidade} onChange={(e) => setUserFilterCidade(e.target.value)}
                    className="min-w-0 max-w-[160px] rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:outline-none">
                    <option value="all">{t('filterCityAll')}</option>
                    {uniqueCidades.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={userFilterSegmento} onChange={(e) => setUserFilterSegmento(e.target.value)}
                    className="min-w-0 max-w-[140px] rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:outline-none">
                    <option value="all">{t('filterSectorAll')}</option>
                    {uniqueSegmentos.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={userFilterFaturamento} onChange={(e) => setUserFilterFaturamento(e.target.value)}
                    className="min-w-0 max-w-[160px] rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:outline-none">
                    <option value="all">{t('filterRevenueAll')}</option>
                    {uniqueFaturamentos.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={userSortBy} onChange={(e) => setUserSortBy(e.target.value as 'name' | 'recent' | 'faturamento')}
                    className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:outline-none">
                    <option value="recent">{t('sortRecent')}</option>
                    <option value="name">{t('sortName')}</option>
                    <option value="faturamento">{t('sortRevenue')}</option>
                  </select>
                  <button type="button" onClick={handleExportUsersCsv}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/25 transition">
                    <Download className="h-4 w-4" /> CSV
                  </button>
                </div>

                {sortedUsers.length === 0 ? (
                  <p className="py-10 text-center text-slate-400 text-sm">{t('noUsersFound')}</p>
                ) : (
                  <>
                    {/* Mobile cards */}
                    <div className="space-y-3 p-4 md:hidden max-h-[60vh] overflow-y-auto">
                      {sortedUsers.map((u) => (
                        <div key={u.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-white">{u.nome || '—'}</p>
                            {u.posicao_mercado && (
                              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${u.posicao_mercado === 'empreendedor' ? 'bg-[#3b82f6]/15 text-[#3b82f6]' : 'bg-violet-500/15 text-violet-400'}`}>
                                {u.posicao_mercado}
                              </span>
                            )}
                          </div>
                          {u.email && <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><Mail className="h-3 w-3" />{u.email}</p>}
                          {u.cidade_estado && <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400"><MapPin className="h-3 w-3" />{u.cidade_estado}</p>}
                          {u.faixa_faturamento && (
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-400/90">
                              <DollarSign className="h-3 w-3" />{u.faixa_faturamento}
                            </p>
                          )}
                          {(u.invited_by_user_id || (registrationsCountByUser.get(u.id) ?? 0) > 0) && (
                            <p className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-400">
                              {u.invited_by_user_id && <span>{t('referredBy')} <strong className="text-slate-200">{referrerNameById.get(u.invited_by_user_id) ?? '—'}</strong></span>}
                              {(registrationsCountByUser.get(u.id) ?? 0) > 0 && <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-amber-300">{t('eventCount', { count: registrationsCountByUser.get(u.id) ?? 0 })}</span>}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {u.telefone && <a href={`https://wa.me/${normalizePhoneForWhatsApp(u.telefone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-400"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>}
                            {u.instagram && <a href={`https://instagram.com/${u.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#3b82f6]/15 px-3 py-1.5 text-sm font-medium text-[#3b82f6]">{u.instagram}</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop tabela */}
                    <div className="hidden overflow-x-auto max-h-[420px] overflow-y-auto md:block">
                      <table className="w-full min-w-[960px] text-sm">
                        <thead className="sticky top-0 bg-[#1e293b]">
                          <tr className="border-b border-white/10 text-left">
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colName')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colContact')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colCompany')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colRevenue')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colCity')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colReferredBy')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400 text-center">{t('colEvents')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colLinks')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedUsers.map((u) => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                              <td className="px-5 py-3">
                                <p className="font-medium text-white">{u.nome || '—'}</p>
                                {u.posicao_mercado && (
                                  <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-xs ${u.posicao_mercado === 'empreendedor' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'bg-violet-500/10 text-violet-400'}`}>
                                    {u.posicao_mercado}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3">
                                {u.email && <p className="flex items-center gap-1 text-xs text-slate-300"><Mail className="h-3 w-3" /><span className="max-w-[150px] truncate">{u.email}</span></p>}
                                {u.telefone && <p className="text-xs text-slate-400">{u.telefone}</p>}
                              </td>
                              <td className="px-5 py-3">
                                <p className="max-w-[120px] truncate text-slate-300 text-sm" title={u.empresa_projeto || u.empresa_atual || undefined}>{u.empresa_projeto || u.empresa_atual || '—'}</p>
                                <p className="text-xs text-slate-500">{u.segmento_negocio || ''}</p>
                              </td>
                              <td className="px-5 py-3">
                                {u.faixa_faturamento ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400" title="Faixa de faturamento">
                                    <DollarSign className="h-3 w-3" />{u.faixa_faturamento}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs text-slate-300">{u.cidade_estado || '—'}</td>
                              <td className="px-5 py-3 text-xs text-slate-400 max-w-[100px] truncate">{u.invited_by_user_id ? referrerNameById.get(u.invited_by_user_id) ?? '—' : '—'}</td>
                              <td className="px-5 py-3 text-center">
                                {(registrationsCountByUser.get(u.id) ?? 0) > 0
                                  ? <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-300">{registrationsCountByUser.get(u.id)}</span>
                                  : <span className="text-slate-600">—</span>}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex flex-col gap-1">
                                  {u.telefone && <a href={`https://wa.me/${normalizePhoneForWhatsApp(u.telefone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"><MessageCircle className="h-3 w-3" /> WA</a>}
                                  {u.instagram && <a href={`https://instagram.com/${u.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3b82f6] hover:underline truncate max-w-[80px]">{u.instagram}</a>}
                                  {u.linkedin && <a href={u.linkedin.startsWith('http') ? u.linkedin : `https://${u.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0a66c2] hover:underline">LinkedIn</a>}
                                  {!u.telefone && !u.instagram && !u.linkedin && <span className="text-slate-600">—</span>}
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

          {/* Lista de interesses */}
          <div className="rounded-2xl border border-white/10 bg-[#1e293b] overflow-hidden">
            <button type="button" onClick={() => setExpandedReg(!expandedReg)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition">
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400"><Layers className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{t('interestsTitle')}</p>
                <p className="text-xs text-slate-400">{t('interestsCount', { count: registrations.length })}</p>
              </div>
              {expandedReg ? <ChevronUp className="h-5 w-5 flex-shrink-0 text-slate-400" /> : <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />}
            </button>

            {expandedReg && (
              <div className="border-t border-white/10">
                <div className="flex flex-wrap gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                  <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}
                    className="flex-1 rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:outline-none sm:flex-initial">
                    <option value="all">{t('allEvents')}</option>
                    {stats.inscricoesPorEvento.map(({ eventoId, titulo }) => <option key={eventoId} value={eventoId}>{titulo}</option>)}
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'recent' | 'event' | 'name')}
                    className="flex-1 rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:outline-none sm:flex-initial">
                    <option value="recent">{t('sortRecent')}</option>
                    <option value="event">{t('sortByEvent')}</option>
                    <option value="name">{t('sortName')}</option>
                  </select>
                </div>
                {sortedReg.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-400">{t('noInterestsFound')}</p>
                ) : (
                  <>
                    {/* Mobile */}
                    <div className="space-y-3 p-4 md:hidden max-h-[60vh] overflow-y-auto">
                      {sortedReg.map((r) => (
                        <div key={r.id || `${r.event_id}-${r.user_id}`} className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="mb-1 text-xs text-slate-500">{formatDate(r.created_at)}</p>
                          <p className="font-semibold text-white">{r.user_nome || '—'}</p>
                          {r.user_email && <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400"><Mail className="h-3 w-3" />{r.user_email}</p>}
                          <div className="mt-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                            <p className="font-medium text-white text-sm">{r.event_titulo}</p>
                            <p className="text-xs text-slate-400">{formatEventDate(r.event_data_horario)}</p>
                          </div>
                          {r.user_telefone && (
                            <a href={`https://wa.me/${normalizePhoneForWhatsApp(r.user_telefone)}`} target="_blank" rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-400">
                              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Desktop */}
                    <div className="hidden overflow-x-auto max-h-[420px] overflow-y-auto md:block">
                      <table className="w-full min-w-[640px] text-sm">
                        <thead className="sticky top-0 bg-[#1e293b]">
                          <tr className="border-b border-white/10 text-left">
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colDate')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colParticipant')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colEvent')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colCompany')}</th>
                            <th className="px-5 py-3 font-semibold text-slate-400">{t('colContact')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedReg.map((r) => (
                            <tr key={r.id || `${r.event_id}-${r.user_id}`} className="border-b border-white/5 hover:bg-white/5 transition">
                              <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(r.created_at)}</td>
                              <td className="px-5 py-3">
                                <p className="font-medium text-white">{r.user_nome || '—'}</p>
                                {r.user_email && <p className="flex items-center gap-1 text-xs text-slate-400"><Mail className="h-3 w-3" />{r.user_email}</p>}
                                {r.user_cidade && <p className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3" />{r.user_cidade}</p>}
                              </td>
                              <td className="px-5 py-3">
                                <p className="font-medium text-white">{r.event_titulo}</p>
                                <p className="text-xs text-slate-400">{formatEventDate(r.event_data_horario)}</p>
                              </td>
                              <td className="px-5 py-3">
                                {r.user_empresa && <p className="flex items-center gap-1 text-slate-300 text-sm"><Building2 className="h-3 w-3 flex-shrink-0" />{r.user_empresa}</p>}
                                {r.user_area && <p className="text-xs text-slate-400">{r.user_area}</p>}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex flex-col gap-1">
                                  {r.user_telefone && <a href={`https://wa.me/${normalizePhoneForWhatsApp(r.user_telefone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"><MessageCircle className="h-3 w-3" /> WhatsApp</a>}
                                  {r.user_instagram && <a href={`https://instagram.com/${r.user_instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3b82f6] hover:underline">{r.user_instagram}</a>}
                                  {!r.user_telefone && !r.user_instagram && <span className="text-slate-600">—</span>}
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
        </div>

        {/* ── SIDEBAR DIREITA ── */}
        <div className="space-y-4 xl:max-h-[calc(100vh-180px)] xl:overflow-y-auto xl:pr-1">

          {/* Próximos eventos */}
          <SideWidget icon={<CalendarClock className="h-4 w-4" />} title={t('sideNextEvents')} color="text-emerald-400"
            action={{ label: t('sideGuests'), href: '/admin/convidados' }}>
            {nextEvents.length === 0 ? (
              <p className="text-xs text-slate-400">{t('noFutureEvents')}</p>
            ) : (
              <ul className="space-y-2.5">
                {nextEvents.map((e) => (
                  <li key={e.id} className="group rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white leading-snug">{e.titulo}</p>
                      <span className="flex-shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-300">
                        {countByEvent.get(e.id) ?? 0}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />{formatEventShort(e.data_horario)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SideWidget>

          {/* Interesses por evento */}
          {stats.inscricoesPorEvento.length > 0 && (
            <SideWidget icon={<BarChart3 className="h-4 w-4" />} title={t('sideInterestsByEvent')} color="text-violet-400">
              <div className="space-y-2.5">
                {stats.inscricoesPorEvento.sort((a, b) => b.total - a.total).map(({ eventoId, titulo, total }) => (
                  <div key={eventoId}>
                    <div className="mb-0.5 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate text-slate-300">{titulo}</span>
                    </div>
                    <ProgressBar value={total} max={Math.max(...stats.inscricoesPorEvento.map((i) => i.total))} color="bg-violet-500" />
                  </div>
                ))}
              </div>
            </SideWidget>
          )}

          {/* Por faixa de faturamento */}
          {faturamentoByFaixa.length > 0 && (
            <SideWidget icon={<DollarSign className="h-4 w-4" />} title={t('sideRevenue')} color="text-emerald-400">
              <p className="mb-2 text-xs text-slate-500">
                {t('sideRevenueDesc')}
              </p>
              <div className="space-y-2">
                {faturamentoByFaixa.map(({ faixa, total }) => (
                  <div key={faixa}>
                    <div className="mb-0.5 flex justify-between text-xs">
                      <span className="truncate text-slate-300">{faixa}</span>
                      <span className="font-semibold text-emerald-400">{total}</span>
                    </div>
                    <ProgressBar value={total} max={Math.max(...faturamentoByFaixa.map((i) => i.total))} color="bg-emerald-500" />
                  </div>
                ))}
              </div>
            </SideWidget>
          )}

          {/* Indicações */}
          <SideWidget icon={<UserPlus className="h-4 w-4" />} title={t('sideReferrals')} color="text-cyan-400">
            <p className="mb-3 text-xs text-slate-500">
              {t('sideTotalReferred')} <strong className="text-white">{referralStats.totalReferred}</strong>
            </p>
            {referralStats.topReferrers.length > 0 ? (
              <ul className="space-y-2">
                {referralStats.topReferrers.slice(0, 5).map((r, i) => (
                  <li key={r.referrerId} className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-400/20 text-amber-400' : 'bg-white/10 text-slate-500'}`}>{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{r.referrerName}</span>
                    <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs font-semibold text-cyan-400">{r.count}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-slate-500">{t('noReferrals')}</p>}
          </SideWidget>

          {/* Conteúdo */}
          <SideWidget icon={<FileText className="h-4 w-4" />} title={t('sideContent')} color="text-amber-400"
            action={{ label: t('sideManage'), href: '/admin/conteudo' }}>
            <p className="mb-2 text-xs text-slate-500">
              <strong className="text-white">{contentStats.totalArticles}</strong> {t('articleLabel')}
            </p>
            {Object.keys(contentStats.byTipo).length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {Object.entries(contentStats.byTipo).map(([tipo, n]) => (
                  <span key={tipo} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">{tipo} <strong className="text-white">{n}</strong></span>
                ))}
              </div>
            )}
            {contentStats.lastArticles.length > 0 && (
              <ul className="space-y-1.5 text-xs text-slate-400">
                {contentStats.lastArticles.map((a) => (
                  <li key={a.id} className="flex items-start gap-1.5">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    <span className="line-clamp-1 flex-1">{a.titulo}</span>
                    {a.publicado_em && <span className="flex-shrink-0 text-slate-600">{formatDate(a.publicado_em)}</span>}
                  </li>
                ))}
              </ul>
            )}
          </SideWidget>

          {/* Perfil da comunidade */}
          {allUsers.length > 0 && (
            <SideWidget icon={<Award className="h-4 w-4" />} title={t('sideCommunity')} color="text-violet-400"
              action={{ label: t('sideViewUsers'), href: '/admin/usuarios' }}>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('sectionPosition')}</p>
                  <div className="space-y-2">
                    {totalEmpreendedores > 0 && (
                      <div>
                        <div className="mb-0.5 flex justify-between text-xs"><span className="text-slate-400">{t('labelEntrepreneurs')}</span></div>
                        <ProgressBar value={totalEmpreendedores} max={allUsers.length} color="bg-[#3b82f6]" />
                      </div>
                    )}
                    {totalLideres > 0 && (
                      <div>
                        <div className="mb-0.5 flex justify-between text-xs"><span className="text-slate-400">{t('labelLeaders')}</span></div>
                        <ProgressBar value={totalLideres} max={allUsers.length} color="bg-violet-500" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('sectionTopCities')}</p>
                  <div className="space-y-1.5">
                    {topCidades.slice(0, 5).map(([cidade, n]) => (
                      <div key={cidade}>
                        <div className="mb-0.5 flex justify-between text-xs text-slate-400"><span className="truncate">{cidade}</span></div>
                        <ProgressBar value={n} max={topCidades[0]?.[1] ?? 1} color="bg-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('sectionWantToLearn')}</p>
                  <div className="space-y-1.5">
                    {topAprender.slice(0, 5).map(([item, n]) => (
                      <div key={item}>
                        <div className="mb-0.5 text-xs text-slate-400 truncate" title={item}>{item}</div>
                        <ProgressBar value={n} max={topAprender[0]?.[1] ?? 1} color="bg-amber-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SideWidget>
          )}

        </div>
      </div>
    </div>
  )
}
