'use client'

import { useEffect, useState } from 'react'

type Badge = {
  badge_id: string
  visualizado: boolean
  badge: {
    nome: string
    descricao: string
    icone: string
  }
}

type UseRitmoPointsResult = {
  saldoAtual: number
  crescimentoSemanal: number
  metaSemanal: number
  progressoSemanal: number
  streak: number
  badges: Badge[]
  loading: boolean
}

/**
 * Hook placeholder para o sistema de Ritmo Points.
 *
 * Implementação atual:
 * - Mantém estrutura de dados esperada pelo painel;
 * - Retorna valores estáticos/derivados, sem buscar de API/BD;
 * - Evita quebrar o build enquanto a lógica definitiva não é implementada.
 */
export function useRitmoPoints(userId: string | null): UseRitmoPointsResult {
  const [state, setState] = useState<UseRitmoPointsResult>({
    saldoAtual: 0,
    crescimentoSemanal: 0,
    metaSemanal: 100,
    progressoSemanal: 0,
    streak: 0,
    badges: [],
    loading: true,
  })

  useEffect(() => {
    // Enquanto não houver implementação real, apenas libera o loading
    if (!userId) {
      setState((prev) => ({
        ...prev,
        loading: false,
      }))
      return
    }

    // Futuramente aqui poderemos buscar os dados reais via API.
    setState((prev) => ({
      ...prev,
      loading: false,
    }))
  }, [userId])

  return state
}

