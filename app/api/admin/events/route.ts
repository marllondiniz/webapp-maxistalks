import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfigFromRequest } from '@/lib/brand'
import { slugify } from '@/lib/slug'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const list = searchParams.get('list')

  if (list === '1') {
    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabaseAdmin = getSupabaseAdmin()
    let query = supabaseAdmin.from('events').select('*').order('data_horario', { ascending: false })
    if (tenantId) query = query.eq('tenant_id', tenantId)
    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  }

  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug, titulo, ...rest } = body
    const normalizedSlug = slugify(slug || titulo || null)
    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabaseAdmin = getSupabaseAdmin()
    const basePayload: Record<string, unknown> = {
      ...rest,
      titulo,
    }
    if (normalizedSlug) {
      basePayload.slug = normalizedSlug
    }
    const insertPayload = tenantId ? { ...basePayload, tenant_id: tenantId } : basePayload

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao criar evento:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro inesperado ao criar evento:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, slug, titulo, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do evento é obrigatório.' }, { status: 400 })
    }

    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabaseAdmin = getSupabaseAdmin()
    const normalizedSlug = slugify(slug || titulo || null)
    const updatePayload: Record<string, unknown> = {
      ...rest,
    }
    if (titulo) {
      updatePayload.titulo = titulo
    }
    if (normalizedSlug) {
      updatePayload.slug = normalizedSlug
    }
    let updateQuery = supabaseAdmin.from('events').update(updatePayload).eq('id', id)
    if (tenantId) updateQuery = updateQuery.eq('tenant_id', tenantId)
    const { data, error } = await updateQuery.select('*').single()

    if (error) {
      console.error('Erro ao atualizar evento:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro inesperado ao atualizar evento:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do evento é obrigatório.' }, { status: 400 })
    }

    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabaseAdmin = getSupabaseAdmin()
    let deleteQuery = supabaseAdmin.from('events').delete().eq('id', id)
    if (tenantId) deleteQuery = deleteQuery.eq('tenant_id', tenantId)
    const { error } = await deleteQuery

    if (error) {
      console.error('Erro ao excluir evento:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro inesperado ao excluir evento:', error)
    const message = error instanceof Error ? error.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
