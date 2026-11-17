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
 * How ready the event really is, from real data: a date is set, there are guests, the invitation is published and,
 * when the plan has the budget, it has at least one item. Returns `{ done, total, ratio }` (ratio 0..1).
 */
export function readiness({ hasDate, guestCount, published, budgetEnabled, budgetItems }) {
  const checks = [!!hasDate, guestCount > 0, !!published]
  if (budgetEnabled) checks.push(budgetItems > 0)
  const done = checks.filter(Boolean).length
  return { done, total: checks.length, ratio: done / checks.length }
}

/**
 * What the hero's big countdown shows. `kind`: `none` (no date), `past`, `today` or `future` (with `n` days).
 */
export function countdownInfo(days) {
  if (days === null || days === undefined) return { kind: 'none', n: 0 }
  if (days < 0) return { kind: 'past', n: 0 }
  if (days === 0) return { kind: 'today', n: 0 }
  return { kind: 'future', n: days }
}

/**
 * The four figures of the strip. `empty` is true when there is nobody on the list yet (the strip then invites to add guests).
 * People include companions when the stats say so.
 */
export function statsFigures(rsvp) {
  return {
    empty: !rsvp.people,
    items: [
      { key: 'attending', value: rsvp.attending, tone: 'success' },
      { key: 'pending', value: rsvp.pending, tone: 'gold' },
      { key: 'declined', value: rsvp.declined, tone: 'ink' },
      { key: 'total', value: rsvp.people, tone: 'rose' }
    ]
  }
}

/**
 * Public link of the invitation to copy. TODO(owner decision, TASKS.md "enlace genérico"): today a real link needs a guest
 * code (`/i/:slug/:code`); until the generic link exists this is the slug address and only this function changes.
 */
export function invitationShareUrl(slug, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  if (!slug) return ''
  return `${origin}/i/${encodeURIComponent(slug)}`
}

/** `wa.me` link with the message already written (WhatsApp is the main channel). */
export function whatsappShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
