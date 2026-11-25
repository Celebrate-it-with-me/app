/**
 * What the screens show about the launch offer. The price is always decided by the API: this only reads the
 * `offer` block of a quote (`{ active, priceCents, listPriceCents, slotsLeft, totalSlots }`) and the 409/422 answers of the checkout.
 */

/** The offer is applied to this quote (no code needed): the API says it is open and priced the quote with it. */
export function offerApplies(quote) {
  return Boolean(quote?.offer?.active) && quote?.source === 'offer'
}

/** Slots left to show ("quedan 37 de 100"), or null when the API does not give a usable count. */
export function slotsLeftOf(quote) {
  const offer = quote?.offer
  if (!offer?.active || !(offer.totalSlots > 0) || !Number.isFinite(offer.slotsLeft) || offer.slotsLeft <= 0) return null
  return Math.min(offer.slotsLeft, offer.totalSlots)
}

/** Minutes a pending payment holds a slot: the API's `holdMinutes`, 60 when an older API does not send it. */
export function holdMinutesOf(quote) {
  const minutes = Number(quote?.offer?.holdMinutes)
  return Number.isInteger(minutes) && minutes > 0 ? minutes : 60
}

/**
 * Why the offer does not apply to her, from the API's `offer.reason` (null | inactive | closed | exhausted | holds_full):
 * 'exhausted' and 'holds_full' deserve a notice; 'inactive' and 'closed' are just the normal price (no notice).
 * An older API without `reason` falls back to the old deduction: slots existed and none are left = exhausted.
 */
export function offerNotice(quote) {
  const offer = quote?.offer
  if (!offer || offer.active) return null
  if (offer.reason !== undefined) return ['exhausted', 'holds_full'].includes(offer.reason) ? offer.reason : null
  return offer.totalSlots > 0 && offer.slotsLeft <= 0 ? 'exhausted' : null
}

/**
 * The checkout/quote answers that need a message of their own:
 * - `price_changed` (409): the price moved while she looked; `data.amountCents` is the new one.
 * - `launch_offer_exhausted` (422 on `code`): a code tied to the offer arrived after the offer ended.
 * - `previous_session_open` / `payment_in_progress` / `checkout_in_progress` (409): another payment of this event is still open.
 * Anything else answers null.
 */
export function checkoutProblem(error) {
  const status = error?.response?.status
  const data = error?.response?.data ?? {}
  if (status === 409 && data.code === 'price_changed') return { kind: 'price_changed', amountCents: data.data?.amountCents ?? null, offer: data.data?.offer ?? null }
  if (status === 409 && data.code === 'previous_session_open') return { kind: 'previous_session_open' }
  if (status === 409 && ['payment_in_progress', 'checkout_in_progress'].includes(data.code)) return { kind: 'payment_in_progress' }
  if (status === 422 && data.errors?.code?.includes('launch_offer_exhausted')) return { kind: 'exhausted' }
  return null
}
