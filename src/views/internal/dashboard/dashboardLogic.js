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
 * The organization plan's progress for the hero, read from the assistant (the same number as "Your next step").
 * `null` hides it: no assistant data yet, an event the assistant does not cover (`unsupported`, `no_date`) or an empty plan.
 */
export function planProgress(next) {
  if (!next || next.mode === 'unsupported' || next.mode === 'no_date') return null
  const total = Number(next.progress?.total) || 0
  if (total <= 0) return null
  const done = Math.min(total, Math.max(0, Number(next.progress?.done) || 0))
  return { done, total, ratio: done / total }
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

/** Colour names the API sends for activity entries -> soft chip classes (text on tinted background, contrast >= 4.5:1). */
export const ACTIVITY_TONES = {
  blue: 'bg-blue-50 text-blue-700',
  cyan: 'bg-cyan-50 text-cyan-700',
  green: 'bg-success-50 text-success-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  orange: 'bg-orange-50 text-orange-700',
  pink: 'bg-rose-50 text-rose-700',
  red: 'bg-danger-50 text-danger-700',
  yellow: 'bg-gold-100 text-gold-700'
}
/**
 * The API now sends only known event types, each with its translated `message` (ORG-016). The text is drawn as it comes;
 * the only thing left to drop is an entry with no text at all.
 */
export const readableActivity = (items = []) => items.filter(item => String(item?.message ?? '').trim() !== '')

export const ACTIVITY_TONE_FALLBACK = 'bg-cream-200 text-ink-700'

/** The tone classes for an API colour; an unknown or missing one gets the neutral chip, never nothing. */
export const activityTone = color => ACTIVITY_TONES[String(color ?? '').toLowerCase()] ?? ACTIVITY_TONE_FALLBACK

/** What each activity type needs from `params` to make its sentence; a missing piece sends the row to the API's own `message`. */
const SENTENCE_NEEDS = {
  event_created: ['actor', 'name'], event_updated: ['actor', 'name'], event_published: ['actor', 'name'],
  event_unpublished: ['actor', 'name'], event_archived: ['actor', 'name'], event_restored: ['actor', 'name'],
  guest_created: ['actor', 'name'], guest_updated: ['actor', 'name'], guest_deleted: ['actor', 'name'],
  guests_imported: ['actor', 'count'],
  guest_confirmed: ['name'], guest_declined: ['name'], guest_rsvp_changed: ['name', 'status'], invitation_opened: ['name'],
  menu_created: ['actor', 'name'], menu_updated: ['actor', 'name'], menu_deleted: ['actor', 'name'],
  menu_item_created: ['actor', 'name'], menu_item_updated: ['actor', 'name'], menu_item_deleted: ['actor', 'name'],
  invitation_template_changed: ['actor', 'template'], invitation_template_undone: ['actor'],
  invitation_cover_uploaded: ['actor'], invitation_cover_removed: ['actor'],
  comment_added: ['name'], music_suggested: ['name', 'song']
}

const has = value => value !== null && value !== undefined && String(value).trim() !== ''

/**
 * The sentence of an activity row in the app's language, built from `type` + `params` with the app's own i18n.
 * An unknown type, a row without params (old API) or a missing piece falls back to the API's `message`.
 * `t` is vue-i18n's translate function.
 */
export function activitySentence(item, t) {
  const fallback = String(item?.message ?? '')
  const needs = SENTENCE_NEEDS[item?.type]
  const params = item?.params
  if (!needs || !params || !needs.every(key => has(params[key]))) return fallback
  if (item.type === 'guest_confirmed' && Number(params.companions) > 0) {
    const n = Number(params.companions)
    return t('app.dashboard.activity.guest_confirmedWith', { name: params.name, n }, n)
  }
  const status = item.type === 'guest_rsvp_changed' ? t(`app.dashboard.activity.status.${params.status}`) : ''
  return t(`app.dashboard.activity.${item.type}`, { ...params, status })
}

const RELATIVE_UNITS = [
  ['year', 31_536_000], ['month', 2_592_000], ['week', 604_800], ['day', 86_400], ['hour', 3_600], ['minute', 60]
]

/**
 * "hace 1 día" / "1 day ago" from the ISO instant `occurredAt`, in the app's locale. Without it (old API) the API's own
 * `createdAt` text is shown as it comes.
 */
export function activityTime(item, locale, now = new Date()) {
  const at = item?.occurredAt ? new Date(item.occurredAt) : null
  if (!at || Number.isNaN(at.getTime())) return String(item?.createdAt ?? '')
  const seconds = Math.round((at.getTime() - now.getTime()) / 1000)
  const abs = Math.abs(seconds)
  // Always numeric: "hace 1 día", not "ayer"; only the last minute reads "ahora" / "now".
  for (const [unit, size] of RELATIVE_UNITS) {
    if (abs >= size) return new Intl.RelativeTimeFormat(locale, { numeric: 'always' }).format(Math.trunc(seconds / size), unit)
  }
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'second')
}
