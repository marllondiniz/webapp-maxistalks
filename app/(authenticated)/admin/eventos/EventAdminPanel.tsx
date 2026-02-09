'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Pencil, Plus, Upload, Image as ImageIcon, Check, Trash2, Info, Lightbulb, Loader2, Save, Calendar } from 'lucide-react'
import type { EventBannerRecord, EventRecord } from '@/lib/queries'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { RichTextEditor } from '@/components/RichTextEditor'

type Props = {
  initialEvents: EventRecord[]
}

type DescriptionSection = {
  id: string
  titulo: string
  conteudo: string
}

type FormState = {
  titulo: string
  descricaoSections: DescriptionSection[]
  data_horario: string
  local_nome: string
  local_detalhe: string
  preco: string
  capacidade_maxima: string
  destaque: boolean
  bannerFile: File | null
  bannerPreview: string | null
  bannerTitulo: string
  bannerSubtitulo: string
  bannerPalestranteInstagram: string
  bannerPalestranteDescricao: string
}

const generateId = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)

const createEmptySection = (initialContent = ''): DescriptionSection => ({
  id: generateId(),
  titulo: '',
  conteudo: initialContent,
})

const createDefaultForm = (): FormState => ({
  titulo: '',
  descricaoSections: [createEmptySection()],
  data_horario: '',
  local_nome: '',
  local_detalhe: '',
  preco: '',
  capacidade_maxima: '',
  destaque: false,
  bannerFile: null,
  bannerPreview: null,
  bannerTitulo: '',
  bannerSubtitulo: '',
  bannerPalestranteInstagram: '',
  bannerPalestranteDescricao: '',
})

const BANNER_BUCKET = 'event-banners'

const formatDateForInput = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

const parseDateTime = (value: string): Date | null => {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  // Valor padrão retornado pelo input datetime-local (YYYY-MM-DDTHH:mm)
  if (trimmed.includes('T')) {
    const date = new Date(trimmed)
    return Number.isNaN(date.getTime()) ? null : date
  }

  // Tentativa de parse para entradas manuais no formato brasileiro
  const match = trimmed.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:,|\s)(\d{1,2}):(\d{2})$/
  )

  if (match) {
    const [, dia, mes, ano, hora, minuto] = match
    const parsedYear = ano.length === 2 ? Number(`20${ano}`) : Number(ano)
    const date = new Date(
      parsedYear,
      Number(mes) - 1,
      Number(dia),
      Number(hora),
      Number(minuto)
    )
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

const parseDescriptionSections = (raw: string | null): DescriptionSection[] => {
  if (!raw) {
    return [createEmptySection()]
  }

  try {
    const parsed = JSON.parse(raw) as { sections?: Array<{ titulo?: string | null; conteudo?: string | null }> }
    if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
      const mapped = parsed.sections
        .map((section, index) => ({
          id: generateId(),
          titulo: section.titulo ?? '',
          conteudo: section.conteudo ?? '',
          order: index,
        }))
        .filter((section) => section.conteudo.trim().length > 0)
        .map(({ order, ...rest }) => rest)

      if (mapped.length > 0) {
        return mapped
      }
    }
  } catch (error) {
    // Ignora: conteúdo não está em JSON estruturado
  }

  // Tentativa de separar por delimitadores manuais (---)
  if (raw.includes('---')) {
    const parts = raw.split(/^-{3,}$|---+/gm).map((part) => part.trim()).filter(Boolean)
    if (parts.length > 0) {
      return parts.map((conteudo) => createEmptySection(conteudo))
    }
  }

  // Fallback: um único bloco com o texto inteiro
  return [createEmptySection(raw)]
}

const getDescriptionPreview = (raw: string | null, limit = 160) => {
  const sections = parseDescriptionSections(raw)
  const firstContent = sections[0]?.conteudo ?? ''
  const normalized = firstContent.replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return ''
  }
  return normalized.length > limit ? `${normalized.slice(0, limit)}…` : normalized
}

