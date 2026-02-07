import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * Valida se o usuário existe em auth.users (API Admin).
 * Usado após login para garantir que a conta não foi deletada.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = body?.userId as string | undefined

    if (!userId) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)

    if (error || !user) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
