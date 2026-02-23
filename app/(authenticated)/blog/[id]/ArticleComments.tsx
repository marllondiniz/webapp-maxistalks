'use client'

import { FormEvent, useEffect, useState } from 'react'
import type { ArticleCommentItem } from '@/app/api/articles/[id]/comments/route'
import Image from 'next/image'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { Pencil, Trash2, User, Linkedin, Instagram, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Props = {
  articleId: string
}

export function ArticleComments({ articleId }: Props) {
  const t = useTranslations('UserBlogComments')
  const [comments, setComments] = useState<ArticleCommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [profileView, setProfileView] = useState<ArticleCommentItem | null>(null)

  /** Normaliza URL do LinkedIn/Instagram para abrir em nova aba. */
  function normalizeSocialUrl(url: string | null | undefined, type: 'linkedin' | 'instagram'): string | null {
    if (!url?.trim()) return null
    const raw = url.trim()
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    if (type === 'linkedin') return `https://linkedin.com/in/${raw.replace(/^\/+|\/+$/g, '')}`
    if (type === 'instagram') return `https://instagram.com/${raw.replace(/^@?\/*|\/*$/g, '')}`
    return null
  }

  function getAvatarDisplayUrl(avatarUrl: string | null | undefined): string | null {
    if (!avatarUrl) return null
    if (avatarUrl.startsWith('http')) return avatarUrl
    try {
      const { data } = getSupabaseClient().storage.from('avatars').getPublicUrl(avatarUrl)
      return data.publicUrl
    } catch {
      return null
    }
  }

  const fetchComments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? t('errorLoad'))
      setComments(data.comments ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorLoad'))
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [articleId])

  useEffect(() => {
    let isMounted = true
    getSupabaseClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (isMounted && session?.user) setCurrentUserId(session.user.id)
      })
    return () => { isMounted = false }
  }, [])

  async function authHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    const { data: { session } } = await getSupabaseClient().auth.getSession()
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
    return headers
  }

  const startEdit = (c: ArticleCommentItem) => {
    setEditingId(c.id)
    setEditBody(c.body)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditBody('')
  }

  const saveEdit = async () => {
    if (!editingId || !editBody.trim()) return
    setError(null)
    try {
      const res = await fetch(
        `/api/articles/${articleId}/comments?commentId=${encodeURIComponent(editingId)}`,
        { method: 'PUT', headers: await authHeaders(), body: JSON.stringify({ body: editBody.trim() }) }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? t('errorEdit'))
      setComments((prev) => prev.map((x) => (x.id === editingId ? data.comment : x)))
      cancelEdit()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorEdit'))
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm(t('deleteConfirm'))) return
    setDeletingId(commentId)
    setError(null)
    try {
      const res = await fetch(
        `/api/articles/${articleId}/comments?commentId=${encodeURIComponent(commentId)}`,
        { method: 'DELETE', headers: await authHeaders() }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? t('errorDelete'))
      setComments((prev) => prev.filter((x) => x.id !== commentId))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorDelete'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ body: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? t('errorPost'))
      setBody('')
      setComments((prev) => [...prev, data.comment])
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorPost'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12 border-t border-slate-600/30 pt-6">
      <h2 className="mb-4 text-lg font-semibold text-[#f5f5f5]">{t('title')}</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('placeholder')}
          rows={3}
          className="w-full rounded-xl border border-slate-600/40 bg-slate-900 px-4 py-3 text-sm text-[#f5f5f5] placeholder:text-slate-500 focus:border-slate-500/50 focus:outline-none"
          disabled={submitting}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!body.trim() || submitting}
            className="rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>

      {error && (
        <p className="mb-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">{t('loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">{t('empty')}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-slate-600/30 bg-slate-800/50 p-4"
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileView(c)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    title="Ver perfil"
                  >
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-700 ring-2 ring-transparent transition hover:ring-slate-500">
                      {getAvatarDisplayUrl(c.author_avatar_url) ? (
                        <Image
                          src={getAvatarDisplayUrl(c.author_avatar_url)!}
                          alt=""
                          width={36}
                          height={36}
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-slate-400">
                          <User className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="font-medium text-[#f5f5f5]">
                        {c.author_name || t('anonymous')}
                      </span>
                      <span className="text-slate-500">
                        {new Date(c.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </button>
                </div>
                {currentUserId === c.user_id && (
                  <div className="flex items-center gap-1">
                    {editingId === c.id ? (
                      <>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2563eb]"
                        >
                          {t('save')}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg border border-slate-500/50 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700/50"
                        >
                          {t('cancel')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded p-1.5 text-slate-400 transition hover:bg-slate-700/50 hover:text-[#f5f5f5]"
                          title={t('save')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="rounded p-1.5 text-slate-400 transition hover:bg-red-900/30 hover:text-red-400 disabled:opacity-50"
                          title={t('deleteConfirm')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {editingId === c.id ? (
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-600/40 bg-slate-900 px-3 py-2 text-sm text-[#f5f5f5] focus:border-slate-500/50 focus:outline-none"
                  autoFocus
                />
              ) : (
                <p className="text-[15px] leading-relaxed text-[#c9c9d2] whitespace-pre-wrap">
                  {c.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Modal de perfil ao clicar no autor */}
      {profileView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setProfileView(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t('viewProfile')}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-600/40 bg-slate-800 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setProfileView(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700/50 hover:text-white"
                aria-label={t('closeProfile')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full bg-slate-700">
                {getAvatarDisplayUrl(profileView.author_avatar_url) ? (
                  <Image
                    src={getAvatarDisplayUrl(profileView.author_avatar_url)!}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-slate-400">
                    <User className="h-10 w-10" />
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[#f5f5f5]">
                {profileView.author_name || t('anonymous')}
              </h3>
              {profileView.author_bio && (
                <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-slate-400 line-clamp-3">
                  {profileView.author_bio.length > 160
                    ? `${profileView.author_bio.slice(0, 160).trim()}…`
                    : profileView.author_bio}
                </p>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {normalizeSocialUrl(profileView.author_linkedin, 'linkedin') && (
                  <a
                    href={normalizeSocialUrl(profileView.author_linkedin, 'linkedin')!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0a66c2]/20 px-4 py-2.5 text-sm font-medium text-[#0a66c2] transition hover:bg-[#0a66c2]/30"
                  >
                    <Linkedin className="h-5 w-5" />
                    LinkedIn
                  </a>
                )}
                {normalizeSocialUrl(profileView.author_instagram, 'instagram') && (
                  <a
                    href={normalizeSocialUrl(profileView.author_instagram, 'instagram')!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]/20 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    <Instagram className="h-5 w-5" />
                    Instagram
                  </a>
                )}
                {!normalizeSocialUrl(profileView.author_linkedin, 'linkedin') &&
                  !normalizeSocialUrl(profileView.author_instagram, 'instagram') && (
                  <p className="text-sm text-slate-500">{t('noSocials')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
