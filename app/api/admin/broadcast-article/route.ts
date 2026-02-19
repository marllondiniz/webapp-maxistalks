import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfig, getBrandLogoUrl, getBrandConfigFromRequest } from '@/lib/brand'

const DEFAULT_SEGMENT_ID = '6ed286d1-f405-4419-87f4-1e8c5bc7a5bf'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/\n/g, ' ')
}

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

    const { data: galleryData } = await supabaseAdmin
      .from('article_gallery')
      .select('image_url, ordem')
      .eq('article_id', articleId)
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: true })

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
      ? `<p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">${article.icone ? article.icone + ' ' : ''}${escapeHtml(article.resumo)}</p>`
      : ''

    // Extrair preview do conteúdo (primeiras ~200 palavras ou 500 chars)
    const stripHtmlTags = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const contentPreview = article.conteudo
      ? (() => {
          const plainText = stripHtmlTags(article.conteudo)
          const truncated = plainText.length > 500 ? plainText.slice(0, 500) + '...' : plainText
          return `
            <div style="margin:24px 0;padding:20px;background:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px;">
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.8;font-style:italic;">
                "${escapeHtml(truncated)}"
              </p>
            </div>`
        })()
      : ''

    const gallery = galleryData ?? []
    const galleryPhotos = gallery.slice(0, 6)
    const galleryRows: string[] = []
    for (let i = 0; i < galleryPhotos.length; i += 3) {
      const row = galleryPhotos.slice(i, i + 3)
      galleryRows.push(
        `<tr>${row
          .map(
            (p: { image_url: string }) =>
              `<td style="padding:6px;width:33.33%;vertical-align:top;">
                <a href="${articleUrl}" style="display:block;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);transition:transform 0.2s;">
                  <img src="${p.image_url}" alt="" width="100%" style="display:block;height:130px;object-fit:cover;" />
                </a>
              </td>`
          )
          .join('')}</tr>`
      )
    }
    const galleryHtml =
      gallery.length > 0
        ? `
            <div style="margin:32px 0;padding:24px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
              <h2 style="margin:0 0 6px;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#3b82f6;">📸 Como foi o evento</h2>
              <p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.6;">Veja um pouquinho de como foi. No site tem o álbum completo!</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${galleryRows.join('')}</table>
            </div>`
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
                  ${contentPreview}
                  ${galleryHtml}

                  <div style="text-align:center;margin-top:32px;">
                    <a href="${articleUrl}"
                       style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:0.02em;box-shadow:0 4px 12px rgba(59,130,246,0.3);">
                      Ler conteúdo completo →
                    </a>
                  </div>
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
                  Para cancelar a inscrição, acesse as configurações da sua conta no site.
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

    // Listar contatos do segmento (usa o mesmo caminho que e-mails transacionais, que já funcionam)
    const allContacts: { email: string; unsubscribed?: boolean }[] = []
    let cursor: string | undefined
    do {
      const listOptions: { audienceId: string; limit?: number; after?: string } = {
        audienceId: segmentId,
        limit: 100,
      }
      if (cursor) listOptions.after = cursor
      const listRes = await resend.contacts.list(listOptions)
      if (listRes.error) {
        console.error('Erro ao listar contatos no Resend:', listRes.error)
        return NextResponse.json(
          { error: 'Erro ao listar contatos da newsletter. Verifique o Resend.' },
          { status: 500 }
        )
      }
      const data = listRes.data?.data ?? []
      allContacts.push(...data.map((c) => ({ email: c.email, unsubscribed: c.unsubscribed })))
      cursor = listRes.data?.has_more ? data[data.length - 1]?.id : undefined
    } while (cursor)

    const toSend = allContacts.filter((c) => !c.unsubscribed)
    if (toSend.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum contato ativo no segmento. Adicione contatos no Resend.' },
        { status: 400 }
      )
    }

    const subject = `${icone}${article.titulo}`

    let sent = 0
    let lastError: string | null = null
    for (const contact of toSend) {
      const { error: sendErr } = await resend.emails.send({
        from: fromEmail,
        to: contact.email,
        subject,
        html,
      })
      if (sendErr) {
        console.error('Erro ao enviar para', contact.email, sendErr)
        lastError = typeof sendErr === 'object' && sendErr !== null && 'message' in sendErr
          ? String((sendErr as { message?: unknown }).message)
          : 'Erro ao enviar e-mail.'
      } else {
        sent++
      }
    }

    if (sent === 0 && lastError) {
      return NextResponse.json({ error: lastError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sent,
      total: toSend.length,
      ...(lastError && sent > 0 ? { warning: `Enviado a ${sent} de ${toSend.length}. ${lastError}` } : {}),
    })
  } catch (err) {
    console.error('Erro inesperado ao enviar broadcast:', err)
    const message = err instanceof Error ? err.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
