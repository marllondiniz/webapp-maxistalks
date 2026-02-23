/**
 * Normaliza telefone para link do WhatsApp (Brasil).
 * Evita duplicar o +55: se o número já tiver 55 no início, não concatena de novo.
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits.length) return ''
  const withoutCountry = digits.startsWith('55') ? digits.slice(2) : digits
  return '55' + withoutCountry
}
