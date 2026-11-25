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

/** The campaign ran out: there were slots and none are left (not the same as "off" or "this buyer is at her hold limit"). */
export function offerSoldOut(quote) {
  const offer = quote?.offer
  return Boolean(offer) && !offer.active && offer.totalSlots > 0 && offer.slotsLeft <= 0
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
