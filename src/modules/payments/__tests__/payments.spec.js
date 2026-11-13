import { describe, it, expect, vi } from 'vitest'
import { formatMoney, waitForUnlock, isInvalidCode } from '../utils/money'

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
