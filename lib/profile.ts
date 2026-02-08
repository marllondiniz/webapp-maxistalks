export type ProfileRecord = {
  id: string
  email: string | null
  nome: string | null
  bio: string | null
  telefone: string | null
  esporte_favorito: string | null
  frequencia_semanal: string | null
  recebe_beneficios: boolean | null
  avatar_url: string | null
  is_complete: boolean | null
  hasActiveSubscription?: boolean | null
  hasactivesubscription?: boolean | null
  cidade_estado?: string | null
  empresa_projeto?: string | null
  area_principal?: string | null
  estagio_negocio?: string | null
  objetivo_mes?: string | null
  participar_eventos?: boolean | null
  o_que_vende?: string | null
  para_quem_vende?: string | null
  ticket_medio?: string | null
  capacidade_mensal?: string | null
  o_que_faz_frase?: string | null
  metodo_diferencial?: string | null
  canal_principal?: string | null
  prova?: string | null
  principais_desafios?: string[] | null
  ofereco?: string | null
  preciso?: string | null
  linkedin?: string | null
  instagram?: string | null
  site?: string | null
  // MaxisTalks Cadastro Final
  posicao_mercado?: string | null
  segmento_negocio?: string | null
  publico_atende?: string | null
  faixa_faturamento?: string | null
  num_colaboradores?: string | null
  cargo_atual?: string | null
  area_gestao?: string | null
  empresa_atual?: string | null
  tamanho_empresa?: string | null
  lidera_time?: boolean | null
  desafios_detalhados?: string[] | null
  busca_maxistalks?: string[] | null
  o_que_quer_aprender?: string[] | null
  maior_dificuldade?: string | null
  ciente_evento_online?: boolean | null
  aceite_lgpd?: boolean | null
}

export type UserRole = 'FREE' | 'SUBSCRIBER'

export function getUserRole(
  profile: Pick<ProfileRecord, 'hasActiveSubscription' | 'hasactivesubscription'> | null
): UserRole {
  const hasSubscription =
    profile?.hasActiveSubscription ?? profile?.hasactivesubscription ?? false

  return hasSubscription ? 'SUBSCRIBER' : 'FREE'
}
