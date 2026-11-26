/**
 * The ONE place that turns an event's dates and times into text (panel and public invitation).
 *
 * What the API sends today
 * - `event.startDate` / `endDate`: the event's wall clock as `MM/DD/YYYY HH:mm` (no zone). Never `split(' ')`.
 * - `event.startsAt` / `endsAt` (when the API sends them): ISO 8601 with offset, a real instant. They win.
 * - Instants (`paidAt`, `updatedAt`): ISO 8601 with offset.
 * - Other wall-clock texts: `YYYY-MM-DD HH:mm[:ss]`, `YYYY-MM-DDTHH:mm`, or just `YYYY-MM-DD`.
 *
 * Rules: wall-clock text is read as the clock of the event's zone and printed with timeZone 'UTC' on a UTC date, so the
 * browser's zone and daylight saving can never shift it. An instant is printed in the event's zone. Times are 12 h in
 * the app's language (es-US / en-US), dates are always spelled out: nothing prints as 01/02/2027.
 */
export const INTL = { es: 'es-US', en: 'en-US' }

const HAS_OFFSET = /(?:[zZ]|[+-]\d\d:?\d\d)$/
const US = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?$/

const pad = n => String(n).padStart(2, '0')

/**
 * Wall-clock text to its parts, or null when it is not understood (or has an offset: that is an instant).
 * @returns {{ year: number, month: number, day: number, hour: number, minute: number } | null}
 */
export function parseWallClock(text) {
  if (typeof text !== 'string') return null
  const value = text.trim()
  let year, month, day, hour, minute
  const us = US.exec(value)
  if (us) [, month, day, year, hour = 0, minute = 0] = us
  else {
    const iso = ISO.exec(value)
    if (!iso) return null
    ;[, year, month, day, hour = 0, minute = 0] = iso
  }
  const parts = { year: +year, month: +month, day: +day, hour: +hour, minute: +minute }
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute))
  const real =
    check.getUTCFullYear() === parts.year &&
    check.getUTCMonth() === parts.month - 1 &&
    check.getUTCDate() === parts.day &&
    parts.hour < 24 &&
    parts.minute < 60
  return real ? parts : null
}

/** Wall-clock text to `YYYY-MM-DDTHH:mm:00` (still without zone), or '' when not understood. */
export function wallClockToIso(text) {
  const p = parseWallClock(text)
  return p ? `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:00` : ''
}

function validZone(timezone) {
  if (!timezone) return null
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone })
    return timezone
  } catch {
    return null
  }
}

/**
 * @param {string} value wall-clock text, or an instant with offset
 * @param {string} locale 'es' | 'en'
 * @param {Intl.DateTimeFormatOptions} options
 * @param {string} [timezone] the event's zone; used only for instants
 * @param {string|undefined} [instantFallback] zone for an instant when `timezone` is missing or invalid: 'UTC' (the
 *   invitation's historic rule) or undefined (the browser's zone, what the panel wants)
 * @returns {string} '' when the value is not understood
 */
export function formatWallClock(value, locale, options, timezone, instantFallback = 'UTC') {
  if (typeof value !== 'string' || !value.trim()) return ''
  let date
  let timeZone = 'UTC'
  if (HAS_OFFSET.test(value.trim())) {
    date = new Date(value.trim())
    timeZone = validZone(timezone) ?? instantFallback
  } else {
    const iso = wallClockToIso(value)
    if (!iso) return ''
    date = new Date(`${iso}Z`)
  }
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(INTL[locale] ?? 'es-US', { ...options, ...(timeZone ? { timeZone } : {}) }).format(date)
}

const CLOCK = { hour: 'numeric', minute: '2-digit', hour12: true }
const STYLES = {
  /** 2 de enero de 2027 */
  date: { day: 'numeric', month: 'long', year: 'numeric' },
  /** 2 ene 2027 */
  dateShort: { day: 'numeric', month: 'short', year: 'numeric' },
  /** 2 de enero */
  dayMonth: { day: 'numeric', month: 'long' },
  /** sábado, 2 de enero de 2027 */
  weekdayDate: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  /** 2 ene, 4:30 p. m. */
  dayTime: { day: 'numeric', month: 'short', ...CLOCK },
  /** 4:30 p. m. */
  time: CLOCK,
  /** 2 ene 2027, 4:30 p. m. */
  dateTime: { day: 'numeric', month: 'short', year: 'numeric', ...CLOCK }
}

