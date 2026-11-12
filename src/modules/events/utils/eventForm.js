/**
 * Pure helpers for the event forms: no stores, no Vue.
 * The API speaks `m/d/Y H:i` for dates (the event's wall time); the form uses `<input type="datetime-local">`.
 */

const pad = n => String(n).padStart(2, '0')

/** `12/25/2026 18:30` -> `2026-12-25T18:30` ('' when empty or not understood). */
export function apiToInput(value) {
  const m = String(value ?? '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?: (\d{1,2}):(\d{2}))?/)
  if (!m) return ''
  const [, month, day, year, hour = '0', minute = '0'] = m
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${minute}`
}

/** `2026-12-25T18:30` -> `12/25/2026 18:30` ('' when empty or not understood). */
export function inputToApi(value) {
  const m = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!m) return ''
  const [, year, month, day, hour, minute] = m
  return `${month}/${day}/${year} ${hour}:${minute}`
}

/**
 * A readable public address from a name, like the server builds it: `Los XV de Valentina` -> `los-xv-de-valentina`.
 * Accents are dropped, anything that is not a letter or digit becomes a single hyphen, at most 50 characters.
 */
export function slugify(name) {
  const slug = String(name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '')
  return slug
}

/** Same rule the API applies to a typed address. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Form values of an event, as the edit form shows them. */
export function formFromEvent(event) {
  return {
    eventName: event?.eventName ?? '',
    eventDescription: event?.eventDescription ?? '',
    startDate: apiToInput(event?.startDate),
    endDate: apiToInput(event?.endDate),
    customUrlSlug: event?.customUrlSlug ?? ''
  }
}

/**
 * Only the fields that changed, ready for `PATCH`: dates in the API format, an emptied end date or description as null.
 * The address is left out when it is locked, so a locked event never sends it.
 */
export function buildPatch(original, current, { slugLocked = false } = {}) {
  const patch = {}
  if (current.eventName.trim() !== original.eventName.trim()) patch.eventName = current.eventName.trim()
  if (current.eventDescription.trim() !== original.eventDescription.trim()) {
    patch.eventDescription = current.eventDescription.trim() || null
  }
  if (current.startDate !== original.startDate) patch.startDate = inputToApi(current.startDate)
  if (current.endDate !== original.endDate) patch.endDate = current.endDate ? inputToApi(current.endDate) : null
  if (!slugLocked && current.customUrlSlug !== original.customUrlSlug) patch.customUrlSlug = current.customUrlSlug
  return patch
}

/** First error message per field from a Laravel 422 body (`{ errors: { field: [..] } }`). */
export function fieldErrors(error) {
  const errors = error?.response?.data?.errors ?? {}
  return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, Array.isArray(messages) ? messages[0] : String(messages)]))
}
