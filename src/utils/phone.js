/**
 * Phone numbers are stored in E.164 (`+13055550123`). Organizers type them in many shapes.
 * Returns the E.164 string, '' for an empty input, or null when it cannot be understood.
 * A bare 10-digit number is read as a US number (the first market).
 */
export function normalizePhone(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return ''
  const hasPlus = raw.startsWith('+')
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  let e164
  if (hasPlus) e164 = `+${digits}`
  else if (digits.length === 10) e164 = `+1${digits}`
  else if (digits.length === 11 && digits.startsWith('1')) e164 = `+${digits}`
  else return null
  return /^\+[1-9]\d{6,14}$/.test(e164) ? e164 : null
}
