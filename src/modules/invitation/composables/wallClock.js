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

const CLOCK = { hour: 'numeric', minute: '2-digit' }

/** "7:00 p.m." / "7:00 PM": 12-hour clock in the invitation's language (never the browser's 24 h default). */
export const formatClock = (iso, locale, timezone) => formatWallClock(iso, locale, CLOCK, timezone)

/** True when `end` falls on a later calendar day than `start` (a party that runs past midnight). */
export function endsNextDay(start, end) {
  if (typeof start !== 'string' || typeof end !== 'string') return false
  const day = value => value.replace(' ', 'T').slice(0, 10)
  return day(end) > day(start)
}
