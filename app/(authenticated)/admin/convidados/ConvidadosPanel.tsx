'use client'

import { useCallback, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  CheckSquare,
  Square,
  MessageCircle,
  Search,
  Send,
  Users,
  Filter,
  ChevronDown,
  MapPin,
  Building2,
  Loader2,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  DollarSign,
  Undo2,
} from 'lucide-react'
import type { EventRecord, EventInteressado } from '@/lib/queries'
import { normalizePhoneForWhatsApp } from '@/lib/phone'
import { saveGuestSelection, markInvitesSent, markInvitesUnsent } from './actions'
import { useTranslations } from 'next-intl'

const DEFAULT_TEMPLATE = `Olá, {nome}! 🎉

Você demonstrou interesse no evento *{evento}*, e temos uma ótima notícia: você foi selecionado(a) para participar!

📅 *Data:* {data}
📍 *Local:* {local}

Confirme sua presença respondendo esta mensagem. Aguardamos você!`

function formatEventDate(v: string) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildWAText(template: string, user: EventInteressado, event: EventRecord) {
  return template
    .replace(/{nome}/g, user.nome ?? 'amigo(a)')
    .replace(/{evento}/g, event.titulo)
    .replace(/{data}/g, formatEventDate(event.data_horario))
    .replace(/{local}/g, event.local_nome)
}

type Status = 'idle' | 'saving' | 'saved' | 'dispatching'

type Props = {
  events: EventRecord[]
  selectedEventId: string | null
  selectedEvent: EventRecord | null
  interessados: EventInteressado[]
}