/** The styles an event date can be printed in. */
export const DATE_STYLES = Object.keys(STYLES)

/**
 * @param {string} value
 * @param {'date'|'dateShort'|'dayMonth'|'weekdayDate'|'dayTime'|'time'|'dateTime'} style
 * @param {string} locale 'es' | 'en'
 * @param {string} [timezone]
 */
export function formatEventDate(value, style, locale, timezone) {
  return formatWallClock(value, locale, STYLES[style] ?? STYLES.date, timezone, undefined)
}

/** "7:00 p.m." / "7:00 PM": 12-hour clock in the app's language (never the browser's 24 h default). */
export const formatClock = (value, locale, timezone) => formatEventDate(value, 'time', locale, timezone)

/**
 * The value to print for an event's start or end: the ISO instant when the API sends one, else the wall-clock text.
 * @param {object} event
 * @param {'start'|'end'} which
 */
export function eventMoment(event, which = 'start') {
  const iso = which === 'end' ? event?.endsAt : event?.startsAt
  if (typeof iso === 'string' && iso) return iso
  const text = which === 'end' ? event?.endDate : event?.startDate
  return typeof text === 'string' ? text : ''
}

/** `YYYY-MM-DD` of an event moment (for the plain date a form or a comparison needs), or ''. */
export function eventDay(event, which = 'start') {
  const value = eventMoment(event, which)
  if (HAS_OFFSET.test(value)) {
    const zone = validZone(event?.timezone)
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone ?? 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
    return parts
  }
  return wallClockToIso(value).slice(0, 10)
}

/** Today's `YYYY-MM-DD` in the event's zone, or in the browser's zone when the event has none (or an invalid one). */
function todayIn(timezone, now) {
  const zone = validZone(timezone)
  if (zone) return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const dayNumber = ymd => {
  const [y, m, d] = ymd.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86_400_000
}

/**
 * Whole calendar days from today to the event's start day (0 = today, negative = already past), counted in the event's
 * zone so the browser's zone never moves the day. `null` when the event has no readable date.
 * @param {object} event `{ startDate, startsAt?, timezone? }`
 * @param {Date} [now]
 */
export function daysUntilEvent(event, now = new Date()) {
  const day = eventDay(event)
  return day ? Math.round(dayNumber(day) - dayNumber(todayIn(event?.timezone, now))) : null
}

/**
 * The event's start (or end) as a `Date` whose LOCAL fields are the event's wall clock: for sorting and for building
 * times of that same day (never print it with a zone; use `formatEventDate` for text). `null` when not readable.
 * @param {object} event
 * @param {'start'|'end'} [which]
 */
export function eventDate(event, which = 'start') {
  const value = eventMoment(event, which)
  let parts = parseWallClock(value)
  if (!parts && HAS_OFFSET.test(value.trim())) {
    const instant = new Date(value.trim())
    if (!Number.isNaN(instant.getTime())) {
      const found = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', { timeZone: validZone(event?.timezone) ?? 'UTC', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
          .formatToParts(instant)
          .map(p => [p.type, +p.value])
      )
      parts = { year: found.year, month: found.month, day: found.day, hour: found.hour, minute: found.minute }
    }
  }
  return parts ? new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) : null
}

/** True when `end` falls on a later calendar day than `start` (a party that runs past midnight). */
export function endsNextDay(start, end) {
  const a = wallClockToIso(start).slice(0, 10)
  const b = wallClockToIso(end).slice(0, 10)
  if (!a || !b) return typeof start === 'string' && typeof end === 'string' ? end.replace(' ', 'T').slice(0, 10) > start.replace(' ', 'T').slice(0, 10) : false
  return b > a
}
