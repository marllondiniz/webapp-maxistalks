import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const AUDIENCE_ID =
  process.env.MAXISTALKS_AUDIENCE_ID ||
  process.env.RESEND_AUDIENCE_ID ||
  '6ed286d1-f405-4419-87f4-1e8c5bc7a5bf'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY não configurada')
      return NextResponse.json(
        {
          error:
            'Configuração do servidor incompleta. Entre em contato com o suporte.',
        },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    try {
      await resend.contacts.create({
        email,
        audienceId: AUDIENCE_ID,
      })
    } catch (contactError: unknown) {
      const err = contactError as { message?: string }
      if (
        err?.message?.includes('already exists') ||
        err?.message?.includes('duplicate')
      ) {
        // Contato já existe
      } else {
        console.error('Erro ao adicionar contato:', contactError)
      }
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL || 'MaxisPlus <no-reply@maxis.plus>'
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://maxis.plus'
    const imageUrl = `${baseUrl}/maxistalks-joao4.jpeg`

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Você está na lista de espera do MaxisTalks! 🎤',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de espera MaxisTalks</title>
          </head>
          <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="${imageUrl}" alt="MaxisTalks" style="max-width: 100%; height: auto; border-radius: 12px;" />
            </div>
            <div style="background: #fafafa; padding: 30px; border-radius: 12px;">
              <h2 style="color: #0a0a0b; margin-top: 0;">Você está na lista! 🎉</h2>
              <p>Olá!</p>
              <p>Obrigado por se inscrever na lista de espera do <strong>MaxisTalks</strong>.</p>
              <p>Você será avisado em primeira mão quando abrirmos as próximas edições.</p>
              <p style="margin-top: 30px;">Até breve!<br><strong>Equipe MaxisPlus</strong></p>
            </div>
          </body>
        </html>
      `,
    })

    return NextResponse.json(
      { success: true, message: 'Inscrição realizada com sucesso!' },
      { status: 200 }
    )
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('Erro na API MaxisTalks waitlist:', error)
    return NextResponse.json(
      {
        error:
          err?.message || 'Erro ao processar solicitação. Tente novamente.',
      },
      { status: 500 }
    )
  }
}
