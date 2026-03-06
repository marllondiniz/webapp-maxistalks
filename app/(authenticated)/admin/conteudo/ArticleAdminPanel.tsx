'use client'

import { FormEvent, useMemo, useState, useRef, useEffect } from 'react'
import { Image as ImageIcon, Upload, X, Pencil, Images, Loader2, Trash2, ChevronDown, ChevronUp, Send, MessageSquare } from 'lucide-react'
import type { ArticleRecord, ArticleGalleryRecord } from '@/lib/queries'
import type { AdminArticleCommentItem } from '@/app/api/admin/articles/[articleId]/comments/route'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { RichTextEditor } from '@/components/RichTextEditor'
import { useTranslations } from 'next-intl'

type Props = {
  initialArticles: ArticleRecord[]
}

const CONTENT_BUCKET = 'event-banners'
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB

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
  const t = useTranslations('AdminConteudo')
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
  const [sendingTestId, setSendingTestId] = useState<string | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [broadcastFeedback, setBroadcastFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null)
  const [newsletterCooldownUntil, setNewsletterCooldownUntil] = useState<Record<string, number>>({})
  const [now, setNow] = useState(() => Date.now())
  const [commentsModalArticle, setCommentsModalArticle] = useState<ArticleRecord | null>(null)
  const [commentsList, setCommentsList] = useState<AdminArticleCommentItem[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const hasActive = Object.values(newsletterCooldownUntil).some((until) => until > Date.now())
    if (!hasActive) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [newsletterCooldownUntil])
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

  const NEWSLETTER_COOLDOWN_MS = 15_000

  const handleBroadcast = async (articleId: string) => {
    if (newsletterCooldownUntil[articleId] != null && now < newsletterCooldownUntil[articleId]) {
      const secs = Math.ceil((newsletterCooldownUntil[articleId] - now) / 1000)
      setBroadcastFeedback({ id: articleId, msg: `Aguarde ${secs}s para reenviar.`, ok: false })
      return
    }
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
        const successMsg =
          json.message ||
          (json.sent > 0
            ? `Enviado para ${json.sent} contato(s).${json.alreadyReceived ? ` (${json.alreadyReceived} já tinham recebido)` : ''}`
            : 'Newsletter enviada com sucesso!')
        setBroadcastFeedback({ id: articleId, msg: successMsg, ok: true })
        if (json.sent > 0) {
          setNewsletterCooldownUntil((prev) => ({ ...prev, [articleId]: Date.now() + NEWSLETTER_COOLDOWN_MS }))
        }
      }
    } catch {
      setBroadcastFeedback({ id: articleId, msg: 'Erro de conexão. Tente novamente.', ok: false })
    } finally {
      setBroadcastingId(null)
    }
  }

  const handleSendTest = async (articleId: string) => {
    const email = testEmail.trim()
    if (!email) {
      setBroadcastFeedback({ id: articleId, msg: 'Informe um e-mail para enviar o teste.', ok: false })
      return
    }
    setSendingTestId(articleId)
    setBroadcastFeedback(null)
    try {
      const res = await fetch('/api/admin/broadcast-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, testEmail: email }),
      })
      const json = await res.json()
      if (!res.ok) {
        setBroadcastFeedback({ id: articleId, msg: json.error || 'Erro ao enviar teste.', ok: false })
      } else {
        setBroadcastFeedback({ id: articleId, msg: json.message || `E-mail de teste enviado para ${email}.`, ok: true })
      }
    } catch {
      setBroadcastFeedback({ id: articleId, msg: 'Erro de conexão. Tente novamente.', ok: false })
    } finally {
      setSendingTestId(null)
    }
  }

  async function authHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`
    return headers
  }

  const openCommentsModal = async (article: ArticleRecord) => {
    setCommentsModalArticle(article)
    setCommentsList([])
    setReplyBody('')
    setCommentsLoading(true)
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/comments`, {
        headers: await authHeaders(),
      })
      const data = await res.json()
      if (res.ok) setCommentsList(data.comments ?? [])
    } catch {
      setCommentsList([])
    } finally {
      setCommentsLoading(false)
    }
  }

  const closeCommentsModal = () => {
    setCommentsModalArticle(null)
    setCommentsList([])
    setReplyBody('')
    setDeletingCommentId(null)
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!commentsModalArticle || !confirm('Excluir este comentário?')) return
    setDeletingCommentId(commentId)
    try {
      const res = await fetch(
        `/api/admin/articles/${commentsModalArticle.id}/comments?commentId=${encodeURIComponent(commentId)}`,
        { method: 'DELETE', headers: await authHeaders() }
      )
      if (res.ok) setCommentsList((prev) => prev.filter((c) => c.id !== commentId))
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleSubmitReply = async (e: FormEvent) => {
    e.preventDefault()
    if (!commentsModalArticle || !replyBody.trim() || replySubmitting) return
    setReplySubmitting(true)
    try {
      const res = await fetch(`/api/articles/${commentsModalArticle.id}/comments`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ body: replyBody.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.comment) {
        setCommentsList((prev) => [...prev, {
          id: data.comment.id,
          body: data.comment.body,
          created_at: data.comment.created_at,
          user_id: data.comment.user_id,
          author_name: data.comment.author_name ?? null,
          author_email: data.comment.author_email ?? null,
          author_avatar_url: data.comment.author_avatar_url ?? null,
        }])
        setReplyBody('')
      }
    } finally {
      setReplySubmitting(false)
    }
  }

  const filteredArticles =
    filterTipo === 'all'
      ? articles
      : articles.filter((a) => a.tipo_conteudo === filterTipo || a.tipo_conteudo === 'geral')

  const categorias = [
    { value: 'dicas', label: t('catDicas') },
    { value: 'inspiracao', label: t('catInspiracao') },
    { value: 'desenvolvimento', label: t('catDesenvolvimento') },
    { value: 'palestras', label: t('catPalestras') },
    { value: 'vendas', label: t('catVendas') },
    { value: 'marketing', label: t('catMarketing') },
    { value: 'outros', label: t('catOutros') },
  ]

  const tiposConteudo = [
    { value: 'blog', label: t('typeBlog') },
    { value: 'inicio', label: t('typeInicio') },
    { value: 'comunidade', label: t('typeComunidade') },
    { value: 'geral', label: t('typeGeral') },
  ]

  const tipoLabel = (tipo: string | null) => tiposConteudo.find((x) => x.value === tipo)?.label ?? tipo ?? '—'

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-white/10 bg-[var(--brand-surface)] p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {editingId ? t('editArticle') : t('newArticle')}
            </h3>
            <p className="text-sm text-[var(--brand-text-muted)]">
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
                className="rounded-lg border border-slate-600/40 px-3 py-2 text-sm text-[var(--brand-text-muted)] transition hover:bg-slate-700/50 hover:text-white"
              >
                {t('cancel')}
              </button>
            )}
          </div>
        </div>

        {(!isCreatePanelCollapsed || editingId) && (
        <>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-[var(--brand-text-muted)]">{t('titleLabel')} *</span>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[var(--brand-surface-alt)] px-4 py-3 text-sm text-white"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-[var(--brand-text-muted)]">{t('authorLabel')}</span>
            <input
              type="text"
              value={form.autor_handle}
              onChange={(e) => setForm((prev) => ({ ...prev, autor_handle: e.target.value }))}
              placeholder="@usuario"
              className="w-full rounded-xl border border-white/10 bg-[var(--brand-surface-alt)] px-4 py-3 text-sm text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-[var(--brand-text-muted)]">{t('categoryLabel')}</span>
            <select
              value={form.categoria}
              onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[var(--brand-surface-alt)] px-4 py-3 text-sm text-white"
            >
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-[var(--brand-text-muted)]">Onde aparece *</span>
            <select
              value={form.tipo_conteudo}
              onChange={(e) => setForm((prev) => ({ ...prev, tipo_conteudo: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[var(--brand-surface-alt)] px-4 py-3 text-sm text-white"
            >
              {tiposConteudo.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-[var(--brand-text-muted)]">Ícone (emoji)</span>
            <input
              type="text"
              maxLength={2}
              value={form.icone}
              onChange={(e) => setForm((prev) => ({ ...prev, icone: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[var(--brand-surface-alt)] px-4 py-3 text-sm text-white"
              placeholder="Ex: 💡"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-[var(--brand-text-muted)]">Resumo (prévia nos cards)</span>
            <textarea
              value={form.resumo}
              onChange={(e) => setForm((prev) => ({ ...prev, resumo: e.target.value }))}
              rows={2}
              placeholder="Breve descrição para aparecer nos cards"
              className="w-full rounded-xl border border-white/10 bg-[var(--brand-surface-alt)] px-4 py-3 text-sm text-white"
            />
          </label>

          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-muted)]">
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
            <span className="text-xs font-semibold uppercase text-[var(--brand-text-muted)]">Imagem de capa</span>
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
                  className="flex h-32 w-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/5 text-[var(--brand-text-muted)] transition hover:border-white/30 hover:bg-white/10"
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
              <span className="text-xs font-semibold uppercase text-[var(--brand-text-muted)] flex items-center gap-2">
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
          className="w-full rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? t('saving') : editingId ? t('save') : t('newArticle')}
        </button>

        {feedback && (
          <p className={`text-center text-sm ${feedback.includes('Erro') ? 'text-red-400' : 'text-[var(--brand-text-muted)]'}`}>
            {feedback}
          </p>
        )}
        </>
        )}
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{t('articles')}</h3>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="rounded-lg border border-white/10 bg-[var(--brand-surface)] px-3 py-2 text-sm text-white"
          >
            <option value="all">{t('filterAll')}</option>
            {tiposConteudo.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <span className="text-xs font-medium text-[var(--brand-text-muted)]">E-mail de teste:</span>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="seu@email.com"
            className="min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/40"
          />
          <p className="text-[11px] text-slate-500">Use o botão &quot;Enviar teste&quot; em cada artigo para visualizar o e-mail antes de enviar a newsletter.</p>
        </div>

        {filteredArticles.length === 0 ? (
          <p className="text-sm text-[var(--brand-text-muted)]">{t('noArticles')}</p>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[var(--brand-surface)] p-5 shadow-lg md:flex-row md:items-center md:justify-between"
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
                    <p className="text-xs text-[var(--brand-text-muted)]">
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
                      {t('editArticle')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBroadcast(article.id)}
                      disabled={
                        broadcastingId === article.id ||
                        (newsletterCooldownUntil[article.id] != null && now < newsletterCooldownUntil[article.id])
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-green-300 transition hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {broadcastingId === article.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {broadcastingId === article.id
                        ? 'Enviando...'
                        : newsletterCooldownUntil[article.id] != null && now < newsletterCooldownUntil[article.id]
                          ? `Aguarde ${Math.ceil((newsletterCooldownUntil[article.id] - now) / 1000)}s`
                          : 'Newsletter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendTest(article.id)}
                      disabled={sendingTestId === article.id || !testEmail.trim()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingTestId === article.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {sendingTestId === article.id ? 'Enviando...' : 'Enviar teste'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openCommentsModal(article)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:bg-white/5 hover:text-white"
                      title="Ver e gerenciar comentários"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Comentários
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(article.id)}
                      className="rounded-full border border-red-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-300 transition hover:bg-red-500/10"
                    >
                      {t('delete')}
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

      {/* Modal Comentários */}
      {commentsModalArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeCommentsModal}
          role="dialog"
          aria-modal="true"
          aria-label="Comentários do artigo"
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[var(--brand-surface)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="text-lg font-bold text-white">
                Comentários — {commentsModalArticle.titulo}
              </h3>
              <button
                type="button"
                onClick={closeCommentsModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : commentsList.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">Nenhum comentário ainda.</p>
              ) : (
                <ul className="space-y-3">
                  {commentsList.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-white">
                            {c.author_name || c.author_email || 'Anônimo'}
                          </p>
                          {c.author_email && (
                            <p className="text-xs text-slate-500">{c.author_email}</p>
                          )}
                          <p className="text-[11px] text-slate-600">
                            {new Date(c.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          disabled={deletingCommentId === c.id}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                          title="Excluir comentário"
                        >
                          {deletingCommentId === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-slate-300">{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
              <form onSubmit={handleSubmitReply} className="mt-6 border-t border-white/10 pt-4">
                <label className="mb-2 block text-xs font-semibold text-slate-400">
                  Responder como administrador
                </label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/40"
                  disabled={replySubmitting}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!replyBody.trim() || replySubmitting}
                    className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {replySubmitting ? (
                      <>
                        <Loader2 className="inline h-4 w-4 animate-spin" /> Enviando...
                      </>
                    ) : (
                      'Enviar resposta'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
