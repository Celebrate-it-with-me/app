/**
 * Pure helpers of the assistant module (contract: docs/plans/assistant-contract.md). No stores, no Vue.
 */

/** Minimum time between two reads of `assistant/next` (entering the dashboard, coming back to the tab). */
export const MIN_REFRESH_MS = 30 * 1000

/** Phase order of the plan. The server sends `phases[].label` already translated; this is the fallback order. */
export const PHASES = ['foundation', 'planning', 'details', 'invitations', 'final', 'after']

/** Snooze choices of "Posponer": 14 days, 1 month, 3 months. */
export const SNOOZE_OPTIONS = [
  { days: 14, labelKey: 'app.assistant.snooze14' },
  { days: 30, labelKey: 'app.assistant.snooze1m' },
  { days: 90, labelKey: 'app.assistant.snooze3m' }
]

/** The step shapes `pickNextStep` used to return, mapped to the assistant's task keys (contract, "Migración"). */
export const LEGACY_STEP_KEYS = {
  addGuests: 'guest_list',
  publish: 'publish_invitation',
  pendingGuests: 'rsvp_follow_up',
  budget: 'budget_cap',
  allSet: 'allSet'
}

/** Key of a step in either shape: `{ key }` from the server or `{ id }` from `pickNextStep`. */
export const stepKey = step => step?.key ?? LEGACY_STEP_KEYS[step?.id] ?? step?.id ?? null

/**
 * Destinations in the contract's catalog table that the real router does not have. The real route wins:
 * - `/dashboard/program`  -> the day's program lives at `/dashboard/timeline`
 * - `/dashboard/invitation` -> the invitation editor is not built; its status is changed on the event screen
 * - `/dashboard/rsvp` -> redirects to the guest list's "pending" tab anyway
 * - `/dashboard/events/:id` (closing screen placeholder) -> the memories module is the nearest real screen
 */
const ROUTE_ALIASES = {
  '/dashboard/program': '/dashboard/timeline',
  '/dashboard/invitation': '@edit-event',
  '/dashboard/rsvp': '/dashboard/guests?status=pending',
  '/dashboard/events/:id': '/dashboard/memories'
}

/**
 * Where "Ir a hacerla" leads. Returns a router location (string or object) or null when there is no safe,
 * known destination (the button is then not drawn). Only internal paths are accepted.
 */
export function resolveTaskRoute(route, eventId = null) {
  if (typeof route !== 'string') return null
  const value = route.trim()
  if (value === '@edit-event') return eventId ? { name: 'edit-event', params: { id: eventId } } : null
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\') || [...value].some(c => c.charCodeAt(0) < 32)) {
    return null
  }
  const [path, query] = value.split('?')
  const aliased = ROUTE_ALIASES[path]
  if (aliased === '@edit-event') return eventId ? { name: 'edit-event', params: { id: eventId } } : null
  if (aliased) return aliased.includes('?') || !query ? aliased : `${aliased}?${query}`
  return value
}

const asArray = value => (Array.isArray(value) ? value : [])

/** A task with every field the screens read, whatever the server left out. */
export function normalizeTask(task) {
  const t = task ?? {}
  return {
    key: String(t.key ?? ''),
    phase: t.phase ?? 'foundation',
    title: String(t.title ?? ''),
    state: t.state ?? 'available',
    reason: typeof t.reason === 'string' ? t.reason : '',
    reasonCode: t.reasonCode ?? null,
    reasonParams: t.reasonParams ?? {},
    route: t.route ?? null,
    moduleKey: t.moduleKey ?? null,
    moduleLocked: !!t.moduleLocked,
    doneBy: t.doneBy ?? null,
    blockedBy: asArray(t.blockedBy),
    snoozedUntil: t.snoozedUntil ?? null,
    startMonths: t.startMonths ?? null,
    lateMonths: t.lateMonths ?? null
  }
}

export function normalizeCustomTask(task) {
  const t = task ?? {}
  return {
    id: t.id,
    title: String(t.title ?? ''),
    notes: t.notes ?? null,
    dueDate: t.dueDate ?? null,
    doneAt: t.doneAt ?? null,
    createdAt: t.createdAt ?? null
  }
}

const progressOf = p => ({ done: p?.done ?? 0, total: p?.total ?? 0, ratio: p?.ratio ?? 0 })