export function EventAdminPanel({ initialEvents }: Props) {
  const [events, setEvents] = useState(initialEvents)
  const [form, setForm] = useState<FormState>(() => createDefaultForm())
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingBanner, setEditingBanner] = useState<EventBannerRecord | null>(null)
  const supabase = useMemo(() => getSupabaseClient(), [])

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBannerFileChange = (file: File | null) => {
    if (!file) {
      setForm((prev) => ({
        ...prev,
        bannerFile: null,
        bannerPreview: editingBanner?.image_url ?? null,
      }))
      console.log('🗑️ Banner removido')
      return
    }

    console.log('📁 Arquivo selecionado:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    })

    const isValidType = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)
    if (!isValidType) {
      console.error('❌ Formato inválido:', file.type)
      setFeedback('Formato de imagem inválido. Use PNG, JPG ou WEBP.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      console.error('❌ Arquivo muito grande:', `${(file.size / 1024 / 1024).toFixed(2)}MB`)
      setFeedback('Imagem muito grande. Máximo 2MB.')
      return
    }

    const preview = URL.createObjectURL(file)
    console.log('✅ Arquivo válido, criando preview:', preview)
    setForm((prev) => ({ ...prev, bannerFile: file, bannerPreview: preview }))
    setFeedback('✅ Banner selecionado! Salve o evento para aplicar.')
  }

  const handleSectionChange = (
    sectionId: string,
    field: 'titulo' | 'conteudo',
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      descricaoSections: prev.descricaoSections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      ),
    }))
  }

  const handleAddSection = () => {
    setForm((prev) => ({
      ...prev,
      descricaoSections: [...prev.descricaoSections, createEmptySection()],
    }))
  }

  const handleRemoveSection = (sectionId: string) => {
    setForm((prev) => {
      if (prev.descricaoSections.length === 1) {
        return prev
      }
      return {
        ...prev,
        descricaoSections: prev.descricaoSections.filter((section) => section.id !== sectionId),
      }
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setFeedback(null)

    const parsedDate = parseDateTime(form.data_horario)

    if (!parsedDate) {
      setFeedback('Informe uma data e horário válidos.')
      setLoading(false)
      return
    }

    const capacidadeNumero = form.capacidade_maxima
      ? Number.parseInt(form.capacidade_maxima, 10)
      : null

    const normalizedSections = form.descricaoSections
      .map((section) => ({
        titulo: section.titulo.trim(),
        conteudo: section.conteudo.trim(),
      }))
      .filter((section) => section.conteudo.length > 0)
      .map((section) => ({
        titulo: section.titulo.length > 0 ? section.titulo : null,
        conteudo: section.conteudo,
      }))

    const descricaoPayload =
      normalizedSections.length > 0 ? JSON.stringify({ sections: normalizedSections }) : null

    const payload = {
      titulo: form.titulo,
      descricao: descricaoPayload,
      data_horario: parsedDate.toISOString(),
      local_nome: form.local_nome,
      local_detalhe: form.local_detalhe || null,
      preco: form.preco ? Number(form.preco.replace(',', '.')) : 0,
      capacidade_maxima: capacidadeNumero && !Number.isNaN(capacidadeNumero) ? capacidadeNumero : null,
      destaque: form.destaque,
    }

    const isEditing = Boolean(editingId)
    const response = await fetch('/api/admin/events', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEditing ? { id: editingId, ...payload } : payload),
    })

    if (!response.ok) {
      const { error } = await response.json()
      setFeedback(error || 'Não foi possível salvar o evento.')
      setLoading(false)
      return
    }

    const result = await response.json().catch(() => null)
    const updatedEvent = result?.data ?? null

    const eventId = updatedEvent?.id ?? editingId

    console.log('🔍 Diagnóstico upload de banner:', {
      isEditing,
      eventId,
      updatedEvent,
      hasBannerFile: !!form.bannerFile,
      fileName: form.bannerFile?.name,
    })

    const refreshEvents = async () => {
      const refresh = await fetch('/api/admin/events?list=1')
      if (refresh.ok) {
        const { data } = await refresh.json()
        setEvents(data ?? [])
      }
    }

    if (isEditing) {
      setFeedback('Evento atualizado com sucesso!')
      if (updatedEvent) {
        setEvents((prev) => prev.map((evento) => (evento.id === updatedEvent.id ? updatedEvent : evento)))
      } else {
        await refreshEvents()
      }
    } else {
      setFeedback('Evento criado com sucesso!')
      if (updatedEvent) {
        setEvents((prev) => [updatedEvent, ...prev])
      } else {
        await refreshEvents()
      }
    }

    if (form.bannerFile && eventId) {
      console.log('🚀 Iniciando upload do banner para evento:', eventId)
        try {
          const fileExt = form.bannerFile.name.split('.').pop() || 'png'
        const filePath = `${Date.now()}-${
          crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
        }.${fileExt}`

        const { error: uploadError } = await supabase.storage.from(BANNER_BUCKET).upload(filePath, form.bannerFile, {
              cacheControl: '3600',
              upsert: false,
            })

        if (uploadError) throw uploadError

            const { data: publicData } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(filePath)
            const imageUrl = publicData?.publicUrl

            if (imageUrl) {
          console.log('✅ Upload concluído. Salvando no banco:', { imageUrl, eventId, editingBanner: !!editingBanner })
          
          if (editingBanner) {
            const updateResponse = await fetch('/api/admin/event-banners', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: editingBanner.id,
                image_url: imageUrl,
                image_path: filePath,
                is_active: true,
                titulo: form.bannerTitulo || null,
                subtitulo: form.bannerSubtitulo || null,
                palestrante_instagram: form.bannerPalestranteInstagram || null,
                palestrante_descricao: form.bannerPalestranteDescricao || null,
              }),
            })
            
            console.log('📝 Resposta PUT banner:', await updateResponse.json())

            if (editingBanner.image_path && editingBanner.image_path !== filePath) {
              await supabase.storage.from(BANNER_BUCKET).remove([editingBanner.image_path])
            }
          } else {
              const createResponse = await fetch('/api/admin/event-banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  titulo: form.bannerTitulo || null,
                  subtitulo: form.bannerSubtitulo || null,
                  palestrante_instagram: form.bannerPalestranteInstagram || null,
                  palestrante_descricao: form.bannerPalestranteDescricao || null,
                event_id: eventId,
                  image_url: imageUrl,
                  image_path: filePath,
                  is_active: true,
                }),
              })
              
              const createResult = await createResponse.json()
              console.log('📝 Resposta POST banner:', createResult)
              
              if (!createResponse.ok) {
                throw new Error(createResult.error || 'Erro ao criar banner')
              }
          }

          setFeedback((prev) => (prev ? `${prev} Banner atualizado!` : 'Banner atualizado!'))
          }
        } catch (error) {
        console.error('❌ Erro ao atualizar banner:', error)
        setFeedback('Evento salvo, mas houve erro ao atualizar o banner.')
      }
      } else {
      if (form.bannerFile && !eventId) {
        console.error('❌ Banner não foi enviado: eventId não encontrado')
      }
    }

    // Atualizar dados do banner mesmo sem nova imagem (quando editando)
    if (editingBanner && eventId && !form.bannerFile) {
      const hasChanges =
        form.bannerTitulo !== (editingBanner.titulo ?? '') ||
        form.bannerSubtitulo !== (editingBanner.subtitulo ?? '') ||
        form.bannerPalestranteInstagram !== (editingBanner.palestrante_instagram ?? '') ||
        form.bannerPalestranteDescricao !== (editingBanner.palestrante_descricao ?? '')
      if (hasChanges) {
        try {
          const updateResponse = await fetch('/api/admin/event-banners', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingBanner.id,
              titulo: form.bannerTitulo || null,
              subtitulo: form.bannerSubtitulo || null,
              palestrante_instagram: form.bannerPalestranteInstagram || null,
              palestrante_descricao: form.bannerPalestranteDescricao || null,
            }),
          })
          if (updateResponse.ok) {
            setFeedback((prev) => (prev ? `${prev} Dados do banner atualizados!` : 'Dados do banner atualizados!'))
          }
        } catch (error) {
          console.error('Erro ao atualizar título/subtítulo do banner:', error)
        }
      }
    }

    setForm(createDefaultForm())
    setEditingId(null)
    setEditingBanner(null)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setFeedback('Não foi possível excluir o evento.')
      return
    }
    setEvents((prev) => prev.filter((evento) => evento.id !== id))
    setFeedback('Evento removido.')
  }

  const handleEdit = async (evento: EventRecord) => {
    setEditingId(evento.id)

    let banner: EventBannerRecord | null = null

    try {
      const { data, error } = await supabase
        .from('event_banners')
        .select('*')
        .eq('event_id', evento.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Erro ao carregar banner do evento:', error)
      } else {
        banner = (data?.[0] as EventBannerRecord | undefined) ?? null
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar banner:', error)
    }

    setEditingBanner(banner)

    const descricaoSections = parseDescriptionSections(evento.descricao)

    setForm({
      titulo: evento.titulo ?? '',
      descricaoSections,
      data_horario: formatDateForInput(evento.data_horario),
      local_nome: evento.local_nome ?? '',
      local_detalhe: evento.local_detalhe ?? '',
      preco:
        typeof evento.preco === 'number' && !Number.isNaN(evento.preco)
          ? String(evento.preco).replace('.', ',')
          : '',
      capacidade_maxima:
        typeof evento.capacidade_maxima === 'number' && !Number.isNaN(evento.capacidade_maxima)
          ? String(evento.capacidade_maxima)
          : '',
      destaque: Boolean(evento.destaque),
      bannerFile: null,
      bannerPreview: banner?.image_url ?? null,
      bannerTitulo: banner?.titulo ?? '',
      bannerSubtitulo: banner?.subtitulo ?? '',
      bannerPalestranteInstagram: banner?.palestrante_instagram ?? '',
      bannerPalestranteDescricao: banner?.palestrante_descricao ?? '',
    })

    setFeedback('Editando evento. Atualize as informações e salve.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(createDefaultForm())
    setFeedback(null)
    setEditingBanner(null)
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-white/5 bg-[#1e293b] p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-white flex items-center gap-2">
              {editingId ? <><Pencil className="h-4 w-4" /> Editar evento</> : <><Plus className="h-4 w-4" /> Novo evento</>}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {editingId
                ? 'Atualize as informações e salve'
                : 'Preencha os dados do evento'}
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold uppercase text-slate-400 transition hover:border-white/20 hover:text-white"
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Título</span>
            <input
              type="text"
              value={form.titulo}
              onChange={(event) => handleChange('titulo', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Data e horário</span>
            <input
              type="datetime-local"
              value={form.data_horario}
              onChange={(event) => handleChange('data_horario', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
              required
            />
          </label>

          <div className="space-y-3 md:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">
                  Seções do evento
                </span>
                <p className="text-[11px] text-slate-400">
                  Organize o conteúdo em blocos. Cada bloco aparece como um card na página do evento.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold uppercase text-white transition hover:border-white/20 hover:bg-white/5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar bloco</span>
              </button>
            </div>

            <div className="space-y-4">
              {form.descricaoSections.map((section, index) => (
                <div
                  key={section.id}
                  className="space-y-3 rounded-xl border border-white/10 bg-[#1e293b] p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] text-white">
                        {index + 1}
                      </span>
                      <span>Bloco do conteúdo</span>
                    </div>
                    {form.descricaoSections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(section.id)}
                        className="text-xs font-semibold uppercase text-[#f87171] transition hover:text-[#fda4af]"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <label className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase text-slate-400">
                      Título opcional
                    </span>
                    <input
                      type="text"
                      value={section.titulo}
                      onChange={(event) => handleSectionChange(section.id, 'titulo', event.target.value)}
                      placeholder="Ex: Ingresso Experiência Coffee Music"
                      className="w-full rounded-lg border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white placeholder:text-[#5f5f66]"
            />
          </label>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase text-slate-400">
                        Conteúdo
                      </span>
                      <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                        Editor de texto
                      </span>
                    </div>
                    <RichTextEditor
                      value={section.conteudo}
                      onChange={(value) => handleSectionChange(section.id, 'conteudo', value)}
                      placeholder="Escreva o conteúdo deste bloco aqui..."
                    />
                    <p className="text-[11px] text-slate-500">
                      Use a barra de ferramentas acima para formatar. Suporta títulos, listas, citações, links e imagens.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Local</span>
            <input
              type="text"
              value={form.local_nome}
              onChange={(event) => handleChange('local_nome', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Detalhes do local</span>
            <input
              type="text"
              value={form.local_detalhe}
              onChange={(event) => handleChange('local_detalhe', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Preço</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.preco}
              onChange={(event) => handleChange('preco', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
              placeholder="0 para gratuito"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Capacidade máxima</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.capacidade_maxima}
              onChange={(event) => handleChange('capacidade_maxima', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
              placeholder="Quantidade total de vagas"
            />
          </label>

          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(event) => handleChange('destaque', event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-[#1e293b]"
            />
            <span className="text-sm text-slate-300">Marcar como evento em destaque</span>
          </label>
        </div>

          <div className="space-y-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-200">
                  <ImageIcon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-base font-bold uppercase tracking-wide text-white">
                    Banner Promocional
                  </h4>
                  <p className="mt-0.5 text-xs text-amber-200/90">
                    {editingId
                      ? 'Atualize o banner do evento, se necessário'
                      : 'Recomendado: adicione uma imagem de destaque'}
                  </p>
                </div>
              </div>
        {!editingId && (
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                  Recomendado
                </span>
              )}
            </div>

            <div className="space-y-3 rounded-lg border border-white/10 bg-[#1e293b] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Nome do palestrante
                </span>
                <input
                  type="text"
                  value={form.bannerSubtitulo}
                  onChange={(event) => handleChange('bannerSubtitulo', event.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full rounded-lg border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Tema do evento
                </span>
                <input
                  type="text"
                  value={form.bannerTitulo}
                  onChange={(event) => handleChange('bannerTitulo', event.target.value)}
                  placeholder="Ex: Transformação Pessoal"
                  className="w-full rounded-lg border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500"
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Instagram do palestrante
                </span>
                <input
                  type="text"
                  value={form.bannerPalestranteInstagram}
                  onChange={(event) => handleChange('bannerPalestranteInstagram', event.target.value)}
                  placeholder="Ex: @joaosilva ou joaosilva"
                  className="w-full rounded-lg border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500"
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Descrição do palestrante
                </span>
                <textarea
                  value={form.bannerPalestranteDescricao}
                  onChange={(event) => handleChange('bannerPalestranteDescricao', event.target.value)}
                  placeholder="Ex: Fundador da empresa X, palestrante em eventos de liderança..."
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none"
                />
              </label>
            </div>

            <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  Selecione a imagem do banner
                </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => handleBannerFileChange(event.target.files?.[0] ?? null)}
                  className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-amber-500/30 bg-[#1e293b] px-4 py-4 text-sm text-white transition hover:border-amber-500/50 hover:bg-[#1a1a1f] file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-amber-500/20 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-amber-200 file:transition hover:file:bg-amber-500/30"
              />
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ImageIcon className="h-3 w-3 shrink-0" />
                  Formato: PNG, JPG ou WebP • Tamanho: 1200×640 px • Rosto/sujeito no terço superior, parte inferior livre para texto
                </p>
              </label>

              {(form.bannerPreview || editingBanner?.image_url) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-300">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-semibold">Pré-visualização do banner:</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={form.bannerPreview ?? editingBanner?.image_url ?? ''}
                  alt="Pré-visualização do banner"
                    className="h-40 w-full rounded-lg border border-emerald-500/30 object-cover shadow-lg"
                />
                  {form.bannerFile && (
                    <button
                      type="button"
                      onClick={() => handleBannerFileChange(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-amber-300 transition hover:text-amber-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover banner
                    </button>
                  )}
                </div>
              )}

              {editingId && editingBanner && !form.bannerFile && (
                <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-200">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Banner atual em uso. Selecione um novo arquivo acima para substituí-lo.</span>
          </div>
        )}

              {!form.bannerPreview && !editingBanner && !form.bannerFile && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Dica: Eventos com banner se destacam mais! Use 1200×640 px, rosto no terço superior e parte inferior livre para o texto.</span>
                </div>
              )}
            </div>
          </div>

        {feedback && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.includes('sucesso')
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}>
            {feedback}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : editingId ? (
            <>
              <Save className="h-4 w-4" />
              Atualizar evento
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Criar evento
            </>
          )}
        </button>
      </form>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Eventos cadastrados
          </h3>
          <span className="rounded-full bg-[#334155] px-3 py-1 text-xs font-bold text-white">
            {events.length}
          </span>
        </div>
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#1e293b] p-8 text-center">
            <p className="text-sm text-slate-400">Nenhum evento cadastrado ainda.</p>
            <p className="mt-1 text-xs text-slate-500">Crie seu primeiro evento acima</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evento) => (
              <div
                key={evento.id}
                className="group flex flex-col gap-4 rounded-xl border border-white/5 bg-[#1e293b] p-5 shadow-lg transition hover:border-white/10 hover:shadow-xl md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-start gap-2">
                    <h4 className="text-base font-bold text-white">
                      {evento.titulo}
                    </h4>
                    {evento.destaque && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    📍 {evento.local_nome} • 🕐 {new Date(evento.data_horario).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {getDescriptionPreview(evento.descricao) && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {getDescriptionPreview(evento.descricao)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(evento)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#334155] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/20 hover:bg-[#34343b]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(evento.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-300 transition hover:border-red-500/50 hover:bg-red-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

