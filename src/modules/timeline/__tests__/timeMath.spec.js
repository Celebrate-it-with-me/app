import { describe, it, expect } from 'vitest'
import { connectionBetween, durationOf, endMinutes, formatDuration, minutesOf, rangeLabel } from '../utils/timeMath'

const m = (start, end = null) => ({ startTime: `2027-03-20 ${start}:00`, endTime: end ? `2027-03-20 ${end}:00` : null })
const next = (start, end = null) => ({ startTime: `2027-03-21 ${start}:00`, endTime: end ? `2027-03-21 ${end}:00` : null })

describe('minutesOf', () => {
  it('reads wall-clock text and rejects the rest', () => {
    expect(minutesOf('2027-03-20 00:01:00') - minutesOf('2027-03-20 00:00:00')).toBe(1)
    expect(minutesOf('2027-03-21 00:00:00') - minutesOf('2027-03-20 00:00:00')).toBe(1440)
    expect(minutesOf('nope')).toBeNull()
    expect(minutesOf(undefined)).toBeNull()
  })
})

describe('durationOf', () => {
  it('measures a moment', () => {
    expect(durationOf(m('16:30', '17:30'))).toBe(60)
    expect(durationOf(m('16:30', '17:15'))).toBe(45)
    expect(durationOf(m('16:30', '18:00'))).toBe(90)
  })
  it('adds 24 h when the end is not after the start (midnight)', () => {
    expect(durationOf(m('22:00', '01:00'))).toBe(180)
    expect(durationOf({ startTime: '2027-03-20 22:00:00', endTime: '2027-03-21 01:00:00' })).toBe(180)
    expect(durationOf(m('22:00', '22:00'))).toBe(1440)
    expect(durationOf(m('23:59', '00:00'))).toBe(1)
  })
  it('is null without an end or with unreadable times', () => {
    expect(durationOf(m('16:30'))).toBeNull()
    expect(durationOf({ startTime: 'x', endTime: '2027-03-20 10:00:00' })).toBeNull()
    expect(durationOf({ startTime: '2027-03-20 10:00:00', endTime: 'x' })).toBeNull()
    expect(durationOf(null)).toBeNull()
  })
})

describe('formatDuration', () => {
  it.each([[60, '1 h'], [45, '45 min'], [90, '1 h 30 min'], [180, '3 h'], [5, '5 min'], [0, '0 min'], [1440, '24 h'], [61, '1 h 1 min'], [59.6, '1 h']])(
    '%s min is "%s"',
    (minutes, text) => expect(formatDuration(minutes)).toBe(text)
  )
  it('never goes negative', () => expect(formatDuration(-5)).toBe('0 min'))
})

describe('endMinutes', () => {
  it('is the start plus the duration, past midnight too', () => {
    expect(endMinutes(m('22:00', '01:00')) - minutesOf('2027-03-20 22:00:00')).toBe(180)
    expect(endMinutes(m('22:00'))).toBeNull()
    expect(endMinutes(undefined)).toBeNull()
  })
})

describe('connectionBetween', () => {
  it('finds a gap', () => {
    expect(connectionBetween(m('16:00', '17:00'), m('17:45'))).toEqual({ kind: 'gap', minutes: 45 })
    expect(connectionBetween(m('16:00', '17:00'), m('18:30'))).toEqual({ kind: 'gap', minutes: 90 })
  })
  it('finds an overlap', () => {
    expect(connectionBetween(m('16:00', '17:00'), m('16:30'))).toEqual({ kind: 'overlap', minutes: 30 })
    expect(connectionBetween(m('16:00', '17:00'), m('16:00'))).toEqual({ kind: 'overlap', minutes: 60 })
  })
  it('says nothing when they touch', () => {
    expect(connectionBetween(m('16:00', '17:00'), m('17:00'))).toBeNull()
  })
  it('says nothing when the previous one has no end', () => {
    expect(connectionBetween(m('16:00'), m('18:00'))).toBeNull()
    expect(connectionBetween(m('16:00'), m('15:00'))).toBeNull()
  })
  it('says nothing when a time cannot be read', () => {
    expect(connectionBetween(m('16:00', '17:00'), { startTime: 'x' })).toBeNull()
    expect(connectionBetween(m('16:00', '17:00'), undefined)).toBeNull()
  })
  it('goes through midnight', () => {
    // the dance ends at 1:00 a.m. (next day); the next moment starts at 1:30 a.m. that day: 30 min free
    const dance = { startTime: '2027-03-20 22:00:00', endTime: '2027-03-21 01:00:00' }
    expect(connectionBetween(dance, next('01:30'))).toEqual({ kind: 'gap', minutes: 30 })
    expect(connectionBetween(dance, next('00:30'))).toEqual({ kind: 'overlap', minutes: 30 })
    // end typed without its date still wraps
    expect(connectionBetween(m('22:00', '01:00'), next('02:00'))).toEqual({ kind: 'gap', minutes: 60 })
  })
})

describe('rangeLabel', () => {
  const norm = text => text.replace(/[\u00a0\u202f]/g, ' ')
  it('omits the meridiem of the start when both share it', () => {
    expect(norm(rangeLabel(m('16:30', '17:30'), 'es').range)).toMatch(/^4:30 \u2013 5:30 [ap]\.?\s?m\.?$/i)
    expect(norm(rangeLabel(m('09:00', '10:15'), 'en').range)).toMatch(/^9:00 – 10:15 AM$/)
  })
  it('keeps both when the meridiem changes', () => {
    const { range } = rangeLabel(m('11:30', '13:00'), 'en')
    expect(norm(range)).toBe('11:30 AM – 1:00 PM')
    const night = rangeLabel({ startTime: '2027-03-20 22:00:00', endTime: '2027-03-21 01:00:00' }, 'en')
    expect(norm(night.range)).toBe('10:00 PM – 1:00 AM')
  })
  it('shows only the start without an end', () => {
    const label = rangeLabel(m('16:30'), 'en')
    expect(norm(label.range)).toBe('4:30 PM')
    expect(label.end).toBe('')
  })
  it('reads the same in Spanish', () => {
    const { range } = rangeLabel(m('16:30', '17:30'), 'es')
    expect(range.startsWith('4:30 – 5:30')).toBe(true)
    expect(rangeLabel(m('11:30', '13:00'), 'es').range).toMatch(/^11:30.*[ap]\.?.*– 1:00/)
  })
})
