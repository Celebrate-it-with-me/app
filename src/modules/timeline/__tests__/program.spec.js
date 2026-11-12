import { describe, it, expect } from 'vitest'
import { buildPayload, formFromMoment, iconFor, momentErrors, parseEventDate, parseMoment, timeOf, MOMENT_TYPES } from '../utils/program'

const start = parseEventDate('03/20/2027 16:30')
const form = (extra = {}) => ({ title: ' Vals ', type: 'waltz', startTime: '19:00', endTime: '', description: '', ...extra })

describe('program helpers', () => {
  it('reads the event date and the moments', () => {
    expect(start.getFullYear()).toBe(2027)
    expect(start.getHours()).toBe(16)
    expect(parseEventDate('nada')).toBeNull()
    expect(timeOf('2027-03-20 19:05:00')).toBe('19:05')
    expect(parseMoment('2027-03-20 19:05:00').getMinutes()).toBe(5)
  })

  it('builds the payload from times and the event date', () => {
    expect(buildPayload(form(), start)).toEqual({
      title: 'Vals', type: 'waltz', description: null, startTime: '2027-03-20 19:00:00', endTime: null
    })
  })

  it('moves times after midnight to the next day', () => {
    const payload = buildPayload(form({ startTime: '22:00', endTime: '01:00', description: 'Música' }), start)
    expect(payload.startTime).toBe('2027-03-20 22:00:00')
    expect(payload.endTime).toBe('2027-03-21 01:00:00')
    expect(payload.description).toBe('Música')
    expect(buildPayload(form({ startTime: '00:30' }), start).startTime).toBe('2027-03-21 00:30:00')
  })

  it('round-trips a moment into the form', () => {
    expect(formFromMoment({ title: 'Cena', type: 'dinner', description: null, startTime: '2027-03-20 20:00:00', endTime: '2027-03-20 21:15:00' }))
      .toEqual({ title: 'Cena', type: 'dinner', startTime: '20:00', endTime: '21:15', description: '' })
  })

  it('asks for a name and a start time', () => {
    expect(momentErrors(form({ title: ' ', startTime: '' }))).toEqual({
      title: 'app.timeline.errors.title', startTime: 'app.timeline.errors.startTime'
    })
    expect(momentErrors(form())).toEqual({})
  })

  it('has an icon for every kind and a fallback', () => {
    expect(MOMENT_TYPES.map(t => t.value)).toEqual(['ceremony', 'reception', 'waltz', 'dinner', 'dance', 'toast', 'other'])
    expect(iconFor('unknown')).toBe(iconFor('other'))
  })
})
