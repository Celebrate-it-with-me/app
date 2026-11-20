import { describe, it, expect, vi } from 'vitest'
import { formatMoney, waitForUnlock, waitForOutcome, isInvalidCode, isAlreadyUnlocked, isPaymentInProgress } from '../utils/money'

describe('formatMoney', () => {
  it('shows whole dollars without decimals', () => expect(formatMoney(9900, 'USD', 'en')).toBe('$99'))
  it('keeps the cents when there are some', () => expect(formatMoney(7950, 'USD', 'en')).toBe('$79.50'))
  it('shows zero', () => expect(formatMoney(0, 'USD', 'en')).toBe('$0'))
})

describe('formatMoney in Spanish', () => {
  it('writes $99, not 99 US$', () => expect(formatMoney(9900, 'USD', 'es')).toBe('$99'))
})

describe('waitForUnlock', () => {
  const sleep = vi.fn(() => Promise.resolve())
  it('stops as soon as the event is unlocked', async () => {
    const check = vi.fn().mockResolvedValueOnce({ unlocked: false }).mockResolvedValueOnce({ unlocked: true })
    expect(await waitForUnlock(check, { sleep })).toBe(true)
    expect(check).toHaveBeenCalledTimes(2)
  })
  it('gives up after the tries', async () => {
    const check = vi.fn().mockResolvedValue({ unlocked: false })
    expect(await waitForUnlock(check, { tries: 3, sleep })).toBe(false)
    expect(check).toHaveBeenCalledTimes(3)
  })
})

describe('isInvalidCode', () => {
  it('only for a 422 that blames the code', () => {
    expect(isInvalidCode({ response: { status: 422, data: { errors: { code: ['invalid_code'] } } } })).toBe(true)
    expect(isInvalidCode({ response: { status: 422, data: { errors: { event: ['x'] } } } })).toBe(false)
    expect(isInvalidCode({ response: { status: 500 } })).toBe(false)
    expect(isInvalidCode(undefined)).toBe(false)
  })
})

describe('waitForOutcome', () => {
  const sleep = vi.fn(() => Promise.resolve())
  it('returns as soon as it is unlocked', async () => {
    const check = vi.fn().mockResolvedValueOnce({ status: 'pending' }).mockResolvedValueOnce({ unlocked: true, status: 'paid' })
    expect((await waitForOutcome(check, { sleep })).status).toBe('paid')
  })
  it.each(['failed', 'refunded', 'chargeback'])('stops on %s', async status => {
    const check = vi.fn().mockResolvedValue({ unlocked: false, status })
    expect((await waitForOutcome(check, { sleep })).status).toBe(status)
    expect(check).toHaveBeenCalledTimes(1)
  })
  it('gives null when still pending', async () => {
    const check = vi.fn().mockResolvedValue({ unlocked: false, status: 'pending' })
    expect(await waitForOutcome(check, { tries: 2, sleep })).toBeNull()
  })
})

describe('isAlreadyUnlocked', () => {
  it('only for the 422 that blames the event', () => {
    expect(isAlreadyUnlocked({ response: { status: 422, data: { errors: { event: ['already_unlocked'] } } } })).toBe(true)
    expect(isAlreadyUnlocked({ response: { status: 422, data: { errors: { event: ['other'] } } } })).toBe(false)
    expect(isAlreadyUnlocked({ response: { status: 422, data: { errors: { code: ['x'] } } } })).toBe(false)
    expect(isAlreadyUnlocked({ response: { status: 500 } })).toBe(false)
    expect(isAlreadyUnlocked(undefined)).toBe(false)
  })
})

describe('isPaymentInProgress', () => {
  it('only for the two 409 codes', () => {
    expect(isPaymentInProgress({ response: { status: 409, data: { code: 'checkout_in_progress' } } })).toBe(true)
    expect(isPaymentInProgress({ response: { status: 409, data: { code: 'payment_in_progress' } } })).toBe(true)
    expect(isPaymentInProgress({ response: { status: 409, data: { code: 'not_pending' } } })).toBe(false)
    expect(isPaymentInProgress({ response: { status: 500, data: { code: 'payment_in_progress' } } })).toBe(false)
    expect(isPaymentInProgress(undefined)).toBe(false)
  })
})
