import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { Resend } from 'resend'
import { saveQuizToGoogleSheets } from '@/lib/googleSheets'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { answers, formData, termoData, hasYesAnswer, runningData } = data

    // Determinar qual conjunto de dados usar
    const userData = hasYesAnswer ? termoData : formData

    // Validar dados obrigatórios
    if (!userData?.nome || !userData?.data || !userData?.assinatura) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString()
    const normalizedRunningData = {
      runsFrequently: runningData?.runsFrequently || '',
      weeklyFrequency: runningData?.weeklyFrequency || '',
      runningExperience: runningData?.runningExperience || '',
      longestDistance: runningData?.longestDistance || '',
      hasRunningInjury: runningData?.hasRunningInjury || '',
      injuryDetails: runningData?.injuryDetails || '',
    }
    const quizData = {
      timestamp,
      nome: userData.nome,
      idade: userData.idade || '',
      data: userData.data,
      assinatura: userData.assinatura,
      answers,
      hasYesAnswer,
      termoAssinado: hasYesAnswer ? true : false,
      running: normalizedRunningData,
    }

    // 1. Salvar em arquivo JSON (backup local)
    try {
      const isProduction = process.env.NODE_ENV === 'production'
      const dataDir = isProduction ? join('/tmp', 'data') : join(process.cwd(), 'data')
      if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true })
      }

      const filename = `quiz-${Date.now()}-${userData.nome.replace(/\s+/g, '-').toLowerCase()}.json`
      const filepath = join(dataDir, filename)
      
      await writeFile(filepath, JSON.stringify(quizData, null, 2), 'utf-8')
      console.log(`Quiz salvo em: ${filepath}`)
    } catch (fileError) {
      console.error('Erro ao salvar arquivo:', fileError)
      // Continuar mesmo se falhar ao salvar arquivo
    }

    // 2. Salvar no Google Sheets (se configurado)
    let sheetsResult
    try {
      sheetsResult = await saveQuizToGoogleSheets(quizData)
      if (!sheetsResult.success) {
        console.error('Erro ao salvar no Google Sheets:', sheetsResult.message, sheetsResult.details)
      } else {
        console.log('✅ Dados salvos no Google Sheets com sucesso')
      }
    } catch (sheetsError) {
      console.error('Erro ao salvar no Google Sheets:', sheetsError)
      // Continuar mesmo se falhar
    }

    // 3. Enviar email via Resend (se configurado)
    if (process.env.RESEND_API_KEY && process.env.RESEND_NOTIFICATION_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'Maxis Talks <no-reply@ritmocertoclub.com.br>'
        
        // Formatar respostas para o email
        const answersText = Object.entries(answers)
          .map(([key, value]) => {
            const questions = [
              'Algum médico já disse que você possui algum problema de coração?',
              'Você sente dores no peito quando pratica atividade física?',
              'No último mês, você sentiu dores no peito quando praticou atividade física?',
              'Você apresenta desequilíbrio devido à tontura e/ou perda de consciência?',
              'Você possui algum problema ósseo ou articular?',
              'Você toma atualmente algum medicamento para pressão arterial e/ou problema de coração?',
              'Sabe de alguma outra razão pela qual você não deve praticar atividade física?'
            ]
            return `Pergunta ${key}: ${questions[parseInt(key) - 1]} - ${value === 'sim' ? 'SIM' : 'NÃO'}`
          })
          .join('<br>')

        const formatYesNo = (value: string) => {
          if (value === 'sim') return 'Sim'
          if (value === 'nao') return 'Não'
          return value || 'Não informado'
        }

        const runningDetailsHtml = `
          <h3>Corrida e Performance</h3>
          <p><strong>Corre com frequência:</strong> ${formatYesNo(normalizedRunningData.runsFrequently)}</p>
          <p><strong>Frequência semanal:</strong> ${normalizedRunningData.weeklyFrequency || 'Não informado'}</p>
          <p><strong>Tempo de prática:</strong> ${normalizedRunningData.runningExperience || 'Não informado'}</p>
          <p><strong>Maior distância:</strong> ${normalizedRunningData.longestDistance || 'Não informado'}</p>
          <p><strong>Lesão relacionada à corrida:</strong> ${formatYesNo(normalizedRunningData.hasRunningInjury)}</p>
          ${
            normalizedRunningData.hasRunningInjury === 'sim'
              ? `<p><strong>Detalhes da lesão:</strong> ${normalizedRunningData.injuryDetails || 'Não informado'}</p>`
              : ''
          }
        `

        await resend.emails.send({
          from: fromEmail,
          to: process.env.RESEND_NOTIFICATION_EMAIL,
          subject: `Novo Quiz PAR-Q - ${userData.nome}`,
          html: `
            <h2>Novo Questionário PAR-Q Preenchido</h2>
            <p><strong>Nome:</strong> ${userData.nome}</p>
            <p><strong>Idade:</strong> ${userData.idade || 'Não informado'}</p>
            <p><strong>Data:</strong> ${userData.data}</p>
            <p><strong>Assinatura:</strong> ${userData.assinatura}</p>
            ${runningDetailsHtml}
            
            <h3>Respostas:</h3>
            ${answersText}
            
            ${hasYesAnswer ? `
              <h3>⚠️ ATENÇÃO: Respondeu SIM a uma ou mais perguntas</h3>
              <p><strong>Termo de Responsabilidade assinado:</strong> Sim</p>
            ` : '<p>✅ Todas as respostas foram NÃO - Apto para atividade física</p>'}
            
            <hr>
            <p><small>Enviado em: ${timestamp}</small></p>
          `,
        })
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError)
        // Continuar mesmo se falhar ao enviar email
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Quiz salvo com sucesso!',
        data: quizData
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao processar quiz. Tente novamente.' },
      { status: 500 }
    )
  }
}

