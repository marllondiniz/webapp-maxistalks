import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('event_id')

  if (!eventId) {
    return NextResponse.json({ error: 'event_id é obrigatório.' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('event_gallery')
    .select('*')
    .eq('event_id', eventId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao listar galeria:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabaseAdmin = getSupabaseAdmin()

    const payload = {
      event_id: body.event_id,
      image_url: body.image_url,
      image_path: body.image_path,
      ordem: body.ordem ?? 0,
    }

    const { data, error } = await supabaseAdmin
      .from('event_gallery')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao adicionar foto na galeria:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro inesperado:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID da foto é obrigatório.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin.from('event_gallery').delete().eq('id', id)

    if (error) {
      console.error('Erro ao excluir foto:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro inesperado ao excluir foto:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
