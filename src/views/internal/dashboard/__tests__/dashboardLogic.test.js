import { describe, it, expect } from 'vitest'
import { parseEventDate, daysUntil, summarizeRsvp, rsvpShares, pickNextStep } from '../dashboardLogic'

describe('parseEventDate', () => {
  it('reads the API format as wall time', () => {
    const d = parseEventDate('12/25/2026 18:30')
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 11, 25, 18, 30])
  })
  it('accepts a date without time and ISO strings', () => {
    expect(parseEventDate('01/05/2027').getDate()).toBe(5)
    expect(parseEventDate('2027-03-04T10:00:00')).toBeInstanceOf(Date)
  })
  it('returns null for empty or garbage', () => {
    expect(parseEventDate(null)).toBeNull()
    expect(parseEventDate('nope')).toBeNull()
  })
})

describe('daysUntil', () => {
  const now = new Date(2026, 10, 12, 23, 30)
  it('counts calendar days, not 24h blocks', () => {
    expect(daysUntil(new Date(2026, 10, 13, 0, 5), now)).toBe(1)
    expect(daysUntil(new Date(2026, 10, 12, 8, 0), now)).toBe(0)
    expect(daysUntil(new Date(2026, 10, 10, 8, 0), now)).toBe(-2)
  })
  it('is null without a date', () => expect(daysUntil(null, now)).toBeNull())
})

describe('summarizeRsvp', () => {
  it('maps the stats payload', () => {
    const r = summarizeRsvp({
      data: {
        attending: { total: 29, guests: 20 },
        pending: { total: 7, guests: 5 },
        not_attending: { total: 3 },
        totals: { people: 39, guests: 25 },
        response_rate: 80
      }
    })
    expect(r).toMatchObject({ attending: 29, pending: 7, declined: 3, people: 39, pendingGuests: 5, responseRate: 80 })
  })
  it('is all zeros when stats are missing', () => {
    expect(summarizeRsvp({})).toMatchObject({ attending: 0, pending: 0, declined: 0, people: 0 })
  })
})

describe('rsvpShares', () => {
  it('always adds up to 100', () => {
    const s = rsvpShares({ attending: 1, pending: 1, declined: 1 })
    expect(s.attending + s.pending + s.declined).toBe(100)
  })
  it('is zero with no one invited', () => {
    expect(rsvpShares({ attending: 0, pending: 0, declined: 0 })).toEqual({ attending: 0, pending: 0, declined: 0 })
  })
})

describe('pickNextStep', () => {
  const base = { guestCount: 10, status: 'published', pendingGuests: 0, rsvpEnabled: true, budgetEnabled: true, budgetItems: 3 }
  it('asks for guests first', () => expect(pickNextStep({ ...base, guestCount: 0 }).id).toBe('addGuests'))
  it('then to publish a draft', () => expect(pickNextStep({ ...base, status: 'draft' }).id).toBe('publish'))
  it('then to chase pending guests', () => {
    expect(pickNextStep({ ...base, pendingGuests: 4 })).toMatchObject({ id: 'pendingGuests', count: 4 })
  })
  it('ignores pending guests when RSVP is off', () => {
    expect(pickNextStep({ ...base, pendingGuests: 4, rsvpEnabled: false }).id).toBe('allSet')
  })
  it('suggests the budget only when it is enabled and empty', () => {
    expect(pickNextStep({ ...base, budgetItems: 0 }).id).toBe('budget')
    expect(pickNextStep({ ...base, budgetItems: 0, budgetEnabled: false }).id).toBe('allSet')
  })
})
