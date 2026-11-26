/**
 * Pure helpers behind the organizer dashboard. No stores, no Vue: easy to test.
 */

/** RSVP numbers from the stats endpoint payload (`response.data` of `GET /rsvp/stats`). People include companions. */
export function summarizeRsvp(stats) {
  const s = stats?.data ?? stats ?? {}
  const attending = Number(s.attending?.total) || 0
  const pending = Number(s.pending?.total) || 0
  const declined = Number(s.not_attending?.total) || 0
  return {
    attending,
    pending,
    declined,
    people: Number(s.totals?.people ?? attending + pending + declined) || 0,
    mainGuests: Number(s.totals?.guests) || 0,
    companions: Number(s.totals?.companions) || 0,
    pendingGuests: Number(s.pending?.guests) || 0,
    responseRate: Math.max(0, Math.min(100, Math.round(Number(s.response_rate) || 0)))
  }
}

/** `recent.status` comes as stored (`not-attending`, with a dash); the stats keys use `not_attending`. Both mean declined. */
const RECENT_STATUS = { attending: 'attending', 'not-attending': 'declined', not_attending: 'declined' }

/**
 * "Últimas respuestas": the latest answers of `rsvp/stats.recent`, newest first, at most `max`. Rows without a name, a
 * known status or a date are dropped (never a blank line). A role that may not see names gets `[]`.
 */
export function recentResponses(stats, max = 4) {
  const s = stats?.data ?? stats ?? {}
  const rows = Array.isArray(s.recent) ? s.recent : []
  return rows
    .map(row => ({ name: String(row?.name ?? '').trim(), status: RECENT_STATUS[row?.status] ?? null, statusDate: row?.statusDate ?? null, at: Date.parse(row?.statusDate ?? '') }))
    .filter(row => row.name && row.status && !Number.isNaN(row.at))
    .sort((a, b) => b.at - a.at)
    .slice(0, max)
    .map(row => ({ name: row.name, status: row.status, statusDate: row.statusDate }))
}

/**
 * The ring's arcs (attending, pending, declined) on a circle of `length` units, in that order and touching each other:
 * `{ key, value, dash, offset }` ready for `stroke-dasharray` / `stroke-dashoffset`. Empty arcs are left out.
 */
export function ringSegments({ attending = 0, pending = 0, declined = 0 } = {}, length = 100) {
  const total = attending + pending + declined
  if (total <= 0) return []
  let start = 0
  return [
    ['attending', attending],
    ['pending', pending],
    ['declined', declined]
  ]
    .filter(([, value]) => value > 0)
    .map(([key, value]) => {
      const dash = (value / total) * length
      const segment = { key, value, dash, offset: -start }
      start += dash
      return segment
    })
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

/** Whole percentage (0-100) of a `{ done, total }` progress; 0 for an empty one. */
export function planPercent(progress) {
  const total = Number(progress?.total) || 0
  if (total <= 0) return 0
  return Math.round(Math.min(1, Math.max(0, (Number(progress?.done) || 0) / total)) * 100)
}

/** States that are not something to do today. */
const NOT_TODO = ['done', 'hidden', 'not_applicable']

/** The steps of "Lo que toca ahora": the assistant's recommended steps (`next.steps`), at most `max`, never a closed one. */
export function nowSteps(next, max = 3) {
  const steps = Array.isArray(next?.steps) ? next.steps : []
  return steps.filter(step => step?.key && !NOT_TODO.includes(step.state)).slice(0, max)
}

/** The plan phases that become milestones of "Ruta al evento", in route order. */
export const ROUTE_PHASES = ['foundation', 'invitations']

/** Tasks the person can still act on count as steps; hidden or not-applicable ones are out of the route. */
const countsAsStep = task => task && task.state !== 'hidden' && task.state !== 'not_applicable'

/**
 * One phase of `assistant/plan` as the route needs it: how many steps it has, how many are done and the titles of the
 * pending ones (server order).
 */
export function phaseSummary(plan, key) {
  const tasks = (plan?.phases?.find(phase => phase.key === key)?.tasks ?? []).filter(countsAsStep)
  const pending = tasks.filter(task => task.state !== 'done')
  return { key, total: tasks.length, done: tasks.length - pending.length, pending: pending.map(task => String(task.title ?? '').trim()).filter(Boolean) }
}

/**
 * The route's phase milestones with their state: `done` (every step done), `current` (the first phase with steps left),
 * `upcoming` (later ones with steps left) or `empty` (the plan has no steps there).
 */
export function routePhases(plan) {
  let currentTaken = false
  return ROUTE_PHASES.map(key => {
    const summary = phaseSummary(plan, key)
    if (summary.total === 0) return { ...summary, state: 'empty' }
    if (summary.done === summary.total) return { ...summary, state: 'done' }
    if (!currentTaken) {
      currentTaken = true
      return { ...summary, state: 'current' }
    }
    return { ...summary, state: 'upcoming' }
  })
}

/**
 * The four milestones (Hoy, the phases, the event day) with whether each one is `reached`; a connector is drawn filled
 * when the milestone it leads to is reached. `daysLeft` is the days to the event (null without a date).
 * @returns {Array<{ key: string, state: string, reached: boolean }>}
 */
export function routeMilestones(plan, daysLeft) {
  return [
    { key: 'today', state: 'now', reached: true },
    ...routePhases(plan).map(phase => ({ ...phase, reached: phase.state === 'done' || phase.state === 'current' })),
    { key: 'event', state: 'event', reached: daysLeft !== null && daysLeft !== undefined && daysLeft <= 0 }
  ]
}

/** The route only makes sense for events the assistant plans: it is hidden for other types and after the event. */
export const routeAvailability = plan => {
  if (!plan) return 'none'
  if (plan.mode === 'no_date') return 'no_date'
  return plan.mode === 'normal' || plan.mode === 'compressed' ? 'ready' : 'none'
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
