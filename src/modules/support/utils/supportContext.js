/**
 * Pure logic of the help button: message limits, the context sent with a request, and when the button hides.
 * The API (POST /support) accepts only these context keys, scalar values up to 300 characters, 2000 in total.
 */

export const MESSAGE_MIN = 5
export const MESSAGE_MAX = 2000
export const VALUE_MAX = 300
export const CONTEXT_MAX = 2000
/** Dropped first when the context is too big (the least useful ones last in this list). */
export const CONTEXT_KEYS = ['screen', 'route', 'eventId', 'eventName', 'plan', 'browser', 'language', 'viewport']

/** null when the message can be sent; otherwise the error key under `support.errors`. */
export function validateMessage(message) {
  const length = String(message ?? '').trim().length
  if (length < MESSAGE_MIN) return 'tooShort'
  if (length > MESSAGE_MAX) return 'tooLong'
  return null
}

/** "Chrome 126 · Android" from a user agent; falls back to a trimmed UA. */
export function browserLabel(userAgent = '') {
  const ua = String(userAgent)
  const browser =
    /Edg\/(\d+)/.exec(ua)?.[0].replace('Edg/', 'Edge ') ??
    /OPR\/(\d+)/.exec(ua)?.[0].replace('OPR/', 'Opera ') ??
    /Firefox\/(\d+)/.exec(ua)?.[0].replace('Firefox/', 'Firefox ') ??
    /Chrome\/(\d+)/.exec(ua)?.[0].replace('Chrome/', 'Chrome ') ??
    (/Safari\//.test(ua) && /Version\/(\d+)/.exec(ua)?.[0].replace('Version/', 'Safari ')) ??
    null
  const system = /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : null
  const label = [browser || null, system].filter(Boolean).join(' · ')
  return label || ua.slice(0, VALUE_MAX)
}

/** The event's plan as the organizer sees it: events on the free plan carry a guest limit, the full one has none. */
export function planOf(event) {
  if (!event) return null
  return event.guestLimit ? 'free' : 'full'
}

/** Keeps only scalar, non-empty values, cut to VALUE_MAX, and drops keys until the total fits CONTEXT_MAX. */
export function clampContext(context) {
  const clean = {}
  for (const key of CONTEXT_KEYS) {
    const value = context?.[key]
    if (value === null || value === undefined || typeof value === 'object') continue
    const text = String(value).trim()
    if (text === '') continue
    clean[key] = typeof value === 'number' ? value : text.slice(0, VALUE_MAX)
  }
  const droppable = [...CONTEXT_KEYS].reverse()
  while (JSON.stringify(clean).length > CONTEXT_MAX && droppable.length) delete clean[droppable.shift()]
  return clean
}

/** Context the help button attaches automatically. All inputs are plain values so it can be tested. */
export function buildContext({ route, event, locale, userAgent, viewport } = {}) {
  return clampContext({
    screen: route?.meta?.title || (typeof route?.name === 'string' ? route.name : null),
    route: route?.fullPath ?? route?.path ?? null,
    eventId: event?.id ?? null,
    eventName: event?.eventName ?? null,
    plan: planOf(event),
    browser: browserLabel(userAgent),
    language: locale ?? null,
    viewport: viewport?.width && viewport?.height ? `${viewport.width}x${viewport.height}` : null
  })
}

/** Body of POST /support. `eventId` is sent only when there is an active event. */
export function buildPayload({ message, event, context }) {
  const payload = { message: String(message).trim(), context }
  if (event?.id) payload.eventId = event.id
  return payload
}

/** A field where the person types a lot (the save button must stay reachable): textareas and rich text. */
export function isLongField(el) {
  if (!el || typeof el.tagName !== 'string') return false
  if (el.tagName === 'TEXTAREA') return true
  return el.isContentEditable === true
}

/** The button hides while another modal is open or a long field has the focus; `ownSheetOpen` never hides it. */
export function isButtonHidden({ foreignDialogOpen, focusedElement }) {
  return Boolean(foreignDialogOpen) || isLongField(focusedElement)
}

/** Error key under `support.errors` for a failed request. */
export function errorKeyFor(error) {
  const status = error?.response?.status
  if (status === 429) return 'tooMany'
  if (status === 422) return 'invalid'
  return 'generic'
}
