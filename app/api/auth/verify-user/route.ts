import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Confirma no Auth do Supabase que o token recém-emitido ainda pertence a um usuário ativo.
 * Usa a chave anônima e o access token da sessão, sem depender da service role.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = body?.userId as string | undefined
    const header = request.headers.get('authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!userId || !token || !url || !anonKey) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const supabase = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user || user.id !== userId) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
