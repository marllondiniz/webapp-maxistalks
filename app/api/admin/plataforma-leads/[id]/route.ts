import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfigFromRequest } from '@/lib/brand'
import { createClient } from '@supabase/supabase-js'
import { isPlataformaSalesEnabled } from '@/lib/plataformaSales'

export const dynamic = 'force-dynamic'

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

async function checkAdmin(request: NextRequest): Promise<string | null> {
  const token = getBearerToken(request)
  if (!token) return null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  return profile?.is_admin ? user.id : null
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isPlataformaSalesEnabled()) {
      return NextResponse.json({ error: 'Funcionalidade indisponível neste ambiente' }, { status: 403 })
    }
    const userId = await checkAdmin(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'ID do lead é obrigatório' }, { status: 400 })
    }

    const body = await request.json()
    const atendido = typeof body.atendido === 'boolean' ? body.atendido : null
    if (atendido === null) {
      return NextResponse.json({ error: 'atendido (boolean) é obrigatório' }, { status: 400 })
    }

    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabase = getSupabaseAdmin()
    let query = supabase
      .from('plataforma_leads')
      .update({ atendido })
      .eq('id', id)

    if (tenantId) {
      query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
    }

    const { data, error } = await query.select().maybeSingle()

    if (error) {
      console.error('Erro ao atualizar lead:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, lead: data })
  } catch (e) {
    console.error('Erro PATCH plataforma-leads:', e)
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 })
  }
}
