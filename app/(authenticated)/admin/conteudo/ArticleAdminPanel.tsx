'use client'

import { FormEvent, useState } from 'react'
import type { ArticleRecord } from '@/lib/queries'

type Props = {
  initialArticles: ArticleRecord[]
}

const categorias = [
  { value: 'dicas', label: 'Dicas' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'treino', label: 'Treino' },
  { value: 'bem-estar', label: 'Bem-estar' },
  { value: 'outros', label: 'Outros' },
]

type FormState = {
  titulo: string
  autor_handle: string
  categoria: string
  resumo: string
  icone: string
}

const defaultForm: FormState = {
  titulo: '',
  autor_handle: '',
  categoria: 'dicas',
  resumo: '',
  icone: '',
}

export function ArticleAdminPanel({ initialArticles }: Props) {
  const [articles, setArticles] = useState(initialArticles)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setFeedback(null)

    const payload = {
      titulo: form.titulo,
      autor_handle: form.autor_handle || '@ritmocerto',
      categoria: form.categoria,
      resumo: form.resumo || null,
      icone: form.icone || null,
    }

    const response = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const { error } = await response.json()
      setFeedback(error || 'Erro ao criar artigo.')
      setLoading(false)
      return
    }

    setFeedback('Artigo criado com sucesso!')
    setForm(defaultForm)
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
      setFeedback('Não foi possível excluir o artigo.')
      return
    }
    setArticles((prev) => prev.filter((article) => article.id !== id))
    setFeedback('Artigo removido.')
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-white/10 bg-[#1e293b] p-6 shadow-lg"
      >
        <div>
          <h3 className="text-lg font-semibold text-white">Novo artigo</h3>
          <p className="text-sm text-slate-400">
            Divulgue conteúdos relevantes para a comunidade.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Título</span>
            <input
              type="text"
              value={form.titulo}
              onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Autor</span>
            <input
              type="text"
              value={form.autor_handle}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, autor_handle: event.target.value }))
              }
              placeholder="@usuario"
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Categoria</span>
            <select
              value={form.categoria}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, categoria: event.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
            >
              {categorias.map((categoria) => (
                <option key={categoria.value} value={categoria.value}>
                  {categoria.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Resumo</span>
            <textarea
              value={form.resumo}
              onChange={(event) => setForm((prev) => ({ ...prev, resumo: event.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Ícone (emoji)</span>
            <input
              type="text"
              maxLength={2}
              value={form.icone}
              onChange={(event) => setForm((prev) => ({ ...prev, icone: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
              placeholder="Ex: ☕"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Salvando...' : 'Publicar artigo'}
        </button>

        {feedback && <p className="text-center text-xs text-slate-400">{feedback}</p>}
      </form>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Conteúdos publicados</h3>
        {articles.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum conteúdo cadastrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#1e293b] p-5 shadow-lg md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h4 className="text-base font-semibold text-white">{article.titulo}</h4>
                  <p className="text-xs text-slate-400">
                    {article.autor_handle} • {article.categoria}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(article.id)}
                  className="self-start rounded-full border border-red-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-300 transition hover:bg-red-500/10 md:self-auto"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

