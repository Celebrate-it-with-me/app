import { describe, it, expect } from 'vitest'
import { planLimitFrom, guestOverflow, planLimitMessage, GUEST_LIMIT } from '../planLimit'

const error402 = { response: { status: 402, data: { code: GUEST_LIMIT, limit: 30, total: 47, excess: 17, upgrade: true } } }

describe('planLimitFrom', () => {
  it('reads the numbers of a plan limit error', () => {
    expect(planLimitFrom(error402)).toEqual({ code: GUEST_LIMIT, limit: 30, total: 47, excess: 17 })
  })
  it('is null for any other error', () => {
    expect(planLimitFrom({ response: { status: 422, data: { code: 'x' } } })).toBeNull()
    expect(planLimitFrom({ response: { status: 402, data: {} } })).toBeNull()
    expect(planLimitFrom(new Error('boom'))).toBeNull()
    expect(planLimitFrom(null)).toBeNull()
  })
})

describe('guestOverflow', () => {
  it('tells how far over the limit the list is', () => {
    expect(guestOverflow({ guestLimit: 30, guestsCount: 47 })).toEqual({ limit: 30, total: 47, excess: 17 })
  })
  it('is null when the list fits, is exactly at the limit, or the plan has no limit', () => {
    expect(guestOverflow({ guestLimit: 30, guestsCount: 30 })).toBeNull()
    expect(guestOverflow({ guestLimit: 30, guestsCount: 12 })).toBeNull()
    expect(guestOverflow({ guestLimit: null, guestsCount: 500 })).toBeNull()
    expect(guestOverflow(null)).toBeNull()
  })
})

describe('planLimitMessage', () => {
  const t = (key, params) => (key === 'limits.guests.removeCount' ? `${params.n} guests` : `${key}|${JSON.stringify(params)}`)
  it('passes the numbers, and how many guests to remove, to the right text', () => {
    expect(planLimitMessage(t, { limit: 30, total: 47, excess: 17 })).toBe(
      'limits.guests.publishBlocked|{"limit":30,"total":47,"excess":17,"remove":"17 guests"}'
    )
    expect(planLimitMessage(t, { limit: 30, total: 31, excess: 1 }, 'add')).toContain('limits.guests.addBlocked')
  })
})
