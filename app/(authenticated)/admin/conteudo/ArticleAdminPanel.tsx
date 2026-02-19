'use client'

import { FormEvent, useMemo, useState, useRef } from 'react'
import { Image as ImageIcon, Upload, X, Pencil, Images, Loader2, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react'
import type { ArticleRecord, ArticleGalleryRecord } from '@/lib/queries'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { RichTextEditor } from '@/components/RichTextEditor'

type Props = {
  initialArticles: ArticleRecord[]
}

const CONTENT_BUCKET = 'event-banners'
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB

const categorias = [
  { value: 'dicas', label: 'Dicas' },
  { value: 'inspiracao', label: 'Inspiração' },
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
  { value: 'palestras', label: 'Palestras' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'outros', label: 'Outros' },
]

const tiposConteudo = [
  { value: 'blog', label: 'Conteúdo / Blog' },
  { value: 'inicio', label: 'Início (destaque)' },
  { value: 'comunidade', label: 'Comunidade' },
  { value: 'geral', label: 'Todos os lugares' },
]

type FormState = {
  titulo: string
  autor_handle: string
  categoria: string
  resumo: string
  conteudo: string
  icone: string
  tipo_conteudo: string
  imageFile: File | null
  imagePreviewUrl: string | null
}

const defaultForm: FormState = {
  titulo: '',
  autor_handle: '@maxistalks',
  categoria: 'dicas',
  resumo: '',
  conteudo: '',
  icone: '',
  tipo_conteudo: 'blog',
  imageFile: null,
  imagePreviewUrl: null,
}

export function ArticleAdminPanel({ initialArticles }: Props) {
  const [articles, setArticles] = useState(initialArticles)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [filterTipo, setFilterTipo] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreatePanelCollapsed, setIsCreatePanelCollapsed] = useState(true)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<ArticleGalleryRecord[]>([])
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null)
  const [broadcastFeedback, setBroadcastFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const supabase = useMemo(() => getSupabaseClient(), [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setFeedback('Formato inválido. Use PNG, JPG ou WEBP.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFeedback('Imagem muito grande. Máximo 3MB.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreviewUrl: previewUrl,
    }))
    setFeedback(null)
  }

  const clearImage = () => {
    if (form.imagePreviewUrl) URL.revokeObjectURL(form.imagePreviewUrl)
    setForm((prev) => ({
      ...prev,
      imageFile: null,
      imagePreviewUrl: null,
    }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startEdit = async (article: ArticleRecord) => {
    setEditingId(article.id)
    setIsCreatePanelCollapsed(false)
    setForm({
      titulo: article.titulo,
      autor_handle: article.autor_handle || '@maxistalks',
      categoria: article.categoria || 'dicas',
      resumo: article.resumo || '',
      conteudo: article.conteudo || '',
      icone: article.icone || '',
      tipo_conteudo: article.tipo_conteudo || 'blog',
      imageFile: null,
      imagePreviewUrl: null,
    })
    setExistingImageUrl(article.image_url || null)
    setFeedback(null)

    try {
      const res = await fetch(`/api/admin/article-gallery?article_id=${article.id}`)
      if (res.ok) {
        const { data } = await res.json()
        setGalleryPhotos(data ?? [])
      } else {
        setGalleryPhotos([])
      }
    } catch {
      setGalleryPhotos([])
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreatePanelCollapsed(true)
    setExistingImageUrl(null)
    setGalleryPhotos([])
    setForm(defaultForm)
    clearImage()
    setFeedback(null)
  }

  const handleAddGalleryPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editingId) return

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setFeedback('Formato inválido. Use PNG, JPG ou WEBP.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFeedback('Imagem muito grande. Máximo 3MB.')
      return
    }

    setGalleryUploading(true)
    setFeedback(null)

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
      const filePath = `gallery/${editingId}/${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(CONTENT_BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage.from(CONTENT_BUCKET).getPublicUrl(filePath)
      const imageUrl = publicData?.publicUrl

      const response = await fetch('/api/admin/article-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: editingId,
          image_url: imageUrl,
          image_path: filePath,
          ordem: galleryPhotos.length,
        }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || 'Erro ao adicionar foto')
      }

      const { data } = await response.json()
      setGalleryPhotos((prev) => [...prev, data])
      setFeedback('Foto adicionada à galeria!')
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Não foi possível adicionar a foto.')
    } finally {
      setGalleryUploading(false)
      event.target.value = ''
    }
  }

  const handleRemoveGalleryPhoto = async (id: string) => {
    const response = await fetch(`/api/admin/article-gallery?id=${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setFeedback('Não foi possível remover a foto.')
      return
    }
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== id))
    setFeedback('Foto removida.')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setFeedback(null)

    let imageUrl: string | null = null
    let imagePath: string | null = null

    if (form.imageFile) {
      const fileExt = form.imageFile.name.split('.').pop()?.toLowerCase() || 'png'
      const filePath = `articles/${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(CONTENT_BUCKET)
        .upload(filePath, form.imageFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setFeedback('Não foi possível enviar a imagem. Tente novamente.')
        setLoading(false)
        return
      }

      const { data: publicData } = supabase.storage.from(CONTENT_BUCKET).getPublicUrl(filePath)
      imageUrl = publicData?.publicUrl ?? null
      imagePath = filePath
    }

    const isEditing = Boolean(editingId)

    const payload: Record<string, unknown> = {
      titulo: form.titulo,
      autor_handle: form.autor_handle || '@maxistalks',
      categoria: form.categoria,
      resumo: form.resumo || null,
      conteudo: form.conteudo || null,
      icone: form.icone || null,
      tipo_conteudo: form.tipo_conteudo,
    }

    if (imageUrl && imagePath) {
      payload.image_url = imageUrl
      payload.image_path = imagePath
    } else if (isEditing) {
      const current = articles.find((a) => a.id === editingId)
      payload.image_url = existingImageUrl
      payload.image_path = current?.image_path ?? null
    }

    const response = isEditing
      ? await fetch('/api/admin/articles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      : await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    if (!response.ok) {
      const { error } = await response.json().catch(() => ({ error: 'Erro ao salvar.' }))
      setFeedback(error || 'Erro ao salvar.')
      setLoading(false)
      return
    }

    setFeedback(isEditing ? 'Conteúdo atualizado!' : 'Conteúdo criado com sucesso!')
    setEditingId(null)
    setExistingImageUrl(null)
    setForm({ ...defaultForm, tipo_conteudo: form.tipo_conteudo })
    clearImage()
    setLoading(false)

    const refresh = await fetch('/api/admin/articles?list=1')
    if (refresh.ok) {
      const { data } = await refresh.json()
      setArticles(data ?? [])
    }
  }

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setFeedback('Não foi possível excluir o conteúdo.')
      return
    }
    setArticles((prev) => prev.filter((article) => article.id !== id))
    setFeedback('Conteúdo removido.')
  }

  const handleBroadcast = async (articleId: string) => {
    if (!confirm('Enviar este conteúdo por e-mail para todos os leads da newsletter?')) return
    setBroadcastingId(articleId)
    setBroadcastFeedback(null)
    try {
      const res = await fetch('/api/admin/broadcast-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      })
      const json = await res.json()
      if (!res.ok) {
        setBroadcastFeedback({ id: articleId, msg: json.error || 'Erro ao enviar.', ok: false })
      } else {
        setBroadcastFeedback({ id: articleId, msg: 'Newsletter enviada com sucesso!', ok: true })
      }
    } catch {
      setBroadcastFeedback({ id: articleId, msg: 'Erro de conexão. Tente novamente.', ok: false })
    } finally {
      setBroadcastingId(null)
    }
  }

  const filteredArticles =
    filterTipo === 'all'
      ? articles
      : articles.filter((a) => a.tipo_conteudo === filterTipo || a.tipo_conteudo === 'geral')

  const tipoLabel = (t: string | null) => tiposConteudo.find((x) => x.value === t)?.label ?? t ?? '—'

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-white/10 bg-[#1e293b] p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {editingId ? 'Editar conteúdo' : 'Novo conteúdo'}
            </h3>
            <p className="text-sm text-slate-400">
              {editingId
                ? 'Atualize os dados do artigo.'
                : 'Crie artigos com imagens e defina onde cada conteúdo aparece no app.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editingId && (
              <button
                type="button"
                onClick={() => setIsCreatePanelCollapsed((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold uppercase text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                {isCreatePanelCollapsed ? (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Expandir
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Minimizar
                  </>
                )}
              </button>
            )}
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-slate-600/40 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-700/50 hover:text-white"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {(!isCreatePanelCollapsed || editingId) && (
        <>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Título *</span>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Autor</span>
            <input
              type="text"
              value={form.autor_handle}
              onChange={(e) => setForm((prev) => ({ ...prev, autor_handle: e.target.value }))}
              placeholder="@usuario"
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Categoria</span>
            <select
              value={form.categoria}
              onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white"
            >
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Onde aparece *</span>
            <select
              value={form.tipo_conteudo}
              onChange={(e) => setForm((prev) => ({ ...prev, tipo_conteudo: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white"
            >
              {tiposConteudo.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Ícone (emoji)</span>
            <input
              type="text"
              maxLength={2}
              value={form.icone}
              onChange={(e) => setForm((prev) => ({ ...prev, icone: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white"
              placeholder="Ex: 💡"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Resumo (prévia nos cards)</span>
            <textarea
              value={form.resumo}
              onChange={(e) => setForm((prev) => ({ ...prev, resumo: e.target.value }))}
              rows={2}
              placeholder="Breve descrição para aparecer nos cards"
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white"
            />
          </label>

          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Conteúdo completo
              </label>
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                Editor de texto
              </span>
            </div>
            <RichTextEditor
              value={form.conteudo}
              onChange={(value) => setForm((prev) => ({ ...prev, conteudo: value }))}
              placeholder="Escreva o conteúdo completo do artigo aqui..."
            />
            <p className="text-[11px] text-slate-500">
              Use a barra de ferramentas acima para formatar. Suporta títulos, listas, citações, links e imagens.
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Imagem de capa</span>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              {form.imagePreviewUrl ? (
                <div className="relative">
                  <img
                    src={form.imagePreviewUrl}
                    alt="Preview"
                    className="h-32 w-auto rounded-xl border border-white/10 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white transition hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : existingImageUrl ? (
                <div className="relative">
                  <img
                    src={existingImageUrl}
                    alt="Atual"
                    className="h-32 w-auto rounded-xl border border-white/10 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white transition hover:bg-black/80"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-32 w-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/5 text-slate-400 transition hover:border-white/30 hover:bg-white/10"
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-xs font-medium">Adicionar imagem</span>
                </button>
              )}
              <p className="text-xs text-slate-500">
                PNG, JPG ou WEBP. Máx. 3MB. {editingId && 'Deixe em branco para manter a atual.'}
              </p>
            </div>
          </div>

          {editingId && (
            <div className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Images className="h-4 w-4" />
                Fotos "como foi o evento"
              </span>
              <p className="text-xs text-slate-500">
                Adicione fotos que aparecem em carrossel na página do artigo.
              </p>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleAddGalleryPhoto}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={galleryUploading}
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-blue-500/40 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:border-blue-500/60 hover:bg-blue-500/10 disabled:opacity-50"
              >
                {galleryUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {galleryUploading ? 'Enviando...' : 'Adicionar foto'}
              </button>
              {galleryPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.image_url}
                        alt=""
                        className="h-24 w-full rounded-lg border border-white/10 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryPhoto(photo.id)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Publicar conteúdo'}
        </button>

        {feedback && (
          <p className={`text-center text-sm ${feedback.includes('Erro') ? 'text-red-400' : 'text-slate-400'}`}>
            {feedback}
          </p>
        )}
        </>
        )}
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">Conteúdos publicados</h3>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#1e293b] px-3 py-2 text-sm text-white"
          >
            <option value="all">Todos</option>
            {tiposConteudo.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {filteredArticles.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum conteúdo encontrado.</p>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#1e293b] p-5 shadow-lg md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt=""
                      className="h-14 w-20 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <ImageIcon className="h-6 w-6 text-slate-500" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white">{article.titulo}</h4>
                    <p className="text-xs text-slate-400">
                      {article.autor_handle} • {article.categoria} • {tipoLabel(article.tipo_conteudo)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 self-start md:self-auto">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(article)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-300 transition hover:bg-blue-500/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBroadcast(article.id)}
                      disabled={broadcastingId === article.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-green-300 transition hover:bg-green-500/10 disabled:opacity-50"
                    >
                      {broadcastingId === article.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {broadcastingId === article.id ? 'Enviando...' : 'Newsletter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(article.id)}
                      className="rounded-full border border-red-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-300 transition hover:bg-red-500/10"
                    >
                      Excluir
                    </button>
                  </div>
                  {broadcastFeedback?.id === article.id && (
                    <p className={`text-xs font-medium ${broadcastFeedback.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {broadcastFeedback.msg}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
