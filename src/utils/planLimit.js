/**
 * The API answers 402 when the event's plan does not allow what was asked
 * (`{ code: 'guest_limit_exceeded', limit, total, excess, upgrade: true }`). The screens translate by `code`
 * and use the numbers, so the message says exactly what to do ("remove 17 guests").
 */

export const GUEST_LIMIT = 'guest_limit_exceeded'

/** The limit details of a failed request, or null when the error is something else. */
export function planLimitFrom(error) {
  const data = error?.response?.data
  if (error?.response?.status !== 402 || !data?.code) return null
  return { code: data.code, limit: data.limit ?? 0, total: data.total ?? 0, excess: data.excess ?? 0 }
}

/**
 * How far over the limit an event is, from what the API sent with it (`guestLimit`, `guestsCount`).
 * Returns null when the plan has no limit or the list fits.
 */
export function guestOverflow(event) {
  const limit = event?.guestLimit
  const total = event?.guestsCount ?? 0
  if (!limit || total <= limit) return null
  return { limit, total, excess: total - limit }
}

/**
 * The sentence for a limit, in the current language. `context`: 'publish' (the list is too long to publish) or
 * 'add' (the event is published and the cap is hard). Needs `t` from vue-i18n.
 */
export function planLimitMessage(t, { limit, total, excess }, context = 'publish') {
  const remove = t('limits.guests.removeCount', { n: excess }, excess) // "1 invitado" / "17 invitados"
  return t(context === 'add' ? 'limits.guests.addBlocked' : 'limits.guests.publishBlocked', { limit, total, excess, remove })
}