export function normalizeNext(data) {
  const d = data ?? {}
  return {
    mode: d.mode ?? 'normal',
    monthsLeft: d.monthsLeft ?? null,
    daysLeft: d.daysLeft ?? null,
    steps: asArray(d.steps).map(normalizeTask),
    allSet: !!d.allSet,
    progress: progressOf(d.progress)
  }
}

export function normalizePlan(data) {
  const d = data ?? {}
  return {
    mode: d.mode ?? 'normal',
    monthsLeft: d.monthsLeft ?? null,
    daysLeft: d.daysLeft ?? null,
    progress: progressOf(d.progress),
    phases: asArray(d.phases).map(p => ({ key: p.key, label: p.label ?? '', tasks: asArray(p.tasks).map(normalizeTask) })),
    overdue: asArray(d.overdue).map(normalizeTask),
    hidden: asArray(d.hidden).map(normalizeTask),
    custom: asArray(d.custom).map(normalizeCustomTask)
  }
}

/** Done tasks go last inside a phase; the server's order is otherwise kept. */
const doneLast = tasks => [...tasks.filter(t => t.state !== 'done'), ...tasks.filter(t => t.state === 'done')]

/**
 * Put the task the server just returned where it belongs without waiting for a full reload: out of every list it was
 * in, then into `hidden` or back into its phase (same place when it was already there). A quiet reload follows to
 * fix progress and order.
 */
export function applyTask(plan, task) {
  if (!plan) return plan
  const isHidden = task.state === 'hidden' || task.state === 'not_applicable'
  let placed = false
  const phases = plan.phases.map(phase => {
    const index = phase.tasks.findIndex(t => t.key === task.key)
    if (index !== -1 && !isHidden) {
      placed = true
      const tasks = phase.tasks.slice()
      tasks[index] = task
      return { ...phase, tasks: doneLast(tasks) }
    }
    if (index !== -1) return { ...phase, tasks: phase.tasks.filter(t => t.key !== task.key) }
    return phase
  })
  if (!isHidden && !placed) {
    const target = phases.find(p => p.key === task.phase)
    if (target) target.tasks = doneLast([...target.tasks, task])
  }
  const hidden = plan.hidden.filter(t => t.key !== task.key)
  if (isHidden) hidden.push(task)
  const overdue = plan.overdue.filter(t => t.key !== task.key)
  if (task.state === 'overdue') overdue.push(task)
  return { ...plan, phases, hidden, overdue }
}

/**
 * What the dashboard card shows from `assistant/next`:
 * - `null`: nothing usable (not loaded, unsupported event type, or no steps and nothing done) -> use `pickNextStep`
 * - `{ key: 'set_date', local: true }`: the event has no date (`no_date`)
 * - `{ key: 'allSet' }`: nothing pending and something done
 * - a task (`{ key, title, reason, route, state }`) plus `total` (how many steps the server suggests)
 */
export function cardFromNext(next) {
  if (!next || next.mode === 'unsupported') return null
  if (next.mode === 'no_date') return { key: 'set_date', local: true }
  const first = next.steps?.[0]
  if (first) return { ...first, total: next.steps.length }
  if (next.allSet) return { key: 'allSet' }
  return null
}

/** Title of a prerequisite key, found among the plan's tasks (falls back to nothing: the key is not for people). */
export function titleIndex(plan) {
  const index = {}
  for (const task of [...(plan?.phases ?? []).flatMap(p => p.tasks), ...(plan?.hidden ?? [])]) index[task.key] = task.title
  return index
}

/** Whole plan has nothing to show (no tasks of any kind). */
export function planIsEmpty(plan) {
  return !plan || (!plan.phases.some(p => p.tasks.length) && !plan.hidden.length && !plan.custom.length)
}

/** Validation of the custom task form, with the contract's error codes. */
export function validateCustomTask({ title, notes, dueDate }) {
  const errors = {}
  const trimmed = (title ?? '').trim()
  if (!trimmed) errors.title = 'required'
  else if (trimmed.length > 120) errors.title = 'too_long'
  if ((notes ?? '').trim().length > 500) errors.notes = 'too_long'
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) errors.dueDate = 'invalid_date'
  return errors
}

/** Maps the API's `errors` object (snake_case fields) to `{ title, notes, dueDate }` codes. */
export function apiFieldErrors(data) {
  const e = data?.errors ?? {}
  return {
    ...(e.title?.[0] && { title: e.title[0] }),
    ...(e.notes?.[0] && { notes: e.notes[0] }),
    ...(e.due_date?.[0] && { dueDate: e.due_date[0] })
  }
}
