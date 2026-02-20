'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  Plus, Pencil, Trash2, Save, X, Wrench,
  Youtube, FileDown, Radio, AlertCircle,
  ChevronUp, ChevronDown, Check,
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import type { ToolRecord, UserPainRecord, LiveSessionRecord } from '@/lib/queries'
import type { PainWithUser } from '@/app/api/admin/ferramentas/pains/route'

const inputClass =
  'w-full rounded-xl border border-slate-600/40 bg-slate-900 px-4 py-3 text-sm text-[#f5f5f5] placeholder:text-[#54545b] focus:border-slate-500/60 focus:outline-none'

type Tab = 'ferramentas' | 'aovivo' | 'dores'

const emptyTool = {
  titulo: '',
  descricao: '',
  youtube_url: '',
  pdf_url: '',
  pdf_nome: '',
  ordem: 0,
  ativo: true,
}

export function FerramentasAdminPanel({ tenantId }: { tenantId: string | null }) {
  const supabase = getSupabaseClient()
  const [tab, setTab] = useState<Tab>('ferramentas')
  const [isPending, startTransition] = useTransition()

  // --- Ferramentas ---
  const [tools, setTools] = useState<ToolRecord[]>([])
  const [loadingTools, setLoadingTools] = useState(true)
  const [formTool, setFormTool] = useState<typeof emptyTool>(emptyTool)
  const [editingToolId, setEditingToolId] = useState<string | null>(null)
  const [showToolForm, setShowToolForm] = useState(false)
  const [toolFeedback, setToolFeedback] = useState<string | null>(null)

  // --- Ao vivo ---
  const [liveSessions, setLiveSessions] = useState<LiveSessionRecord[]>([])
  const [loadingLive, setLoadingLive] = useState(true)
  const [liveForm, setLiveForm] = useState({ titulo: '', youtube_url: '', ativo: true })
  const [editingLiveId, setEditingLiveId] = useState<string | null>(null)
  const [showLiveForm, setShowLiveForm] = useState(false)
  const [liveFeedback, setLiveFeedback] = useState<string | null>(null)

  // --- Dores ---
  const [pains, setPains] = useState<PainWithUser[]>([])
  const [loadingPains, setLoadingPains] = useState(true)

  // ---------- Loaders ----------
  const loadTools = async () => {
    setLoadingTools(true)
    const { data } = await supabase
      .from('tools')
      .select('*')
      .order('ordem', { ascending: true })
    setTools(data ?? [])
    setLoadingTools(false)
  }

  const loadLive = async () => {
    setLoadingLive(true)
    const { data } = await supabase
      .from('live_sessions')
      .select('*')
      .order('created_at', { ascending: false })
    setLiveSessions(data ?? [])
    setLoadingLive(false)
  }

  const loadPains = async () => {
    setLoadingPains(true)
    try {
      const res = await fetch('/api/admin/ferramentas/pains')
      const json = await res.json()
      if (!res.ok) {
        console.error('Erro ao carregar dores:', json.error)
        setPains([])
      } else {
        setPains(json.pains ?? [])
      }
    } catch (e) {
      console.error('Erro ao carregar dores:', e)
      setPains([])
    }
    setLoadingPains(false)
  }

  useEffect(() => {
    if (tab === 'ferramentas') loadTools()
    if (tab === 'aovivo') loadLive()
    if (tab === 'dores') loadPains()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // ---------- CRUD Ferramentas ----------
  const handleSaveTool = () => {
    if (!formTool.titulo.trim()) {
      setToolFeedback('O título é obrigatório.')
      return
    }
    startTransition(async () => {
      setToolFeedback(null)
      const payload = {
        titulo: formTool.titulo.trim(),
        descricao: formTool.descricao.trim() || null,
        youtube_url: formTool.youtube_url.trim() || null,
        pdf_url: formTool.pdf_url.trim() || null,
        pdf_nome: formTool.pdf_nome.trim() || null,
        ordem: Number(formTool.ordem) || 0,
        ativo: formTool.ativo,
        tenant_id: tenantId,
      }

      if (editingToolId) {
        const { error } = await supabase.from('tools').update(payload).eq('id', editingToolId)
        if (error) { setToolFeedback('Erro ao atualizar.'); return }
      } else {
        const { error } = await supabase.from('tools').insert(payload)
        if (error) { setToolFeedback('Erro ao criar.'); return }
      }

      setShowToolForm(false)
      setEditingToolId(null)
      setFormTool(emptyTool)
      await loadTools()
      setToolFeedback(editingToolId ? 'Ferramenta atualizada!' : 'Ferramenta criada!')
      setTimeout(() => setToolFeedback(null), 3000)
    })
  }

  const handleDeleteTool = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ferramenta?')) return
    startTransition(async () => {
      await supabase.from('tools').delete().eq('id', id)
      await loadTools()
    })
  }

  const handleEditTool = (tool: ToolRecord) => {
    setEditingToolId(tool.id)
    setFormTool({
      titulo: tool.titulo,
      descricao: tool.descricao ?? '',
      youtube_url: tool.youtube_url ?? '',
      pdf_url: tool.pdf_url ?? '',
      pdf_nome: tool.pdf_nome ?? '',
      ordem: tool.ordem ?? 0,
      ativo: tool.ativo ?? true,
    })
    setShowToolForm(true)
    setToolFeedback(null)
  }

  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const idx = tools.findIndex((t) => t.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === tools.length - 1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const newOrder = [...tools]
    const temp = newOrder[idx].ordem
    newOrder[idx] = { ...newOrder[idx], ordem: newOrder[swapIdx].ordem ?? swapIdx }
    newOrder[swapIdx] = { ...newOrder[swapIdx], ordem: temp ?? idx }
    await supabase.from('tools').update({ ordem: newOrder[idx].ordem }).eq('id', newOrder[idx].id)
    await supabase.from('tools').update({ ordem: newOrder[swapIdx].ordem }).eq('id', newOrder[swapIdx].id)
    await loadTools()
  }

  // ---------- CRUD Ao Vivo ----------
  const handleSaveLive = () => {
    if (!liveForm.youtube_url.trim()) {
      setLiveFeedback('A URL do YouTube é obrigatória.')
      return
    }
    startTransition(async () => {
      setLiveFeedback(null)
      const payload = {
        titulo: liveForm.titulo.trim() || null,
        youtube_url: liveForm.youtube_url.trim(),
        ativo: liveForm.ativo,
        tenant_id: tenantId,
      }

      if (editingLiveId) {
        await supabase.from('live_sessions').update(payload).eq('id', editingLiveId)
      } else {
        await supabase.from('live_sessions').insert(payload)
      }

      setShowLiveForm(false)
      setEditingLiveId(null)
      setLiveForm({ titulo: '', youtube_url: '', ativo: true })
      await loadLive()
      setLiveFeedback('Salvo com sucesso!')
      setTimeout(() => setLiveFeedback(null), 3000)
    })
  }

  const handleToggleLive = async (id: string, current: boolean) => {
    await supabase.from('live_sessions').update({ ativo: !current }).eq('id', id)
    await loadLive()
  }

  const handleDeleteLive = (id: string) => {
    if (!confirm('Remover esta sessão ao vivo?')) return
    startTransition(async () => {
      await supabase.from('live_sessions').delete().eq('id', id)
      await loadLive()
    })
  }

  // ---------- UI ----------
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'ferramentas', label: 'Ferramentas', icon: <Wrench className="h-4 w-4" /> },
    { key: 'aovivo', label: 'Ao Vivo', icon: <Radio className="h-4 w-4" /> },
    { key: 'dores', label: 'Dores Cadastradas', icon: <AlertCircle className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Ferramentas</h1>
        <p className="mt-1 text-sm text-slate-400">Gerencie ferramentas, ao vivo e veja os desafios dos usuários.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-700/50 bg-slate-800/50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? 'bg-[#3b82f6] text-white shadow'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ====== TAB: FERRAMENTAS ====== */}
      {tab === 'ferramentas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{tools.length} ferramenta(s) cadastrada(s)</p>
            <button
              type="button"
              onClick={() => { setShowToolForm(true); setEditingToolId(null); setFormTool(emptyTool) }}
              className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
            >
              <Plus className="h-4 w-4" /> Nova ferramenta
            </button>
          </div>

          {toolFeedback && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
              {toolFeedback}
            </div>
          )}

          {/* Formulário */}
          {showToolForm && (
            <div className="rounded-2xl border border-slate-600/40 bg-slate-800/80 p-5 space-y-4">
              <h3 className="font-bold text-white">{editingToolId ? 'Editar ferramenta' : 'Nova ferramenta'}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Título *</span>
                  <input
                    type="text"
                    value={formTool.titulo}
                    onChange={(e) => setFormTool((p) => ({ ...p, titulo: e.target.value }))}
                    placeholder="Ex: Planilha de prospecção"
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ordem</span>
                  <input
                    type="number"
                    value={formTool.ordem}
                    onChange={(e) => setFormTool((p) => ({ ...p, ordem: Number(e.target.value) }))}
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Descrição</span>
                <textarea
                  rows={2}
                  value={formTool.descricao}
                  onChange={(e) => setFormTool((p) => ({ ...p, descricao: e.target.value }))}
                  placeholder="Breve descrição da ferramenta..."
                  className={`${inputClass} resize-none`}
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Youtube className="h-3.5 w-3.5 text-red-400" /> URL do YouTube (aula)
                  </span>
                  <input
                    type="url"
                    value={formTool.youtube_url}
                    onChange={(e) => setFormTool((p) => ({ ...p, youtube_url: e.target.value }))}
                    placeholder="https://youtu.be/..."
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileDown className="h-3.5 w-3.5 text-blue-400" /> URL do PDF
                  </span>
                  <input
                    type="url"
                    value={formTool.pdf_url}
                    onChange={(e) => setFormTool((p) => ({ ...p, pdf_url: e.target.value }))}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nome do arquivo PDF</span>
                <input
                  type="text"
                  value={formTool.pdf_nome}
                  onChange={(e) => setFormTool((p) => ({ ...p, pdf_nome: e.target.value }))}
                  placeholder="Ex: Planilha-prospeccao.pdf"
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setFormTool((p) => ({ ...p, ativo: !p.ativo }))}
                    className={`flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${formTool.ativo ? 'bg-[#3b82f6]' : 'bg-slate-600'}`}
                  >
                    <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${formTool.ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">
                    {formTool.ativo ? 'Visível para usuários' : 'Oculta para usuários'}
                  </span>
                </div>
                {!formTool.ativo && (
                  <p className="text-xs text-amber-400/90 pl-14">
                    Ative o toggle e salve para a ferramenta aparecer na página Ferramentas do usuário.
                  </p>
                )}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveTool}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isPending ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowToolForm(false); setEditingToolId(null); setFormTool(emptyTool) }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de ferramentas */}
          {loadingTools ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
              Carregando...
            </div>
          ) : tools.length === 0 ? (
            <div className="rounded-2xl border border-slate-600/30 bg-slate-800/50 py-12 text-center">
              <Wrench className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">Nenhuma ferramenta cadastrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tools.map((tool, idx) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-600/30 bg-slate-800/80 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => handleMoveOrder(tool.id, 'up')} disabled={idx === 0} className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20">
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleMoveOrder(tool.id, 'down')} disabled={idx === tools.length - 1} className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{tool.titulo}</span>
                      {!tool.ativo && (
                        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-400">oculto</span>
                      )}
                      {tool.youtube_url && <Youtube className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                      {tool.pdf_url && <FileDown className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                    </div>
                    {tool.descricao && (
                      <p className="mt-0.5 text-xs text-slate-400 truncate">{tool.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => handleEditTool(tool)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDeleteTool(tool.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== TAB: AO VIVO ====== */}
      {tab === 'aovivo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Gerencie a URL do evento ao vivo.</p>
            <button
              type="button"
              onClick={() => { setShowLiveForm(true); setEditingLiveId(null); setLiveForm({ titulo: '', youtube_url: '', ativo: true }) }}
              className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
            >
              <Plus className="h-4 w-4" /> Nova sessão ao vivo
            </button>
          </div>

          {liveFeedback && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 flex items-center gap-2">
              <Check className="h-4 w-4" /> {liveFeedback}
            </div>
          )}

          {showLiveForm && (
            <div className="rounded-2xl border border-slate-600/40 bg-slate-800/80 p-5 space-y-4">
              <h3 className="font-bold text-white">{editingLiveId ? 'Editar sessão' : 'Nova sessão ao vivo'}</h3>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Título do evento</span>
                <input
                  type="text"
                  value={liveForm.titulo}
                  onChange={(e) => setLiveForm((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: MaxisTalks #7 — Ao vivo"
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Youtube className="h-3.5 w-3.5 text-red-400" /> URL do YouTube (live) *
                </span>
                <input
                  type="url"
                  value={liveForm.youtube_url}
                  onChange={(e) => setLiveForm((p) => ({ ...p, youtube_url: e.target.value }))}
                  placeholder="https://youtube.com/live/..."
                  className={inputClass}
                />
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setLiveForm((p) => ({ ...p, ativo: !p.ativo }))}
                  className={`flex h-6 w-11 items-center rounded-full transition-colors ${liveForm.ativo ? 'bg-red-500' : 'bg-slate-600'}`}
                >
                  <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${liveForm.ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-slate-300">
                  {liveForm.ativo ? 'Ao vivo ativado (visível para usuários)' : 'Desativado'}
                </span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveLive}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isPending ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLiveForm(false); setEditingLiveId(null) }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              </div>
            </div>
          )}

          {loadingLive ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
              Carregando...
            </div>
          ) : liveSessions.length === 0 ? (
            <div className="rounded-2xl border border-slate-600/30 bg-slate-800/50 py-12 text-center">
              <Radio className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">Nenhuma sessão cadastrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveSessions.map((ls) => (
                <div key={ls.id} className="flex items-center gap-3 rounded-xl border border-slate-600/30 bg-slate-800/80 px-4 py-3">
                  <div className={`flex h-3 w-3 shrink-0 rounded-full ${ls.ativo ? 'bg-red-500' : 'bg-slate-600'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{ls.titulo ?? 'Sessão ao vivo'}</p>
                    <p className="mt-0.5 text-xs text-slate-400 truncate">{ls.youtube_url}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleLive(ls.id, ls.ativo ?? false)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${ls.ativo ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                    >
                      {ls.ativo ? 'Ao vivo' : 'Ativar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingLiveId(ls.id); setLiveForm({ titulo: ls.titulo ?? '', youtube_url: ls.youtube_url, ativo: ls.ativo ?? false }); setShowLiveForm(true) }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLive(ls.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== TAB: DORES ====== */}
      {tab === 'dores' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{pains.length} registro(s) de desafios/dores dos usuários.</p>
          {loadingPains ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
              Carregando...
            </div>
          ) : pains.length === 0 ? (
            <div className="rounded-2xl border border-slate-600/30 bg-slate-800/50 py-12 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">Nenhum desafio registrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pains.map((pain) => (
                <div key={pain.id} className="rounded-xl border border-slate-600/30 bg-slate-800/80 px-4 py-3 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-white">
                        {pain.user_nome ?? 'Usuário'}
                      </span>
                      {pain.user_email && (
                        <span className="text-xs text-slate-400">{pain.user_email}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {new Date(pain.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[#f5f5f5] leading-relaxed pt-1">{pain.dor}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
