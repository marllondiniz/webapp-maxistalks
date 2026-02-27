type QuizData = any

type SaveResult = {
  success: boolean
  message: string
  details?: unknown
}

/**
 * Stub de integração com Google Sheets.
 *
 * Em produção, substitua esta implementação por uma que:
 * - use credenciais de serviço (Service Account) do Google;
 * - grave os dados em uma planilha específica;
 * - trate erros de autenticação e quota.
 */
export async function saveQuizToGoogleSheets(data: QuizData): Promise<SaveResult> {
  if (!data) {
    return {
      success: false,
      message: 'Nenhum dado de quiz fornecido para salvar no Google Sheets.',
    }
  }

  // Integração real ainda não configurada nesta instância.
  // Apenas registra no log para análise futura.
  console.log('[GoogleSheets] Chamada recebida para salvar quiz.', {
    hasNome: Boolean((data as any)?.nome),
    hasTimestamp: Boolean((data as any)?.timestamp),
  })

  return {
    success: false,
    message: 'Integração com Google Sheets não configurada.',
  }
}

