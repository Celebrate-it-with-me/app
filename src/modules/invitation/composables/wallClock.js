/**
 * Event dates are wall-clock times of the event: the API sends them without offset
 * ("2026-12-28T19:00:00") and nobody must convert them. They are read as UTC and formatted with
 * timeZone 'UTC', so the browser's own zone and its daylight-saving rules can never shift them.
 */
export const INTL = { es: 'es-US', en: 'en-US' }

const HAS_OFFSET = /(?:[zZ]|[+-]\d\d:?\d\d)$/

/**
 * @param {string} iso
 * @param {string} locale 'es' | 'en'
 * @param {Intl.DateTimeFormatOptions} options
 * @param {string} [timezone] only used when the value carries an explicit offset
 */
export function formatWallClock(iso, locale, options, timezone) {
  if (typeof iso !== 'string' || !iso) return ''
  const withOffset = HAS_OFFSET.test(iso)
  const date = new Date(withOffset ? iso : `${iso.replace(' ', 'T')}Z`)
  if (Number.isNaN(date.getTime())) return ''
  let timeZone = 'UTC'
  if (withOffset && timezone) {
    try {
      new Intl.DateTimeFormat('en', { timeZone: timezone })
      timeZone = timezone
    } catch {
      timeZone = 'UTC'
    }
  }
  return new Intl.DateTimeFormat(INTL[locale] ?? 'es-US', { ...options, timeZone }).format(date)
}
