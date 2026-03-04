'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Ticket, Mic, Sparkles, PartyPopper, type LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  ticket: Ticket,
  mic: Mic,
  sparkles: Sparkles,
  partyPopper: PartyPopper,
}

export type DestaqueCard = {
  id: string
  titulo: string
  descricao: string
  icone: keyof typeof ICON_MAP
  status: 'ativo' | 'expirado'
  ctaLabel: string
  ctaType: 'copy' | 'link'
  href?: string
  code?: string
}

type HighlightCardListProps = {
  cards: DestaqueCard[]
}

export function HighlightCardList({ cards }: HighlightCardListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (card: DestaqueCard) => {
    if (!card.code) return
    try {
      await navigator.clipboard.writeText(card.code)
      setCopiedId(card.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar cupom:', error)
    }
  }

  const normalizedCards = useMemo(() => cards, [cards])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {normalizedCards.map((card) => {
        const isActive = card.status === 'ativo'
        const statusLabel = isActive ? 'Ativo' : 'Expirado'
        const baseClass =
          'flex h-full flex-col justify-between rounded-xl border border-slate-600/30 bg-[var(--brand-surface)]/80 p-5 shadow-lg transition-transform hover:border-slate-500/40 hover:-translate-y-1'

        const statusStyles = isActive
          ? 'border-emerald-400/20 text-emerald-300 bg-emerald-500/10'
          : 'border-[#ff7070]/20 text-[#ff8686] bg-red-500/10'

        const disabledCta = !isActive || (card.ctaType === 'copy' && !card.code)

        const Content = (
          <>
            <div className="flex flex-1 items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700/50 text-[#f5f5f5]">
                {(() => {
                  const Icon = ICON_MAP[card.icone]
                  return Icon ? <Icon className="h-6 w-6" /> : null
                })()}
              </span>
              <div className="flex flex-1 flex-col space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold uppercase tracking-wide text-[#f5f5f5]">
                    {card.titulo}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyles}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="text-sm text-[#c9c9d2]">{card.descricao}</p>
                {card.ctaType === 'copy' && card.code && (
                  <p className="text-xs text-[#9a9aa2]">Código: {card.code}</p>
                )}
              </div>
            </div>

            <div className="pt-5">
              {card.ctaType === 'copy' ? (
                <button
                  type="button"
                  onClick={() => handleCopy(card)}
                  disabled={disabledCta}
                  className={`w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                    disabledCta
                      ? 'cursor-not-allowed border border-slate-600/40 bg-[var(--brand-surface)] text-[#5f5f66] opacity-60'
                      : 'bg-[#f5f5f5] text-[#0f0f10] hover:brightness-95'
                  }`}
                >
                  {copiedId === card.id ? 'Copiado!' : card.ctaLabel}
                </button>
              ) : card.href ? (
                <Link
                  href={card.href}
                  className={`inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                    disabledCta
                      ? 'cursor-not-allowed border border-slate-600/40 bg-[var(--brand-surface)] text-[#5f5f66] opacity-60'
                      : 'bg-[#f5f5f5] text-[#0f0f10] hover:brightness-95'
                  }`}
                  aria-disabled={disabledCta}
                  tabIndex={disabledCta ? -1 : 0}
                >
                  {card.ctaLabel}
                </Link>
              ) : (
                <span className="inline-flex w-full items-center justify-center rounded-full border border-dashed border-slate-600/40 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#5f5f66]">
                  {card.ctaLabel}
                </span>
              )}
            </div>
          </>
        )

        return (
          <div key={card.id} className={baseClass}>
            {Content}
          </div>
        )
      })}
    </div>
  )
}