export function ConvidadosPanel({ events, selectedEventId, selectedEvent, interessados }: Props) {
  const t = useTranslations('AdminConvidados')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'selecionados' | 'enviados' | 'pendentes'>('all')
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(interessados.filter((i) => i.convidado_selecionado).map((i) => i.userId))
  )
  const [sentIds, setSentIds] = useState<Set<string>>(
    () => new Set(interessados.filter((i) => i.convite_enviado_em).map((i) => i.userId))
  )
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [status, setStatus] = useState<Status>('idle')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [showDispatch, setShowDispatch] = useState(false)
  const [dispatchProgress, setDispatchProgress] = useState(0)
  const dispatchListRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    let list = interessados
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((u) => (u.nome ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q) || (u.telefone ?? '').includes(q))
    if (filterStatus === 'selecionados') list = list.filter((u) => selected.has(u.userId))
    if (filterStatus === 'enviados') list = list.filter((u) => sentIds.has(u.userId))
    if (filterStatus === 'pendentes') list = list.filter((u) => !sentIds.has(u.userId))
    return list
  }, [interessados, search, filterStatus, selected, sentIds])

  const selectedWithPhone = useMemo(
    () => interessados.filter((u) => selected.has(u.userId) && u.telefone),
    [interessados, selected]
  )
  const selectedWithoutPhone = useMemo(
    () => interessados.filter((u) => selected.has(u.userId) && !u.telefone),
    [interessados, selected]
  )

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(filtered.map((u) => u.userId)))
  const deselectAll = () => setSelected((prev) => {
    const next = new Set(prev)
    filtered.forEach((u) => next.delete(u.userId))
    return next
  })

  const handleSave = useCallback(async () => {
    if (!selectedEventId) return
    setStatus('saving')
    const { error } = await saveGuestSelection({ eventId: selectedEventId, selectedUserIds: [...selected] })
    setStatus('idle')
    setSaveMsg(error ? t('saveError', { error }) : t('saved'))
    setTimeout(() => setSaveMsg(null), 3000)
  }, [selectedEventId, selected])

  const handleMarkSent = useCallback(async (userId: string) => {
    if (!selectedEventId) return
    setSentIds((prev) => new Set([...prev, userId]))
    setDispatchProgress((p) => p + 1)
    startTransition(async () => {
      await markInvitesSent({ eventId: selectedEventId, userIds: [userId] })
    })
  }, [selectedEventId])

  const handleMarkUnsent = useCallback(async (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!selectedEventId) return
    setSentIds((prev) => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
    setDispatchProgress((p) => Math.max(0, p - 1))
    startTransition(async () => {
      await markInvitesUnsent({ eventId: selectedEventId, userIds: [userId] })
    })
  }, [selectedEventId])

  const handleEventChange = (id: string) => {
    router.push(`/admin/convidados?evento=${id}`)
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((u) => selected.has(u.userId))

  const stats = {
    total: interessados.length,
    selecionados: selected.size,
    enviados: sentIds.size,
    semTelefone: interessados.filter((u) => !u.telefone).length,
  }

  return (
    <div className="space-y-5">

      {/* Seletor de evento */}
      <div className="rounded-2xl border border-white/10 bg-[#1e293b] p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('eventLabel')}</label>
        <div className="relative">
          <select
            value={selectedEventId ?? ''}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-[#0f172a] py-3 pl-4 pr-10 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.titulo} — {formatEventDate(e.data_horario)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        {selectedEvent && (
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />{formatEventDate(selectedEvent.data_horario)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />{selectedEvent.local_nome}
            </span>
            {selectedEvent.capacidade_maxima && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />{t('slotsLabel', { count: selectedEvent.capacidade_maxima })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t('statInterested'), value: stats.total, color: 'border-[#3b82f6]/20 text-[#3b82f6]', icon: <Users className="h-4 w-4" /> },
          { label: t('statSelected'), value: stats.selecionados, color: 'border-emerald-500/20 text-emerald-400', icon: <CheckSquare className="h-4 w-4" /> },
          { label: t('statSent'), value: stats.enviados, color: 'border-violet-500/20 text-violet-400', icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: t('statNoPhone'), value: stats.semTelefone, color: 'border-amber-500/20 text-amber-400', icon: <MessageCircle className="h-4 w-4" /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`rounded-2xl border bg-[#1e293b] p-4 ${color.split(' ')[0]}`}>
            <div className={`mb-2 inline-flex ${color.split(' ')[1]}`}>{icon}</div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Painel principal */}
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">

        {/* Lista de interessados */}
        <div className="rounded-2xl border border-white/10 bg-[#1e293b] overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-0 sm:max-w-[260px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0f172a] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">{t('filterAll', { count: interessados.length })}</option>
                <option value="selecionados">{t('filterSelected', { count: stats.selecionados })}</option>
                <option value="enviados">{t('filterSent', { count: stats.enviados })}</option>
                <option value="pendentes">{t('filterPending')}</option>
              </select>
              <button
                type="button"
                onClick={allFilteredSelected ? deselectAll : selectAll}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-slate-300 hover:bg-white/5 transition"
              >
                {allFilteredSelected
                  ? <><Square className="h-4 w-4" /> {t('deselectAll')}</>
                  : <><CheckSquare className="h-4 w-4 text-emerald-400" /> {t('selectAll')}</>}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {t('results', { count: filtered.length, selected: selected.size })}
            </p>
          </div>

          {/* Lista */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-slate-600" />
              <p className="text-slate-400">{t('noResults')}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
              {filtered.map((u) => {
                const isSel = selected.has(u.userId)
                const isSent = sentIds.has(u.userId)
                return (
                  <div
                    key={u.userId}
                    onClick={() => toggle(u.userId)}
                    className={`flex cursor-pointer items-start gap-3 p-4 transition hover:bg-white/5 ${isSel ? 'bg-emerald-500/5' : ''}`}
                  >
                    {/* Checkbox */}
                    <div className="mt-0.5 flex-shrink-0">
                      {isSel
                        ? <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500"><Check className="h-3.5 w-3.5 text-white" /></div>
                        : <div className="h-5 w-5 rounded-md border border-white/20 bg-white/5" />}
                    </div>

                    {/* Avatar */}
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isSent ? 'bg-violet-500/20 text-violet-300' : isSel ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-300'
                    }`}>
                      {(u.nome ?? u.email ?? '?')[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-white">{u.nome || '—'}</p>
                        {isSent && (
                            <span className="inline-flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-400">
                              <CheckCircle2 className="h-3 w-3" /> {t('sentBadge')}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleMarkUnsent(u.userId, e)}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-500/50 bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-600/50 hover:text-white transition"
                              title="Marcar como não enviado"
                            >
                              <Undo2 className="h-3 w-3" /> {t('unsentButton')}
                            </button>
                          </span>
                        )}
                        {!isSent && isSel && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                            {t('selectedBadge')}
                          </span>
                        )}
                        {u.posicao_mercado && (
                          <span className={`rounded-full px-2 py-0.5 text-xs ${u.posicao_mercado === 'empreendedor' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'bg-violet-500/10 text-violet-400'}`}>
                            {u.posicao_mercado}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                        {u.email && <span>{u.email}</span>}
                        {u.telefone
                          ? <span className="text-emerald-400">{u.telefone}</span>
                          : <span className="text-amber-400/70">{t('statNoPhone').toLowerCase()}</span>}
                        {u.cidade_estado && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{u.cidade_estado}</span>}
                        {u.empresa && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{u.empresa}</span>}
                        {u.faixa_faturamento && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-emerald-400">
                            <DollarSign className="h-3 w-3" />{u.faixa_faturamento}
                          </span>
                        )}
                      </div>
                      {u.o_que_quer_aprender && u.o_que_quer_aprender.length > 0 && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          Quer aprender: {u.o_que_quer_aprender.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer de ação */}
          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 bg-white/5 px-4 py-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={status === 'saving' || !selectedEventId}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] disabled:opacity-50 disabled:pointer-events-none transition"
            >
              {status === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {status === 'saving' ? t('saving') : t('saveSelection')}
            </button>
            <button
              type="button"
              onClick={() => setShowDispatch(true)}
              disabled={selectedWithPhone.length === 0 || !selectedEventId}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none transition"
            >
              <Send className="h-4 w-4" />
              Disparar convites ({selectedWithPhone.length})
            </button>
            {saveMsg && (
              <span className={`text-sm ${saveMsg.startsWith('Erro') ? 'text-rose-400' : 'text-emerald-400'}`}>
                {saveMsg}
              </span>
            )}
            {selectedWithoutPhone.length > 0 && (
              <span className="text-xs text-amber-400">
                {selectedWithoutPhone.length} sem telefone (não receberão WhatsApp)
              </span>
            )}
          </div>
        </div>

        {/* Painel de template da mensagem */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#1e293b] overflow-hidden">
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Mensagem do convite</h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">Use {'{nome}'}, {'{evento}'}, {'{data}'}, {'{local}'} como variáveis.</p>
            </div>
            <div className="p-4">
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={10}
                className="w-full rounded-xl border border-white/10 bg-[#0f172a] p-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={() => setTemplate(DEFAULT_TEMPLATE)}
                className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition"
              >
                Restaurar padrão
              </button>
            </div>
          </div>

          {/* Preview */}
          {selectedEvent && filtered.find((u) => selected.has(u.userId)) && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
              <div className="border-b border-emerald-500/20 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Preview da mensagem</p>
                <p className="text-xs text-slate-500">
                  Para: {filtered.find((u) => selected.has(u.userId))?.nome ?? '—'}
                </p>
              </div>
              <div className="p-4">
                <pre className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed font-sans">
                  {buildWAText(template, filtered.find((u) => selected.has(u.userId))!, selectedEvent)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de disparo */}
      {showDispatch && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1e293b] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-bold text-white">{t('dispatchPanelTitle')}</h2>
                <p className="text-xs text-slate-400">
                  {t('dispatchProgress', { sent: dispatchProgress, total: selectedWithPhone.length })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowDispatch(false); setDispatchProgress(0) }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Barra de progresso */}
            <div className="px-5 pt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${selectedWithPhone.length > 0 ? (dispatchProgress / selectedWithPhone.length) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-slate-500">
                {selectedWithPhone.length > 0 ? Math.round((dispatchProgress / selectedWithPhone.length) * 100) : 0}%
              </p>
            </div>

            {/* Instruções */}
            <div className="mx-5 mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
              Clique em <strong>Abrir WhatsApp</strong> para cada pessoa. O WhatsApp abrirá com a mensagem pronta — basta enviar e marcar como enviado.
            </div>

            {/* Lista */}
            <div ref={dispatchListRef} className="max-h-[340px] overflow-y-auto divide-y divide-white/5 mt-3">
              {selectedWithPhone.map((u) => {
                const isSent = sentIds.has(u.userId)
                const waText = selectedEvent ? buildWAText(template, u, selectedEvent) : ''
                const waUrl = `https://api.whatsapp.com/send?phone=${normalizePhoneForWhatsApp(u.telefone!)}&text=${encodeURIComponent(waText)}`
                return (
                  <div key={u.userId} className={`flex items-center gap-3 px-5 py-3 ${isSent ? 'opacity-60' : ''}`}>
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isSent ? 'bg-violet-500/20 text-violet-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {(u.nome ?? '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{u.nome || '—'}</p>
                      <div className="flex flex-wrap items-center gap-2 gap-y-0.5">
                        <p className="text-xs text-slate-400">{u.telefone}</p>
                        {u.faixa_faturamento && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-400">
                            <DollarSign className="h-3 w-3" />{u.faixa_faturamento}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSent ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {t('sentBadge')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMarkUnsent(u.userId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-500/50 bg-slate-700/50 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600/50 hover:text-white transition"
                        >
                          <Undo2 className="h-3 w-3" /> {t('unsentButton')}
                        </button>
                      </div>
                    ) : (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleMarkSent(u.userId)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> {t('waButton')}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-5 py-4 flex items-center justify-between gap-3">
              {dispatchProgress === selectedWithPhone.length && selectedWithPhone.length > 0 && (
                <span className="text-sm text-emerald-400 font-medium">
                  ✓ Todos os convites foram disparados!
                </span>
              )}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowDispatch(false); setDispatchProgress(0) }}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
