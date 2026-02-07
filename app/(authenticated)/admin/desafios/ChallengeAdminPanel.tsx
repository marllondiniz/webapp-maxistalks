'use client'

import { FormEvent, useState } from 'react'
import type { ChallengeRecord } from '@/lib/queries'

type Props = {
  initialChallenges: ChallengeRecord[]
}

type FormState = {
  titulo: string
  descricao: string
  progresso_padrao: string
  semana_referencia: string
}

const defaultForm: FormState = {
  titulo: '',
  descricao: '',
  progresso_padrao: '0',
  semana_referencia: '',
}

export function ChallengeAdminPanel({ initialChallenges }: Props) {
  const [challenges, setChallenges] = useState(initialChallenges)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setFeedback(null)

    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || null,
      progresso_padrao: Number(form.progresso_padrao) || 0,
      semana_referencia: form.semana_referencia
        ? new Date(form.semana_referencia).toISOString().slice(0, 10)
        : null,
    }

    const response = await fetch('/api/admin/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const { error } = await response.json()
      setFeedback(error || 'Erro ao criar desafio.')
      setLoading(false)
      return
    }

    setFeedback('Desafio criado com sucesso!')
    setForm(defaultForm)
    setLoading(false)

    const refresh = await fetch('/api/admin/challenges?list=1')
    if (refresh.ok) {
      const { data } = await refresh.json()
      setChallenges(data ?? [])
    }
  }

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/admin/challenges?id=${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setFeedback('Não foi possível excluir o desafio.')
      return
    }
    setChallenges((prev) => prev.filter((desafio) => desafio.id !== id))
    setFeedback('Desafio removido.')
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-white/10 bg-[#1e293b] p-6 shadow-lg"
      >
        <div>
          <h3 className="text-lg font-semibold text-white">Novo desafio</h3>
          <p className="text-sm text-slate-400">
            Crie desafios semanais para engajar a comunidade.
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

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Descrição</span>
            <textarea
              value={form.descricao}
              onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Progresso padrão (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={form.progresso_padrao}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, progresso_padrao: event.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Semana referência</span>
            <input
              type="date"
              value={form.semana_referencia}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, semana_referencia: event.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-sm text-white"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Salvando...' : 'Criar desafio'}
        </button>

        {feedback && <p className="text-center text-xs text-slate-400">{feedback}</p>}
      </form>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Desafios cadastrados</h3>
        {challenges.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum desafio cadastrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {challenges.map((desafio) => (
              <div
                key={desafio.id}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#1e293b] p-5 shadow-lg md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h4 className="text-base font-semibold text-white">{desafio.titulo}</h4>
                  <p className="text-xs text-slate-400">
                    Progresso padrão: {desafio.progresso_padrao ?? 0}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(desafio.id)}
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

