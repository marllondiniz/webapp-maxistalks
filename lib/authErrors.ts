/**
 * Traduz mensagens de erro do Supabase Auth para português.
 */
export function translateAuthError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos. Tente novamente.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de acessar. Verifique sua caixa de entrada e spam.'
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.'
  }
  if (lower.includes('password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.'
  }
  if (lower.includes('invalid email')) {
    return 'Informe um e-mail válido.'
  }
  if (lower.includes('email rate limit') || lower.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }
  if (lower.includes('invalid recovery link') || lower.includes('recovery link')) {
    return 'Link inválido ou expirado. Solicite um novo e-mail de recuperação.'
  }
  if (lower.includes('signup_disabled')) {
    return 'Cadastro temporariamente indisponível. Tente mais tarde.'
  }
  if (lower.includes('session expired')) {
    return 'Sua sessão expirou. Faça login novamente.'
  }

  return message
}
