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

/** Formata valor digitado como telefone BR: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX */
export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '')
  const toFormat =
    digits.startsWith('55') && digits.length > 11
      ? digits.slice(2, 13)
      : digits.slice(0, 11)
  if (toFormat.length <= 2) return toFormat ? `(${toFormat}` : ''
  if (toFormat.length <= 7) return `(${toFormat.slice(0, 2)}) ${toFormat.slice(2)}`
  return `(${toFormat.slice(0, 2)}) ${toFormat.slice(2, 7)}-${toFormat.slice(7)}`
}

/** Retorna apenas os dígitos do telefone (para validação ou envio). */
export function getPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}
