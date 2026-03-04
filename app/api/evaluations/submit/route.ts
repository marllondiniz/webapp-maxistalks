import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token obrigatório.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('event_evaluations')
      .select('id, event_id, submitted_at')
      .eq('token', token)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Avaliação não encontrada.' }, { status: 404 })
    }

    if (data.submitted_at) {
      return NextResponse.json({ error: 'already_submitted', alreadySubmitted: true }, { status: 400 })
    }

    const { data: event } = await supabaseAdmin
      .from('events')
      .select('titulo, data_horario')
      .eq('id', data.event_id)
      .maybeSingle()

    return NextResponse.json({
      evaluationId: data.id,
      eventTitle: event?.titulo ?? 'Evento',
      eventDate: event?.data_horario ?? null,
    })
  } catch (err) {
    console.error('Erro ao validar token de avaliação:', err)
    return NextResponse.json({ error: 'Erro inesperado.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, ...answers } = body as {
      token: string
      nota_geral: number
      nota_ambiente: number
      organizacao: string
      conteudo_aplicavel: string
      insight_util: string
      nivel_convidados: string
      conexoes: string
      tempo_evento: string
      nota_recomendacao: number
      sugestao_melhoria: string
    }

    if (!token) {
      return NextResponse.json({ error: 'Token obrigatório.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('event_evaluations')
      .select('id, submitted_at')
      .eq('token', token)
      .maybeSingle()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Avaliação não encontrada.' }, { status: 404 })
    }

    if (existing.submitted_at) {
      return NextResponse.json({ error: 'Avaliação já foi enviada.' }, { status: 400 })
    }

    const { error: updateErr } = await supabaseAdmin
      .from('event_evaluations')
      .update({
        nota_geral: answers.nota_geral,
        nota_ambiente: answers.nota_ambiente,
        organizacao: answers.organizacao,
        conteudo_aplicavel: answers.conteudo_aplicavel,
        insight_util: answers.insight_util || null,
        nivel_convidados: answers.nivel_convidados,
        conexoes: answers.conexoes,
        tempo_evento: answers.tempo_evento,
        nota_recomendacao: answers.nota_recomendacao,
        sugestao_melhoria: answers.sugestao_melhoria || null,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (updateErr) {
      console.error('Erro ao salvar avaliação:', updateErr)
      return NextResponse.json({ error: 'Erro ao salvar avaliação.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro inesperado ao submeter avaliação:', err)
    return NextResponse.json({ error: 'Erro inesperado.' }, { status: 500 })
  }
}
