import { parseWallClock, formatEventDate } from '@/utils/eventDateTime'

const DAY = 1440

/** Minutes since a fixed origin for a wall-clock `Y-m-d H:i:s`, or null when it is not readable. Zone free. */
export function minutesOf(value) {
  const p = parseWallClock(value)
  return p ? Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) / 60000 : null
}

/**
 * Minutes a moment lasts, or null without an end time. An end that is not after the start crosses midnight,
 * so a day is added ("10:00 p.m. - 1:00 a.m." lasts 180).
 */
export function durationOf(moment) {
  if (!moment?.endTime) return null
  const start = minutesOf(moment.startTime)
  const end = minutesOf(moment.endTime)
  if (start === null || end === null) return null
  let minutes = end - start
  while (minutes <= 0) minutes += DAY
  return minutes
}

/** "1 h", "45 min", "1 h 30 min". */
export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}

/** The moment where the previous one ends (absolute minutes), or null when it has no end time. */
export function endMinutes(moment) {
  const duration = durationOf(moment)
  const start = minutesOf(moment?.startTime)
  return duration === null || start === null ? null : start + duration
}

/**
 * What lies between a moment and the next: `{ kind: 'gap' | 'overlap', minutes }`, or null when they touch,
 * when the previous one has no end time, or when a time cannot be read.
 */
export function connectionBetween(previous, next) {
  const end = endMinutes(previous)
  const start = minutesOf(next?.startTime)
  if (end === null || start === null) return null
  const diff = start - end
  if (diff === 0) return null
  return diff > 0 ? { kind: 'gap', minutes: diff } : { kind: 'overlap', minutes: -diff }
}

const MERIDIEM = /[\s\u00a0\u202f]*([ap])\.?[\s\u00a0\u202f]?m\.?$/i

/**
 * The hours of a moment as text, 12 h in the app's language. When both times share a.m./p.m. the start omits it
 * ("4:30 - 5:30 p.m."), the way people write a range.
 * @returns {{ start: string, end: string, range: string }} `end` and the range's tail are '' without an end time
 */
export function rangeLabel(moment, locale) {
  const start = formatEventDate(moment.startTime, 'time', locale)
  const end = moment.endTime ? formatEventDate(moment.endTime, 'time', locale) : ''
  if (!end) return { start, end, range: start }
  const a = MERIDIEM.exec(start)
  const b = MERIDIEM.exec(end)
  const shared = a && b && a[1].toLowerCase() === b[1].toLowerCase()
  const first = shared ? start.replace(MERIDIEM, '') : start
  return { start, end, range: `${first} – ${end}` }
}
