import { describe, it, expect } from 'vitest'
import { checkoutProblem, holdMinutesOf, offerApplies, offerNotice, slotsLeftOf } from '../utils/launchOffer'

const offer = (over = {}) => ({ active: true, priceCents: 7900, listPriceCents: 9900, slotsLeft: 37, totalSlots: 100, ...over })
const err = (status, data) => ({ response: { status, data } })

describe('launch offer helpers', () => {
  it('applies only when the offer is open and priced the quote', () => {
    expect(offerApplies({ source: 'offer', offer: offer() })).toBe(true)
    expect(offerApplies({ source: 'list', offer: offer() })).toBe(false)
    expect(offerApplies({ source: 'offer', offer: offer({ active: false }) })).toBe(false)
    expect(offerApplies(null)).toBe(false)
  })

  it('gives the slots left only when the API gives a usable count', () => {
    expect(slotsLeftOf({ offer: offer() })).toBe(37)
    expect(slotsLeftOf({ offer: offer({ slotsLeft: 500 }) })).toBe(100)
    expect(slotsLeftOf({ offer: offer({ slotsLeft: 0 }) })).toBeNull()
    expect(slotsLeftOf({ offer: offer({ totalSlots: 0 }) })).toBeNull()
    expect(slotsLeftOf({ offer: offer({ slotsLeft: undefined }) })).toBeNull()
    expect(slotsLeftOf({ offer: offer({ active: false }) })).toBeNull()
    expect(slotsLeftOf({})).toBeNull()
  })

  it('says sold out only when there were slots and none are left', () => {
    const closed = reason => ({ offer: offer({ active: false, reason }) })
    expect(offerNotice(closed('exhausted'))).toBe('exhausted')
    expect(offerNotice(closed('holds_full'))).toBe('holds_full')
    expect(offerNotice(closed('inactive'))).toBeNull() // just the normal price
    expect(offerNotice(closed('closed'))).toBeNull()
    expect(offerNotice(closed(null))).toBeNull()
    expect(offerNotice({ offer: offer({ reason: null }) })).toBeNull() // open
    expect(offerNotice({})).toBeNull()
    // an older API without `reason`: the old deduction
    expect(offerNotice({ offer: offer({ active: false, slotsLeft: 0 }) })).toBe('exhausted')
    expect(offerNotice({ offer: offer({ active: false, slotsLeft: 5 }) })).toBeNull()
    expect(offerNotice({ offer: offer({ active: false, slotsLeft: 0, totalSlots: 0 }) })).toBeNull()
  })

  it('reads the hold minutes from the API and falls back to 60', () => {
    expect(holdMinutesOf({ offer: offer({ holdMinutes: 30 }) })).toBe(30)
    expect(holdMinutesOf({ offer: offer() })).toBe(60)
    expect(holdMinutesOf({ offer: offer({ holdMinutes: 0 }) })).toBe(60)
    expect(holdMinutesOf(null)).toBe(60)
  })

  it('classifies each checkout answer', () => {
    expect(checkoutProblem(err(409, { code: 'price_changed', data: { amountCents: 9900 } }))).toMatchObject({ kind: 'price_changed', amountCents: 9900 })
    expect(checkoutProblem(err(409, { code: 'price_changed' }))).toMatchObject({ kind: 'price_changed', amountCents: null })
    expect(checkoutProblem(err(409, { code: 'previous_session_open' }))).toEqual({ kind: 'previous_session_open' })
    expect(checkoutProblem(err(409, { code: 'payment_in_progress' }))).toEqual({ kind: 'payment_in_progress' })
    expect(checkoutProblem(err(409, { code: 'checkout_in_progress' }))).toEqual({ kind: 'payment_in_progress' })
    expect(checkoutProblem(err(422, { errors: { code: ['launch_offer_exhausted'] } }))).toEqual({ kind: 'exhausted' })
    expect(checkoutProblem(err(422, { errors: { code: ['invalid'] } }))).toBeNull()
    expect(checkoutProblem(err(500, {}))).toBeNull()
    expect(checkoutProblem(undefined)).toBeNull()
  })
})
