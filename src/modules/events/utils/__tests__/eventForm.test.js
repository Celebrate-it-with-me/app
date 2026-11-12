import { describe, it, expect } from 'vitest'
import { apiToInput, inputToApi, slugify, SLUG_PATTERN, formFromEvent, buildPatch, fieldErrors } from '../eventForm'

describe('dates', () => {
  it('converts between the API format and the input format', () => {
    expect(apiToInput('12/25/2026 18:30')).toBe('2026-12-25T18:30')
    expect(apiToInput('1/5/2027 9:05')).toBe('2027-01-05T09:05')
    expect(inputToApi('2026-12-25T18:30')).toBe('12/25/2026 18:30')
  })
  it('round-trips', () => expect(inputToApi(apiToInput('03/09/2027 07:00'))).toBe('03/09/2027 07:00'))
  it('is empty for nothing or garbage', () => {
    expect(apiToInput(null)).toBe('')
    expect(apiToInput('nope')).toBe('')
    expect(inputToApi('')).toBe('')
  })
})

describe('slugify', () => {
  it('builds a readable address', () => expect(slugify('Los XV de Valentina')).toBe('los-xv-de-valentina'))
  it('drops accents and symbols', () => expect(slugify('Boda de Camila y Andrés ❤️!')).toBe('boda-de-camila-y-andres'))
  it('limits the length without leaving a trailing hyphen', () => {
    const slug = slugify('a'.repeat(49) + ' bbbbbbbb')
    expect(slug.length).toBeLessThanOrEqual(50)
    expect(slug.endsWith('-')).toBe(false)
  })
  it('is empty when there is nothing usable', () => expect(slugify('!!!')).toBe(''))
  it('always matches the API pattern', () => expect(SLUG_PATTERN.test(slugify('Mis 15 años — 2027'))).toBe(true))
})

describe('buildPatch', () => {
  const event = { eventName: 'Los XV', eventDescription: 'x', startDate: '12/25/2026 18:00', endDate: null, customUrlSlug: 'los-xv' }
  const original = formFromEvent(event)

  it('is empty when nothing changed', () => expect(buildPatch(original, { ...original })).toEqual({}))
  it('sends only what changed, with dates in the API format', () => {
    expect(buildPatch(original, { ...original, eventName: 'Los XV de Vale', startDate: '2026-12-26T19:00' })).toEqual({
      eventName: 'Los XV de Vale',
      startDate: '12/26/2026 19:00'
    })
  })
  it('sends null for an emptied description or end date', () => {
    const withEnd = formFromEvent({ ...event, endDate: '12/26/2026 02:00' })
    expect(buildPatch(withEnd, { ...withEnd, endDate: '', eventDescription: '' })).toEqual({ endDate: null, eventDescription: null })
  })
  it('sends the address only when it changed and is not locked', () => {
    expect(buildPatch(original, { ...original, customUrlSlug: 'nueva' })).toEqual({ customUrlSlug: 'nueva' })
    expect(buildPatch(original, { ...original, customUrlSlug: 'nueva' }, { slugLocked: true })).toEqual({})
  })
  it('ignores whitespace-only changes', () => expect(buildPatch(original, { ...original, eventName: '  Los XV  ' })).toEqual({}))
})

describe('fieldErrors', () => {
  it('takes the first message per field', () => {
    const error = { response: { data: { errors: { customUrlSlug: ['taken', 'other'], eventName: ['required'] } } } }
    expect(fieldErrors(error)).toEqual({ customUrlSlug: 'taken', eventName: 'required' })
  })
  it('is empty for anything else', () => {
    expect(fieldErrors(new Error('boom'))).toEqual({})
    expect(fieldErrors(null)).toEqual({})
  })
})
