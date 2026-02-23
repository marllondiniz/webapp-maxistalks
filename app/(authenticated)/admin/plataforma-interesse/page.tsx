import { unstable_noStore } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPlataformaLeads } from '@/lib/queries'
import { getTenantIdForRequest } from '@/lib/brand'
import { getTranslations } from 'next-intl/server'
import { normalizePhoneForWhatsApp } from '@/lib/phone'
import { MessageCircle, Mail, Calendar, ExternalLink, Building2, MessageSquare } from 'lucide-react'
import { LeadAtendidoCell } from './LeadAtendidoCell'
import { isPlataformaSalesEnabled } from '@/lib/plataformaSales'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  starter: { label: 'Starter', color: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
  pro: { label: 'Pro', color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  enterprise: { label: 'Enterprise', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  general: { label: 'Só quero conhecer', color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
}

function PlanBadge({ plano }: { plano: string | null }) {
  if (!plano) return <span className="text-slate-600">—</span>
  const cfg = PLAN_LABELS[plano]
  if (!cfg) return <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400">{plano}</span>
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export default async function AdminPlataformaInteressePage() {
  unstable_noStore()
  if (!isPlataformaSalesEnabled()) {
    redirect('/admin')
  }
  const t = await getTranslations('AdminPlataformaLeads')
  const tenantId = await getTenantIdForRequest()
  const leads = await getPlataformaLeads(tenantId)

  const total = leads.length
  const pendentes = leads.filter((l) => !l.atendido).length
  const atendidos = leads.filter((l) => l.atendido).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{t('title')}</h1>
            <p className="text-sm text-slate-400">{t('subtitle')}</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('statTotal'), value: total, color: 'text-white' },
          { label: t('statPending'), value: pendentes, color: 'text-amber-400' },
          { label: t('statAttended'), value: atendidos, color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-[#1e293b] p-5">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      {leads.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#1e293b] py-20 text-center">
          <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-600" />
          <p className="text-slate-400">{t('empty')}</p>
          <Link
            href="/plataforma"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--brand-primary)] hover:underline"
          >
            {t('viewForm')}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`rounded-2xl border bg-[#1e293b] p-5 transition ${
                lead.atendido
                  ? 'border-emerald-500/20 opacity-70'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Left: info principal */}
                <div className="flex flex-col gap-3 min-w-0">
                  {/* Nome + plano + data */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-white">{lead.nome}</span>
                    <PlanBadge plano={lead.plano_interesse} />
                    <span className="ml-auto flex items-center gap-1 text-xs text-slate-500 md:hidden">
                      <Calendar className="h-3 w-3" />
                      {formatDate(lead.created_at)}
                    </span>
                  </div>

                  {/* Contatos */}
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <Mail className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                      {lead.email}
                    </a>

                    {lead.telefone ? (
                      <a
                        href={`https://wa.me/${normalizePhoneForWhatsApp(lead.telefone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20"
                      >
                        <MessageCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {lead.telefone}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-600">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {t('noPhone')}
                      </span>
                    )}

                    {lead.empresa && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
                        {lead.empresa}
                      </span>
                    )}
                  </div>

                  {/* Mensagem */}
                  {lead.mensagem && (
                    <p className="max-w-xl rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm leading-relaxed text-slate-400">
                      &ldquo;{lead.mensagem}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right: status + data */}
                <div className="flex flex-row items-center justify-between gap-3 md:flex-col md:items-end md:justify-start">
                  <LeadAtendidoCell leadId={lead.id} atendido={lead.atendido} />
                  <span className="hidden items-center gap-1 text-xs text-slate-500 md:flex">
                    <Calendar className="h-3 w-3" />
                    {formatDate(lead.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
