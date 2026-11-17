import { describe, it, expect } from 'vitest'
import { parseEventDate, daysUntil, summarizeRsvp, rsvpShares, readiness, countdownInfo, statsFigures } from '../dashboardLogic'

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

describe('readiness', () => {
  const base = { hasDate: true, guestCount: 0, published: false, budgetEnabled: false, budgetItems: 0 }
  it('counts only what is really done', () => {
    expect(readiness(base)).toEqual({ done: 1, total: 3, ratio: 1 / 3 })
    expect(readiness({ ...base, guestCount: 12, published: true })).toMatchObject({ done: 3, ratio: 1 })
  })
  it('adds the budget only when the plan has it', () => {
    expect(readiness({ ...base, budgetEnabled: true })).toMatchObject({ done: 1, total: 4 })
    expect(readiness({ ...base, budgetEnabled: true, budgetItems: 2 })).toMatchObject({ done: 2, total: 4 })
  })
  it('is 0 with nothing done', () => expect(readiness({ ...base, hasDate: false }).ratio).toBe(0))
})

describe('countdownInfo', () => {
  it('has no date, past, today and future', () => {
    expect(countdownInfo(null).kind).toBe('none')
    expect(countdownInfo(-3).kind).toBe('past')
    expect(countdownInfo(0).kind).toBe('today')
    expect(countdownInfo(142)).toEqual({ kind: 'future', n: 142 })
  })
})

describe('statsFigures', () => {
  it('lists the four figures with people (companions included) as the total', () => {
    const f = statsFigures({ attending: 5, pending: 3, declined: 1, people: 9 })
    expect(f.empty).toBe(false)
    expect(f.items.map(i => [i.key, i.value])).toEqual([['attending', 5], ['pending', 3], ['declined', 1], ['total', 9]])
  })
  it('is empty with nobody on the list', () => {
    expect(statsFigures({ attending: 0, pending: 0, declined: 0, people: 0 }).empty).toBe(true)
  })
})
