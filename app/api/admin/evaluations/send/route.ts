import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getBrandConfig, getBrandLogoUrl, getBrandConfigFromRequest } from '@/lib/brand'

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
      return NextResponse.json({ error: 'RESEND_API_KEY não configurada.' }, { status: 500 })
    }

    const body = await request.json()
    const { eventId, testEmail } = body as { eventId?: string; testEmail?: string }

    if (!eventId) {
      return NextResponse.json({ error: 'eventId é obrigatório.' }, { status: 400 })
    }

    const isTestSend = Boolean(testEmail?.trim())
    const { tenantId } = await getBrandConfigFromRequest(request)
    const supabaseAdmin = getSupabaseAdmin()

    let query = supabaseAdmin.from('events').select('*').eq('id', eventId)
    if (tenantId) query = query.eq('tenant_id', tenantId)
    const { data: event, error: eventError } = await query.maybeSingle()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
    }

    const host = request.headers.get('host') ?? undefined
    const brand = await getBrandConfig(host)
    const logoUrl = getBrandLogoUrl(brand)
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      `${brand.name} <no-reply@${new URL(brand.baseUrl).hostname}>`
    const baseUrl = brand.baseUrl.replace(/\/$/, '')

    let tokenRows: { event_id: string; user_id: string | null; email: string; token: string; nome: string }[] = []
    let alreadySentSet = new Set<string>()

    if (isTestSend) {
      const token = randomBytes(32).toString('hex')
      tokenRows = [{
        event_id: eventId,
        user_id: null,
        email: testEmail!.trim(),
        token,
        nome: 'Teste',
      }]

      const evalInsertRows = [{
        event_id: eventId,
        user_id: null,
        email: testEmail!.trim(),
        token,
        tenant_id: tenantId || null,
      }]
      const { error: insertError } = await supabaseAdmin
        .from('event_evaluations')
        .insert(evalInsertRows)

      if (insertError) {
        console.error('Erro ao criar avaliação de teste:', insertError)
        return NextResponse.json({ error: 'Erro ao criar registro de avaliação de teste.' }, { status: 500 })
      }
    } else {
      const { data: regs, error: regsError } = await supabaseAdmin
        .from('event_registrations')
        .select('user_id')
        .eq('event_id', eventId)
        .not('convite_enviado_em', 'is', null)

      if (regsError || !regs || regs.length === 0) {
        return NextResponse.json(
          { error: 'Nenhum convidado com convite enviado para este evento.' },
          { status: 400 }
        )
      }

      const userIds = regs.map((r) => r.user_id)

      let profilesQuery = supabaseAdmin
        .from('profiles')
        .select('id, email, nome')
        .not('email', 'is', null)
        .in('id', userIds)
      if (tenantId) profilesQuery = profilesQuery.eq('tenant_id', tenantId)
      const { data: profiles } = await profilesQuery

      if (!profiles || profiles.length === 0) {
        return NextResponse.json(
          { error: 'Nenhum convidado com e-mail encontrado.' },
          { status: 400 }
        )
      }

      const { data: alreadySentRows } = await supabaseAdmin
        .from('event_evaluation_sent')
        .select('user_id')
        .eq('event_id', eventId)

      alreadySentSet = new Set((alreadySentRows ?? []).map((r) => r.user_id))
      const toSend = profiles.filter((p) => !alreadySentSet.has(p.id))

      if (toSend.length === 0) {
        return NextResponse.json({
          success: true,
          sent: 0,
          total: profiles.length,
          message: 'Todos os convidados já receberam a avaliação.',
        })
      }

      for (const p of toSend) {
        const token = randomBytes(32).toString('hex')
        tokenRows.push({
          event_id: eventId,
          user_id: p.id,
          email: p.email as string,
          token,
          nome: (p.nome as string) || '',
        })
      }

      const evalInsertRows = tokenRows.map((r) => ({
        event_id: r.event_id,
        user_id: r.user_id,
        email: r.email,
        token: r.token,
        tenant_id: tenantId || null,
      }))
      const { error: insertError } = await supabaseAdmin
        .from('event_evaluations')
        .insert(evalInsertRows)

      if (insertError) {
        console.error('Erro ao criar avaliações:', insertError)
        return NextResponse.json({ error: 'Erro ao criar registros de avaliação.' }, { status: 500 })
      }
    }

    const eventDate = new Date(event.data_horario)
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    function buildEmailHtml(nome: string, evalToken: string): string {
      const evalLink = `${baseUrl}/avaliar/${evalToken}`
      const firstName = nome.split(' ')[0] || 'Convidado'

      return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Avaliação — ${escapeHtml(event.titulo)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="${logoUrl}" alt="${brand.name}" style="max-width:180px;height:auto;border-radius:10px;" />
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                <div style="padding:32px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#3b82f6;">Avaliação do Evento</p>
                  <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;line-height:1.3;color:#0f172a;">
                    ${escapeHtml(event.titulo)}
                  </h1>
                  <p style="margin:0 0 8px;font-size:14px;color:#334155;">
                    Olá, <strong>${escapeHtml(firstName)}</strong>! 👋
                  </p>
                  <p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.6;">
                    Agradecemos sua participação no evento do dia <strong>${formattedDate}</strong>. Sua opinião é muito importante para nós — leva menos de 2 minutos!
                  </p>
                  <div style="text-align:center;margin-top:32px;">
                    <a href="${evalLink}"
                       style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:0.02em;box-shadow:0 4px 12px rgba(59,130,246,0.3);">
                      Avaliar evento →
                    </a>
                  </div>
                  <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
                    Se o botão não funcionar, copie e cole este link no navegador:<br />
                    <a href="${evalLink}" style="color:#3b82f6;word-break:break-all;">${evalLink}</a>
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 0 0;text-align:center;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  Você recebeu este e-mail porque participou de um evento do <strong>${brand.name}</strong>.
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
    const subject = `📋 Avalie o evento: ${event.titulo}`

    const BATCH_SIZE = 100
    const batches: typeof tokenRows[] = []
    for (let i = 0; i < tokenRows.length; i += BATCH_SIZE) {
      batches.push(tokenRows.slice(i, i + BATCH_SIZE))
    }

    let sent = 0
    let lastError: string | null = null

    for (let b = 0; b < batches.length; b++) {
      const batch = batches[b]
      const payload = batch.map((row) => ({
        from: fromEmail,
        to: row.email,
        subject,
        html: buildEmailHtml(row.nome, row.token),
      }))

      const maxRetries = 4
      let retryDelay = 1000
      const timeWindow = Math.floor(Date.now() / 60000)
      const idempotencyKey = `eval-send-${eventId}-${timeWindow}-${b}`

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const { data: batchData, error: batchErr } = await resend.batch.send(payload, {
          batchValidation: 'permissive',
          idempotencyKey,
        })

        const statusCode =
          batchErr && typeof batchErr === 'object' && 'statusCode' in batchErr
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
          console.error('Erro batch Resend (avaliações):', batchErr)
          lastError = msg
          break
        }

        const ids = batchData?.data ?? []
        sent += ids.length
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
      const sentInsertRows = tokenRows
        .filter((r) => r.user_id)
        .map((r) => ({
          event_id: eventId,
          user_id: r.user_id!,
          email: r.email,
        }))
      if (sentInsertRows.length > 0) {
        await supabaseAdmin.from('event_evaluation_sent').upsert(sentInsertRows, {
          onConflict: 'event_id,user_id',
          ignoreDuplicates: true,
        })
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      total: tokenRows.length,
      alreadyReceived: alreadySentSet.size,
      ...(lastError && sent > 0
        ? { warning: `Enviado a ${sent} de ${tokenRows.length}. ${lastError}` }
        : {}),
    })
  } catch (err) {
    console.error('Erro inesperado ao enviar avaliações:', err)
    const message = err instanceof Error ? err.message : 'Erro inesperado.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
