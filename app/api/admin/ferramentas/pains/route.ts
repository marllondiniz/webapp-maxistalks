import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfigFromRequest } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export type PainWithUser = {
  id: string
  user_id: string
  tenant_id: string | null
  dor: string
  created_at: string
  user_nome: string | null
  user_email: string | null
}

export async function GET(request: Request) {
  try {
    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('user_pains')
      .select('id, user_id, tenant_id, dor, created_at')
      .order('created_at', { ascending: false })

    if (tenantId) {
      query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
    }

    const { data: pains, error: painsError } = await query

    if (painsError) {
      console.error('Erro ao buscar dores:', painsError)
      return NextResponse.json({ error: painsError.message }, { status: 500 })
    }

    const userIds = [...new Set((pains ?? []).map((p) => p.user_id))]
    const profileMap: Record<string, { nome: string | null; email: string | null }> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, email')
        .in('id', userIds)

      for (const p of profiles ?? []) {
        profileMap[p.id] = { nome: p.nome ?? null, email: p.email ?? null }
      }
    }

    const result: PainWithUser[] = (pains ?? []).map((p) => ({
      ...p,
      user_nome: profileMap[p.user_id]?.nome ?? null,
      user_email: profileMap[p.user_id]?.email ?? null,
    }))

    return NextResponse.json({ pains: result })
  } catch (err) {
    console.error('Erro em GET /api/admin/ferramentas/pains:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
