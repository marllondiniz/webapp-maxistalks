import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfig, getBrandLogoUrl, getBrandConfigFromRequest } from '@/lib/brand'

const DEFAULT_AUDIENCE_ID = '6ed286d1-f405-4419-87f4-1e8c5bc7a5bf'
const AUTH_LINK_TOKEN_EXPIRY_HOURS = 24

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY não configurada.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { eventId, testEmail } = body as { eventId?: string; testEmail?: string }

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId é obrigatório.' },
        { status: 400 }
      )
    }

    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabaseAdmin = getSupabaseAdmin()

    let query = supabaseAdmin.from('events').select('*').eq('id', eventId)
    if (tenantId) query = query.eq('tenant_id', tenantId)
    const { data: event, error: eventError } = await query.maybeSingle()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Evento não encontrado.' },
        { status: 404 }
      )
    }

    const { data: bannerData } = await supabaseAdmin
      .from('event_banners')
      .select('image_url, titulo, subtitulo, palestrante_instagram, palestrante_descricao')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    const banner = bannerData?.[0] ?? null

    const host = request.headers.get('host') ?? undefined
    const brand = await getBrandConfig(host)
    const logoUrl = getBrandLogoUrl(brand)
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      `${brand.name} <no-reply@${new URL(brand.baseUrl).hostname}>`

    const audienceId =
      brand.resendAudienceId ??
      process.env.RESEND_AUDIENCE_ID ??
      process.env.RESEND_SEGMENT_ID ??
      DEFAULT_AUDIENCE_ID

    const baseUrl = brand.baseUrl.replace(/\/$/, '')
    const eventIdForUrl = event.id
    const eventUrlDefault = `${baseUrl}/eventos/${eventIdForUrl}`

    const eventDate = new Date(event.data_horario)
    const tzBrazil = 'America/Sao_Paulo'
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
      timeZone: tzBrazil,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const formattedTime = eventDate.toLocaleTimeString('pt-BR', {
      timeZone: tzBrazil,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    function buildEmailHtml(eventLink: string): string {
      const bannerHtml = banner?.image_url
        ? `<div>
            <img src="${banner.image_url}" alt="${escapeHtml(event.titulo)}" style="width:100%;max-height:280px;object-fit:cover;display:block;" />
          </div>`
        : ''

      const speakerName = banner?.subtitulo
        ? `<p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#3b82f6;">${escapeHtml(banner.subtitulo)}</p>`
        : ''

      const speakerInsta = banner?.palestrante_instagram
        ? `<p style="margin:0 0 8px;font-size:12px;color:#64748b;">@${escapeHtml(banner.palestrante_instagram.replace(/^@/, ''))}</p>`
        : ''

      const theme = banner?.titulo
        ? `<div style="margin:16px 0;padding:12px 16px;background:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#64748b;">Tema</p>
            <p style="margin:4px 0 0;font-size:14px;color:#334155;font-weight:500;">${escapeHtml(banner.titulo)}</p>
          </div>`
        : ''

      return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(event.titulo)}</title>
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

                ${bannerHtml}

                <div style="padding:32px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#3b82f6;">Novo Evento</p>

                  <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;line-height:1.3;color:#0f172a;">
                    ${escapeHtml(event.titulo)}
                  </h1>

                  ${speakerName}
                  ${speakerInsta}
                  ${theme}

                  <div style="margin:20px 0;padding:16px;background:#f8fafc;border-radius:12px;">
                    <table cellpadding="0" cellspacing="0" style="width:100%;">
                      <tr>
                        <td style="padding:4px 0;">
                          <p style="margin:0;font-size:13px;color:#64748b;">📅 <strong style="color:#334155;">${formattedDate}</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <p style="margin:0;font-size:13px;color:#64748b;">🕐 <strong style="color:#334155;">${formattedTime}</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <p style="margin:0;font-size:13px;color:#64748b;">📍 <strong style="color:#334155;">${escapeHtml(event.local_nome ?? '')}</strong>${event.local_detalhe ? ` — ${escapeHtml(event.local_detalhe)}` : ''}</p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="text-align:center;margin-top:32px;">
                    <a href="${eventLink}"
                       style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:0.02em;box-shadow:0 4px 12px rgba(59,130,246,0.3);">
                      Ver detalhes e se inscrever →
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
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    let toSendNew: string[]
    let alreadySentSet = new Set<string>()
    const isTestSend = Boolean(testEmail?.trim())

    if (isTestSend) {
      toSendNew = [testEmail!.trim()]
    } else {
      const allContacts: { email: string; unsubscribed?: boolean }[] = []
      let cursor: string | undefined
      do {
        const listOptions: { audienceId: string; limit?: number; after?: string } = {
          audienceId,
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
      const uniqueEmails = Array.from(new Map(toSend.map((c) => [c.email.toLowerCase().trim(), c.email])).values())

      if (uniqueEmails.length === 0) {
        return NextResponse.json(
          { error: 'Nenhum contato ativo no segmento. Adicione contatos no Resend.' },
          { status: 400 }
        )
      }

      const { data: alreadySentRows } = await supabaseAdmin
        .from('event_newsletter_sent')
        .select('email')
        .eq('event_id', eventId)

      alreadySentSet = new Set(
        (alreadySentRows ?? []).map((r) => (r.email ?? '').toLowerCase().trim())
      )
      toSendNew = uniqueEmails.filter((email) => !alreadySentSet.has(email.toLowerCase().trim()))

      if (toSendNew.length === 0) {
        return NextResponse.json({
          success: true,
          sent: 0,
          total: uniqueEmails.length,
          message: 'Todos os contatos já receberam este evento. Nenhum envio necessário.',
        })
      }
    }

    const emailsLower = toSendNew.map((e) => e.toLowerCase().trim())
    const emailsSet = new Set(emailsLower)
    let profilesQuery = supabaseAdmin
      .from('profiles')
      .select('id, email')
      .not('email', 'is', null)
      .in('email', toSendNew)
    if (tenantId) profilesQuery = profilesQuery.eq('tenant_id', tenantId)
    const { data: profilesWithAccount } = await profilesQuery

    const emailToUserId = new Map<string, string>()
    for (const p of profilesWithAccount ?? []) {
      const em = (p.email as string)?.toLowerCase().trim()
      if (em && emailsSet.has(em)) emailToUserId.set(em, p.id)
    }

    const redirectPath = `/eventos/${eventIdForUrl}`
    const expiresAt = new Date(Date.now() + AUTH_LINK_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    const linkByEmail = new Map<string, string>()
    for (const email of toSendNew) {
      const key = email.toLowerCase().trim()
      const userId = emailToUserId.get(key)
      if (userId) {
        const token = randomBytes(32).toString('hex')
        await supabaseAdmin.from('auth_link_tokens').insert({
          token,
          user_id: userId,
          redirect_path: redirectPath,
          expires_at: expiresAt.toISOString(),
        })
        linkByEmail.set(email, `${baseUrl}/api/auth/link?token=${token}`)
      } else {
        linkByEmail.set(email, eventUrlDefault)
      }
    }

    const subject = `🎤 ${event.titulo}`

    const BATCH_SIZE = 100
    const batches: string[][] = []
    for (let i = 0; i < toSendNew.length; i += BATCH_SIZE) {
      batches.push(toSendNew.slice(i, i + BATCH_SIZE))
    }

    let sent = 0
    let lastError: string | null = null

    for (let b = 0; b < batches.length; b++) {
      const batchEmails = batches[b]
      const payload = batchEmails.map((email) => ({
        from: fromEmail,
        to: email,
        subject,
        html: buildEmailHtml(linkByEmail.get(email) ?? eventUrlDefault),
      }))

      const maxRetries = 4
      let retryDelay = 1000
      const timeWindow = Math.floor(Date.now() / 60000)
      const idempotencyKey = `event-broadcast-${eventId}-${timeWindow}-${b}`

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const { data: batchData, error: batchErr } = await resend.batch.send(payload, {
          batchValidation: 'permissive',
          idempotencyKey,
        })

        const statusCode = batchErr && typeof batchErr === 'object' && 'statusCode' in batchErr
          ? (batchErr as { statusCode?: number }).statusCode
          : null

        if (statusCode === 429 && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, retryDelay))
          retryDelay *= 2
          continue
        }

        if (batchErr) {
          const msg =
            typeof batchErr === 'object' && batchErr !== null && 'message' in batchErr
              ? String((batchErr as { message?: unknown }).message)
              : 'Erro ao enviar batch.'
          console.error('Erro batch Resend:', batchErr)
          lastError = msg
          break
        }

        const ids = batchData?.data ?? []
        sent += ids.length
        if (Array.isArray((batchData as { errors?: { index: number; message: string }[] })?.errors)) {
          const errs = (batchData as { errors: { index: number; message: string }[] }).errors
          errs.forEach((e) => console.error(`Batch índice ${e.index}:`, e.message))
        }
        break
      }

      if (b < batches.length - 1) {
        await new Promise((r) => setTimeout(r, 600))
      }
    }

    if (sent === 0 && lastError) {
      return NextResponse.json({ error: lastError }, { status: 500 })
    }

    if (sent > 0 && !isTestSend) {
      const insertRows = toSendNew.map((email) => ({
        event_id: eventId,
        email: email.toLowerCase().trim(),
      }))
      await supabaseAdmin.from('event_newsletter_sent').upsert(insertRows, {
        onConflict: 'event_id,email',
        ignoreDuplicates: true,
      })
    }

    return NextResponse.json({
      success: true,
      sent,
      total: toSendNew.length,
      alreadyReceived: alreadySentSet.size,
      ...(isTestSend && sent > 0 ? { message: `E-mail de teste enviado para ${testEmail!.trim()}.` } : {}),
      ...(lastError && sent > 0 ? { warning: `Enviado a ${sent} de ${toSendNew.length}. ${lastError}` } : {}),
    })
  } catch (err) {
    console.error('Erro inesperado ao enviar broadcast de evento:', err)
    const message = err instanceof Error ? err.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
