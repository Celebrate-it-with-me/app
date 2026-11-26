import { describe, it, expect } from 'vitest'
import {
  parseWallClock,
  wallClockToIso,
  formatWallClock,
  formatEventDate,
  formatClock,
  eventMoment,
  eventDay,
  endsNextDay,
  daysUntilEvent,
  eventDate,
  hasClock,
  DATE_STYLES
} from '../eventDateTime'

describe('parseWallClock', () => {
  it('reads the API format MM/DD/YYYY HH:mm (January 2 is the 2nd, not February 1st)', () => {
    expect(parseWallClock('01/02/2027 16:30')).toEqual({ year: 2027, month: 1, day: 2, hour: 16, minute: 30 })
  })

  it.each([
    ['2027-01-02 16:30:00', 16],
    ['2027-01-02T16:30', 16],
    ['2027-01-02T16:30:00.000', 16],
    ['2027-01-02', 0]
  ])('reads %s', (text, hour) => {
    expect(parseWallClock(text)).toMatchObject({ year: 2027, month: 1, day: 2, hour })
  })

  it('reads a date without time as midnight', () => {
    expect(parseWallClock('01/02/2027')).toMatchObject({ hour: 0, minute: 0 })
  })

  it.each([null, undefined, '', 'nope', '13/45/2027 10:00', '02/30/2027 10:00', '2027-01-02 25:00', '2027-01-02 10:75', '2027-01-02T16:30Z', 42])(
    'does not understand %s',
    value => expect(parseWallClock(value)).toBeNull()
  )
})

describe('wallClockToIso', () => {
  it('normalizes every accepted shape', () => {
    expect(wallClockToIso('01/02/2027 04:05')).toBe('2027-01-02T04:05:00')
    expect(wallClockToIso('2027-01-02 04:05:59')).toBe('2027-01-02T04:05:00')
    expect(wallClockToIso('bad')).toBe('')
  })
})

describe('formatEventDate', () => {
  const wall = '01/02/2027 16:30'

  it('spells the date out in Spanish and English', () => {
    expect(formatEventDate(wall, 'date', 'es')).toBe('2 de enero de 2027')
    expect(formatEventDate(wall, 'date', 'en')).toBe('January 2, 2027')
    expect(formatEventDate(wall, 'dateShort', 'es')).toBe('2 ene 2027')
    expect(formatEventDate(wall, 'dayMonth', 'en')).toBe('January 2')
    expect(formatEventDate(wall, 'weekdayDate', 'es')).toBe('sábado, 2 de enero de 2027')
  })

  it('uses a 12 hour clock', () => {
    expect(formatEventDate(wall, 'time', 'es')).toMatch(/^4:30 p\.\s?m\.$/)
    expect(formatEventDate(wall, 'time', 'en')).toBe('4:30 PM')
    expect(formatEventDate('01/02/2027 00:05', 'time', 'en')).toBe('12:05 AM')
    expect(formatEventDate(wall, 'dateTime', 'en')).toBe('Jan 2, 2027, 4:30 PM')
    expect(formatEventDate(wall, 'dayTime', 'en')).toBe('Jan 2, 4:30 PM')
  })

  it('never prints a numeric date like 01/02/2027, in any style', () => {
    for (const style of DATE_STYLES) {
      for (const locale of ['es', 'en']) expect(formatEventDate(wall, style, locale)).not.toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
    }
  })

  it('falls back to the date style for an unknown style and to Spanish for an unknown language', () => {
    expect(formatEventDate(wall, 'nope', 'es')).toBe('2 de enero de 2027')
    expect(formatEventDate(wall, 'date', 'fr')).toBe('2 de enero de 2027')
  })

  it('returns an empty string when there is nothing to print', () => {
    for (const value of [null, undefined, '', '  ', 'nope', '99/99/2027 10:00', 'Invalid-01-01T00:00:00Z']) {
      expect(formatEventDate(value, 'date', 'es')).toBe('')
    }
  })

  it('crossing midnight keeps the wall clock (a party that ends after 12 am)', () => {
    expect(formatEventDate('2027-01-03 01:00:00', 'time', 'en')).toBe('1:00 AM')
    expect(formatEventDate('2027-01-03 01:00:00', 'dayMonth', 'en')).toBe('January 3')
  })

  it('does not depend on the browser zone for a wall clock (any daylight saving day)', () => {
    expect(formatEventDate('03/14/2027 02:30', 'time', 'en')).toBe('2:30 AM')
    expect(formatEventDate('11/07/2027 01:30', 'time', 'en')).toBe('1:30 AM')
  })

  it('prints an instant in the event zone', () => {
    // 2027-01-02T21:30:00Z is 4:30 pm in New York (UTC-5) and 6:30 am next day in Sydney (UTC+11).
    expect(formatEventDate('2027-01-02T21:30:00Z', 'time', 'en', 'America/New_York')).toBe('4:30 PM')
    expect(formatEventDate('2027-01-02T21:30:00Z', 'dateTime', 'en', 'Australia/Sydney')).toBe('Jan 3, 2027, 8:30 AM')
    expect(formatEventDate('2027-01-02T16:30:00-05:00', 'date', 'en', 'America/New_York')).toBe('January 2, 2027')
  })

  it('prints an instant in the browser zone when there is no valid event zone', () => {
    const expected = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date('2027-01-02T21:30:00Z'))
    expect(formatEventDate('2027-01-02T21:30:00Z', 'time', 'en')).toBe(expected)
    expect(formatEventDate('2027-01-02T21:30:00Z', 'time', 'en', 'Not/AZone')).toBe(expected)
  })
})

