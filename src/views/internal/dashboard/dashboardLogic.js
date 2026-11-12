/**
 * Pure helpers behind the organizer dashboard. No stores, no Vue: easy to test.
 */

/** The API sends event dates as `m/d/Y H:i` (wall time of the event). */
export function parseEventDate(value) {
  if (!value || typeof value !== 'string') return null
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/)
  if (!m) {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const [, month, day, year, hour = '0', minute = '0'] = m
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
}

/** Whole calendar days from `now` to `date` (0 = today, negative = already past). */
export function daysUntil(date, now = new Date()) {
  if (!date) return null
  const startOf = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((startOf(date) - startOf(now)) / 86_400_000)
}

/** RSVP numbers from the stats endpoint payload (`response.data` of `GET /rsvp/stats`). */
export function summarizeRsvp(stats) {
  const s = stats?.data ?? stats ?? {}
  const attending = s.attending?.total ?? 0
  const pending = s.pending?.total ?? 0
  const declined = s.not_attending?.total ?? 0
  const people = s.totals?.people ?? attending + pending + declined
  return {
    attending,
    pending,
    declined,
    people,
    mainGuests: s.totals?.guests ?? 0,
    pendingGuests: s.pending?.guests ?? 0,
    responseRate: s.response_rate ?? 0
  }
}

/** Share of each status in the stacked bar, as whole percentages that always add up to 100 (or all 0). */
export function rsvpShares({ attending, pending, declined }) {
  const total = attending + pending + declined
  if (!total) return { attending: 0, pending: 0, declined: 0 }
  const a = Math.round((attending / total) * 100)
  const d = Math.round((declined / total) * 100)
  return { attending: a, declined: d, pending: Math.max(0, 100 - a - d) }
}

/**
 * The single most useful thing to do next, from real data only.
 * Returns `{ id, to }` (route target) or `{ id: 'allSet' }` when nothing is pending.
 */
export function pickNextStep({ guestCount, status, pendingGuests, rsvpEnabled, budgetEnabled, budgetItems }) {
  if (!guestCount) return { id: 'addGuests', to: '/dashboard/guests' }
  if (status === 'draft') return { id: 'publish', to: 'edit' }
  if (rsvpEnabled && pendingGuests > 0) return { id: 'pendingGuests', to: '/dashboard/rsvp', count: pendingGuests }
  if (budgetEnabled && budgetItems === 0) return { id: 'budget', to: '/dashboard/budget' }
  return { id: 'allSet' }
}
