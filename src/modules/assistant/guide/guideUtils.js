/**
 * Pure helpers of the floating guide "Tu siguiente paso" (no Vue, no stores). Data comes from `assistant/next`
 * (docs/plans/assistant-contract.md); the guide only decides what to show and how loudly.
 */

/**
 * Screens where the next step already has its own place on the page (the Inicio's "Lo que toca ahora"): the guide is
 * only the help icon there. Exact paths, so the rest of /dashboard/* keeps the guide.
 */
export const HELP_ONLY_ROUTES = [/^\/dashboard\/?$/]

export const isHelpOnlyRoute = path => typeof path === 'string' && HELP_ONLY_ROUTES.some(re => re.test(path))

/** Routes without the assistant at all (no button, badge, status or welcome bubble): "Mi cuenta" is about the person, not the event. */
export const NO_GUIDE_ROUTES = [/^\/settings(\/|$)/]

export const isGuideHiddenRoute = path => typeof path === 'string' && NO_GUIDE_ROUTES.some(re => re.test(path))

/** Tone of the copy: weddings are more sober, everything else (quince) is warm and festive. */
export const toneFor = slug => (slug === 'wedding' ? 'wedding' : 'quince')

/** Days a task rests after "Ahora no". The API takes 1-90. */
export const SNOOZE_DAYS = 7

/** What the guide has to show for an `assistant/next` answer. */
export function guideView(next) {
  if (!next || next.mode === 'unsupported') return { kind: 'help' }
  if (next.mode === 'no_date') return { kind: 'setDate' }
  const [task, ...rest] = next.steps ?? []
  if (task) return { kind: 'task', task, after: rest.slice(0, 2) }
  if (next.allSet) return { kind: 'allSet' }
  return { kind: 'help' }
}

export const percentOf = progress => Math.max(0, Math.min(100, Math.round((progress?.ratio ?? 0) * 100)))

/** "Faltan N días" below ~3 months, months above. Null when the date is today, past, or unknown. */
export function countdown(next) {
  const days = next?.daysLeft
  if (typeof days !== 'number' || days <= 0) return null
  if (days >= 90) return { unit: 'months', n: Math.max(3, Math.round(next.monthsLeft ?? days / 30.4)) }
  return { unit: 'days', n: days }
}

/* ---- Memory in the browser. Everything is try/catch: private windows and blocked storage must never break the guide. ---- */

const SEEN_KEY = eventId => `quinvite:guide:seen:${eventId}`
export const WELCOMED_KEY = 'quinvite:guide:welcomed'

const read = (storage, key) => {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}
const write = (storage, key, value) => {
  try {
    storage?.setItem(key, value)
    return true
  } catch {
    return false
  }
}
const local = () => (typeof window === 'undefined' ? null : window.localStorage)

export const getSeenKey = eventId => read(local(), SEEN_KEY(eventId))
export const setSeenKey = (eventId, taskKey) => write(local(), SEEN_KEY(eventId), String(taskKey))

/** The pink dot shows for a task she has not seen yet. */
export const hasNewDot = (view, seenKey) => view?.kind === 'task' && view.task.key !== seenKey

export const wasWelcomed = () => read(local(), WELCOMED_KEY) === '1'
export const markWelcomed = () => write(local(), WELCOMED_KEY, '1')
