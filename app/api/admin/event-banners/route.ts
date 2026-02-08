import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const list = searchParams.get('list')

  if (list === '1') {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('event_banners')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao listar banners:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  }

  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabaseAdmin = getSupabaseAdmin()

    const payload = {
      titulo: body.titulo ?? null,
      subtitulo: body.subtitulo ?? null,
      event_id: body.event_id ?? null,
      image_url: body.image_url,
      image_path: body.image_path,
      is_active: Boolean(body.is_active),
      palestrante_instagram: body.palestrante_instagram ?? null,
      palestrante_descricao: body.palestrante_descricao ?? null,
    }

    const { data, error } = await supabaseAdmin
      .from('event_banners')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao criar banner:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro inesperado ao criar banner:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, activate, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do banner é obrigatório.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    if (activate) {
      // Buscar o event_id do banner que está sendo ativado
      const { data: bannerData } = await supabaseAdmin
        .from('event_banners')
        .select('event_id')
        .eq('id', id)
        .single()

      // Se o banner tiver um evento associado, desativar outros banners desse mesmo evento
      if (bannerData?.event_id) {
        const { error: deactivateError } = await supabaseAdmin
          .from('event_banners')
          .update({ is_active: false })
          .eq('event_id', bannerData.event_id)
          .neq('id', id)

        if (deactivateError) {
          console.error('Erro ao desativar banners do evento:', deactivateError)
          return NextResponse.json({ error: deactivateError.message }, { status: 400 })
        }
      }
      rest.is_active = true
    }

    const { data, error } = await supabaseAdmin
      .from('event_banners')
      .update(rest)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao atualizar banner:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro inesperado ao atualizar banner:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do banner é obrigatório.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin.from('event_banners').delete().eq('id', id)

    if (error) {
      console.error('Erro ao excluir banner:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro inesperado ao excluir banner:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

