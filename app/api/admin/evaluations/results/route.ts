import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfigFromRequest } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId é obrigatório.' }, { status: 400 })
    }

    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabaseAdmin = getSupabaseAdmin()

    let query = supabaseAdmin
      .from('event_evaluations')
      .select('*')
      .eq('event_id', eventId)
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false })

    if (tenantId) query = query.eq('tenant_id', tenantId)

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar avaliações:', error)
      return NextResponse.json({ error: 'Erro ao buscar avaliações.' }, { status: 500 })
    }

    const { count: totalSent } = await supabaseAdmin
      .from('event_evaluation_sent')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    const evaluations = data ?? []
    const totalResponses = evaluations.length

    const userIds = [...new Set(evaluations.map((e) => e.user_id).filter(Boolean))] as string[]
    let namesByUserId: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, nome')
        .in('id', userIds)
      for (const p of profiles ?? []) {
        if (p.nome) namesByUserId[p.id] = p.nome as string
      }
    }

    const evaluationsWithRespondent = evaluations.map((e) => ({
      ...e,
      responder_nome: e.user_id ? namesByUserId[e.user_id] ?? null : null,
      responder_email: e.email ?? null,
    }))

    let avgNotaGeral = 0
    let avgNotaAmbiente = 0
    let avgNotaRecomendacao = 0

    if (totalResponses > 0) {
      avgNotaGeral =
        evaluations.reduce((sum, e) => sum + (e.nota_geral ?? 0), 0) / totalResponses
      avgNotaAmbiente =
        evaluations.reduce((sum, e) => sum + (e.nota_ambiente ?? 0), 0) / totalResponses
      avgNotaRecomendacao =
        evaluations.reduce((sum, e) => sum + (e.nota_recomendacao ?? 0), 0) / totalResponses
    }

    const organizacao: Record<string, number> = {}
    const conteudoAplicavel: Record<string, number> = {}
    const nivelConvidados: Record<string, number> = {}
    const conexoes: Record<string, number> = {}
    const tempoEvento: Record<string, number> = {}

    for (const e of evaluations) {
      if (e.organizacao) organizacao[e.organizacao] = (organizacao[e.organizacao] || 0) + 1
      if (e.conteudo_aplicavel)
        conteudoAplicavel[e.conteudo_aplicavel] = (conteudoAplicavel[e.conteudo_aplicavel] || 0) + 1
      if (e.nivel_convidados)
        nivelConvidados[e.nivel_convidados] = (nivelConvidados[e.nivel_convidados] || 0) + 1
      if (e.conexoes) conexoes[e.conexoes] = (conexoes[e.conexoes] || 0) + 1
      if (e.tempo_evento) tempoEvento[e.tempo_evento] = (tempoEvento[e.tempo_evento] || 0) + 1
    }

    const insights = evaluationsWithRespondent
      .filter((e) => e.insight_util?.trim())
      .map((e) => ({
        text: e.insight_util,
        responder_nome: e.user_id ? namesByUserId[e.user_id] ?? null : null,
        responder_email: e.email ?? null,
      }))
    const sugestoes = evaluationsWithRespondent
      .filter((e) => e.sugestao_melhoria?.trim())
      .map((e) => ({
        text: e.sugestao_melhoria,
        responder_nome: e.user_id ? namesByUserId[e.user_id] ?? null : null,
        responder_email: e.email ?? null,
      }))

    return NextResponse.json({
      totalSent: totalSent ?? 0,
      totalResponses,
      avgNotaGeral: Math.round(avgNotaGeral * 10) / 10,
      avgNotaAmbiente: Math.round(avgNotaAmbiente * 10) / 10,
      avgNotaRecomendacao: Math.round(avgNotaRecomendacao * 10) / 10,
      organizacao,
      conteudoAplicavel,
      nivelConvidados,
      conexoes,
      tempoEvento,
      insights,
      sugestoes,
      evaluations: evaluationsWithRespondent,
    })
  } catch (err) {
    console.error('Erro inesperado ao buscar resultados:', err)
    const message = err instanceof Error ? err.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
