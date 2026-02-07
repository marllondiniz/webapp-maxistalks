export type RitmoPointsRecord = {
  id: string
  user_id: string
  pontos: number
  fonte: 'evento' | 'desafio' | 'streak' | 'bonus'
  fonte_id: string | null
  descricao: string | null
  created_at: string
}

export type UserStreakRecord = {
  user_id: string
  streak_atual: number
  melhor_streak: number
  ultima_atividade: string
  updated_at: string
}

export type BadgeRecord = {
  id: string
  codigo: string
  nome: string
  descricao: string
  icone: string
  tipo: 'bronze' | 'prata' | 'ouro' | 'platina'
  criterio_pontos: number | null
  criterio_streak: number | null
  ordem: number
}

export type UserBadgeRecord = {
  user_id: string
  badge_id: string
  desbloqueado_em: string
  visualizado: boolean
}

export type WeeklyGoalRecord = {
  id: string
  user_id: string
  semana_inicio: string
  meta_pontos: number
  pontos_atuais: number
  concluida: boolean
}

export type ActivityHeatmapRecord = {
  data: string
  tipo: string
  intensidade: number
  pontos: number
}

// Funções utilitárias
export function calcularProgresso(atual: number, meta: number): number {
  if (meta <= 0) return 0
  return Math.min(100, Math.round((atual / meta) * 100))
}

export function calcularCrescimento(atualSemana: number, semanaPassada: number): number {
  return atualSemana - semanaPassada
}

export function formatarPontos(pontos: number): string {
  return new Intl.NumberFormat('pt-BR').format(pontos)
}

export function obterCorIntensidade(intensidade: number): string {
  if (intensidade >= 80) return 'bg-emerald-400'
  if (intensidade >= 60) return 'bg-emerald-300'
  if (intensidade >= 40) return 'bg-emerald-200'
  if (intensidade >= 20) return 'bg-emerald-100'
  return 'bg-slate-700/60'
}

export function gerarInsightSemanal(treinos: number): string {
  if (treinos === 0) return 'Comece sua jornada! Registre seu primeiro treino.'
  if (treinos === 1) return 'Ótimo começo! Continue assim e complete mais treinos.'
  if (treinos === 2) return 'Você está no caminho certo! Mais um treino para bater a meta.'
  if (treinos === 3) return 'Parabéns! Meta semanal alcançada. Continue firme! 💪'
  if (treinos >= 4) return `Incrível! ${treinos} treinos na semana. Você está dominando! 🔥`
  return 'Continue assim!'
}

