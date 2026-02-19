import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfig, getBrandLogoUrl, getBrandConfigFromRequest } from '@/lib/brand'

const DEFAULT_SEGMENT_ID = '6ed286d1-f405-4419-87f4-1e8c5bc7a5bf'

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY não configurada.' },
        { status: 500 }
      )
    }

    const { articleId } = await request.json()

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId é obrigatório.' },
        { status: 400 }
      )
    }

    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabaseAdmin = getSupabaseAdmin()

    let query = supabaseAdmin.from('articles').select('*').eq('id', articleId)
    if (tenantId) query = query.eq('tenant_id', tenantId)
    const { data: article, error: articleError } = await query.maybeSingle()

    if (articleError || !article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado.' },
        { status: 404 }
      )
    }

    const host = request.headers.get('host') ?? undefined
    const brand = await getBrandConfig(host)
    const logoUrl = getBrandLogoUrl(brand)
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      `${brand.name} <no-reply@${new URL(brand.baseUrl).hostname}>`

    const segmentId =
      process.env.RESEND_SEGMENT_ID || DEFAULT_SEGMENT_ID

    const articleUrl = `${brand.baseUrl.replace(/\/$/, '')}/blog/${article.id}`

    const icone = article.icone ? `${article.icone} ` : ''
    const resumo = article.resumo
      ? `<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">${article.icone ? article.icone + ' ' : ''}${article.resumo}</p>`
      : ''

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${article.titulo}</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

            <!-- Logo -->
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="${logoUrl}" alt="${brand.name}" style="max-width:180px;height:auto;border-radius:10px;" />
              </td>
            </tr>

            <!-- Card principal -->
            <tr>
              <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

                ${article.image_url ? `
                <div>
                  <img src="${article.image_url}" alt="${article.titulo}" style="width:100%;max-height:280px;object-fit:cover;display:block;" />
                </div>` : ''}

                <div style="padding:32px;">
                  ${article.categoria ? `<p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#3b82f6;">${article.categoria}</p>` : ''}

                  <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;line-height:1.3;color:#0f172a;">
                    ${icone}${article.titulo}
                  </h1>

                  ${resumo}

                  <a href="${articleUrl}"
                     style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;letter-spacing:0.03em;">
                    Ler conteúdo completo →
                  </a>
                </div>
              </td>
            </tr>

            <!-- Rodapé -->
            <tr>
              <td style="padding:24px 0 0;text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">
                  Você recebeu este e-mail porque se inscreveu na newsletter do <strong>${brand.name}</strong>.
                </p>
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#94a3b8;text-decoration:underline;">
                    Cancelar inscrição
                  </a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

    const resend = new Resend(process.env.RESEND_API_KEY)

    // send: true é suportado pela API; tipos do SDK podem não incluir essa propriedade
    const broadcastPayload = {
      segmentId,
      from: fromEmail,
      subject: `${icone}${article.titulo}`,
      html,
      name: `[Post] ${article.titulo}`,
      send: true,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data, error } = await resend.broadcasts.create(broadcastPayload as any)

    if (error) {
      console.error('Erro ao criar broadcast no Resend:', error)
      const msg =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao enviar newsletter. Verifique o Resend.'
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json({ success: true, broadcastId: data?.id })
  } catch (err) {
    console.error('Erro inesperado ao enviar broadcast:', err)
    const message = err instanceof Error ? err.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