describe('formatWallClock (the invitation rules)', () => {
  it('reads an instant in UTC when the invitation gives no valid zone', () => {
    expect(formatWallClock('2027-01-02T21:30:00Z', 'en', { hour: 'numeric', minute: '2-digit' })).toBe('9:30 PM')
    expect(formatWallClock('2027-01-02T21:30:00Z', 'en', { hour: 'numeric', minute: '2-digit' }, 'bad/zone')).toBe('9:30 PM')
  })
})

describe('formatClock', () => {
  it('is the time style', () => {
    expect(formatClock('2027-01-02 16:30:00', 'en')).toBe('4:30 PM')
    expect(formatClock('', 'en')).toBe('')
  })
})

describe('eventMoment', () => {
  const event = { startDate: '01/02/2027 16:30', endDate: '01/03/2027 01:00', startsAt: '2027-01-02T16:30:00-05:00', endsAt: '2027-01-03T01:00:00-05:00', timezone: 'America/New_York' }

  it('prefers the ISO instants the API sends', () => {
    expect(eventMoment(event)).toBe('2027-01-02T16:30:00-05:00')
    expect(eventMoment(event, 'end')).toBe('2027-01-03T01:00:00-05:00')
  })

  it('falls back to the wall-clock text, and to an empty string', () => {
    expect(eventMoment({ startDate: '01/02/2027 16:30' })).toBe('01/02/2027 16:30')
    expect(eventMoment({ endDate: '01/03/2027 01:00' }, 'end')).toBe('01/03/2027 01:00')
    expect(eventMoment({})).toBe('')
    expect(eventMoment(null)).toBe('')
  })

  it('prints the same text through both paths', () => {
    const wallOnly = { startDate: event.startDate, timezone: event.timezone }
    expect(formatEventDate(eventMoment(event), 'dateTime', 'es', event.timezone)).toBe(formatEventDate(eventMoment(wallOnly), 'dateTime', 'es', event.timezone))
  })
})

describe('eventDay', () => {
  it('gives the calendar day of the event zone', () => {
    expect(eventDay({ startDate: '01/02/2027 23:30' })).toBe('2027-01-02')
    expect(eventDay({ startsAt: '2027-01-03T02:30:00Z', timezone: 'America/New_York' })).toBe('2027-01-02')
    expect(eventDay({ startsAt: '2027-01-03T02:30:00Z' })).toMatch(/^2027-01-0[23]$/)
    expect(eventDay({ startsAt: '2027-01-03T02:30:00Z', timezone: 'Not/AZone' })).toMatch(/^2027-01-0[23]$/)
    expect(eventDay({ startsAt: 'x+99:99' })).toBe('')
    expect(eventDay({})).toBe('')
  })
})

describe('endsNextDay', () => {
  it('detects an end on a later day', () => {
    expect(endsNextDay('2027-01-02 22:00:00', '2027-01-03 01:00:00')).toBe(true)
    expect(endsNextDay('01/02/2027 22:00', '01/03/2027 01:00')).toBe(true)
    expect(endsNextDay('2027-01-02T19:00:00', '2027-01-02T21:00:00')).toBe(false)
    expect(endsNextDay(null, '2027-01-03 01:00:00')).toBe(false)
  })

  it('compares plain text when it is not a known shape', () => {
    expect(endsNextDay('2027-01-02 xx', '2027-01-03 yy')).toBe(true)
  })
})

