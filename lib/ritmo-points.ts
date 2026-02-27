export function obterCorIntensidade(intensidade: number): string {
  if (!intensidade || intensidade <= 0) {
    return 'bg-slate-800/80'
  }
  if (intensidade < 25) {
    return 'bg-emerald-100'
  }
  if (intensidade < 50) {
    return 'bg-emerald-200'
  }
  if (intensidade < 75) {
    return 'bg-emerald-300'
  }
  return 'bg-emerald-400'
}

export function formatarPontos(pontos: number): string {
  const valor = Number.isFinite(pontos) ? Math.max(0, Math.floor(pontos)) : 0
  return valor.toLocaleString('pt-BR')
}

export function gerarInsightSemanal(totalTreinos: number): string {
  if (totalTreinos <= 0) {
    return 'Você ainda não registrou treinos nas últimas 4 semanas. Que tal começar com um movimento leve esta semana?'
  }
  if (totalTreinos <= 4) {
    return 'Bom começo! Você teve alguns treinos nas últimas semanas. Tente adicionar +1 sessão para ganhar ritmo.'
  }
  if (totalTreinos <= 8) {
    return 'Você está construindo consistência. Mantenha 2 treinos por semana e observe sua evolução no painel.'
  }
  if (totalTreinos <= 12) {
    return 'Excelente! Seu ritmo semanal está sólido. Continue assim para maximizar seus pontos e resultados.'
  }
  return 'Impressionante! Você está em altíssimo ritmo de treinos. Lembre-se de equilibrar intensidade e recuperação.'
}

