import { describe, it, expect } from 'vitest'
import { sortEvents } from '../eventList'

const now = new Date(2026, 10, 14, 12, 0)
const ev = (id, startDate) => ({ id, startDate })

describe('sortEvents', () => {
  it('puts upcoming first (soonest on top), then past (latest first), then undated', () => {
    const list = [ev('past-old', '01/10/2026 18:00'), ev('later', '06/20/2027 18:00'), ev('none', null), ev('soon', '12/25/2026 18:00'), ev('past-new', '10/01/2026 18:00')]
    expect(sortEvents(list, now).map(e => e.id)).toEqual(['soon', 'later', 'past-new', 'past-old', 'none'])
  })
  it('counts an event that is today as upcoming', () => {
    expect(sortEvents([ev('past', '11/01/2026 10:00'), ev('today', '11/14/2026 08:00')], now).map(e => e.id)).toEqual(['today', 'past'])
  })
  it('does not mutate its input and handles an empty list', () => {
    const list = [ev('b', '12/25/2026 18:00'), ev('a', '11/20/2026 18:00')]
    sortEvents(list, now)
    expect(list.map(e => e.id)).toEqual(['b', 'a'])
    expect(sortEvents([], now)).toEqual([])
  })
})