describe('daysUntilEvent', () => {
  const now = new Date(2026, 10, 12, 23, 30)
  it('counts calendar days, not 24 h blocks', () => {
    expect(daysUntilEvent({ startDate: '11/13/2026 00:05' }, now)).toBe(1)
    expect(daysUntilEvent({ startDate: '11/12/2026 08:00' }, now)).toBe(0)
    expect(daysUntilEvent({ startDate: '11/10/2026 08:00' }, now)).toBe(-2)
  })
  it('accepts the other wall-clock shapes', () => {
    expect(daysUntilEvent({ startDate: '2026-11-14T10:00:00' }, now)).toBe(2)
    expect(daysUntilEvent({ startDate: '2026-11-14' }, now)).toBe(2)
  })
  it('counts today in the event zone, not the browser one', () => {
    // 2026-11-13 03:30 UTC is still the 12th in Miami (UTC-5) and already the 13th in UTC.
    const instant = new Date(Date.UTC(2026, 10, 13, 3, 30))
    expect(daysUntilEvent({ startDate: '11/13/2026 19:00', timezone: 'America/New_York' }, instant)).toBe(1)
    expect(daysUntilEvent({ startDate: '11/13/2026 19:00', timezone: 'UTC' }, instant)).toBe(0)
  })
  it('reads an ISO instant in the event zone', () => {
    const event = { startsAt: '2027-01-03T00:30:00Z', startDate: '', timezone: 'America/New_York' }
    expect(daysUntilEvent(event, new Date(Date.UTC(2027, 0, 2, 15)))).toBe(0)
  })
  it('ignores an invalid zone and is null without a readable date', () => {
    expect(daysUntilEvent({ startDate: '11/14/2026 10:00', timezone: 'Nope/Zone' }, now)).toBe(2)
    expect(daysUntilEvent({ startDate: '' }, now)).toBeNull()
    expect(daysUntilEvent(null, now)).toBeNull()
    expect(daysUntilEvent({ startDate: 'nope' }, now)).toBeNull()
  })
})

describe('eventDate', () => {
  it('returns the wall clock as local fields', () => {
    const d = eventDate({ startDate: '12/25/2026 18:30' })
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 11, 25, 18, 30])
  })
  it('reads a date without time, ISO text and the end', () => {
    expect(eventDate({ startDate: '01/05/2027' }).getDate()).toBe(5)
    expect(eventDate({ startDate: '2027-03-04T10:00:00' })).toBeInstanceOf(Date)
    expect(eventDate({ startDate: '01/05/2027 10:00', endDate: '01/06/2027 01:00' }, 'end').getDate()).toBe(6)
  })
  it('converts an instant to the clock of the event zone', () => {
    const d = eventDate({ startsAt: '2027-01-03T00:30:00Z', timezone: 'America/New_York' })
    expect([d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2, 19, 30])
  })
  it('is null for empty or garbage', () => {
    expect(eventDate({ startDate: null })).toBeNull()
    expect(eventDate({ startDate: 'nope' })).toBeNull()
    expect(eventDate({ startsAt: 'x+99:99', startDate: '' })).toBeNull()
    expect(eventDate(undefined)).toBeNull()
  })
})

describe('hasClock', () => {
  it('is true when there is a time of day', () => {
    expect(hasClock('01/02/2027 19:00')).toBe(true)
    expect(hasClock('2027-01-02T19:00:00')).toBe(true)
    expect(hasClock('2027-01-03T00:30:00Z')).toBe(true)
  })
  it('is false for a bare date, garbage and non-text', () => {
    expect(hasClock('01/02/2027')).toBe(false)
    expect(hasClock('2027-01-02')).toBe(false)
    expect(hasClock('hola 10:00')).toBe(false)
    expect(hasClock(null)).toBe(false)
  })
})

describe('short day styles', () => {
  it('prints 2 ene and sáb, 2 ene in Spanish and Jan 2 / Sat, Jan 2 in English', () => {
    expect(formatEventDate('01/02/2027 19:00', 'dayMonthShort', 'es')).toMatch(/^2 ene/)
    expect(formatEventDate('01/02/2027 19:00', 'weekdayDayMonth', 'es')).toMatch(/^sáb/i)
    expect(formatEventDate('01/02/2027 19:00', 'dayMonthShort', 'en')).toBe('Jan 2')
    expect(formatEventDate('01/02/2027 19:00', 'weekdayDayMonth', 'en')).toBe('Sat, Jan 2')
  })
})
