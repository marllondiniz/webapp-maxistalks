import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfigFromRequest } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { brand, tenantId } = await getBrandConfigFromRequest(request)
    if (!brand.enablePlataformaSales) {
      return NextResponse.json(
        { error: 'Funcionalidade indisponível neste ambiente.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const nome = typeof body.nome === 'string' ? body.nome.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const telefone = typeof body.telefone === 'string' ? body.telefone.trim() || null : null
    const empresa = typeof body.empresa === 'string' ? body.empresa.trim() || null : null
    const mensagem = typeof body.mensagem === 'string' ? body.mensagem.trim() || null : null
    const planoInteresse = typeof body.plano_interesse === 'string' ? body.plano_interesse.trim() || null : null

    if (!nome || nome.length < 2) {
      return NextResponse.json(
        { error: 'Nome é obrigatório (mínimo 2 caracteres).' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório.' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'E-mail inválido.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('plataforma_leads').insert({
      tenant_id: tenantId,
      nome,
      email,
      telefone,
      empresa,
      mensagem,
      plano_interesse: planoInteresse,
    })

    if (error) {
      console.error('Erro ao salvar lead plataforma:', error)
      return NextResponse.json(
        { error: 'Erro ao enviar. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Recebemos seu interesse! Em breve entraremos em contato.' },
      { status: 200 }
    )
  } catch (e) {
    console.error('Erro na API plataforma-interesse:', e)
    return NextResponse.json(
      { error: 'Erro ao processar. Tente novamente.' },
      { status: 500 }
    )
  }
}
