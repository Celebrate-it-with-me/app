import { describe, it, expect } from 'vitest'
import {
  canMove, classify, cleanValue, contrastRatio, fieldErrorsFrom, isHex, lowContrast, moveSection, normalizeHex,
  pick, sectionErrorFrom, sectionsPayload, toSixDigit, validateValue
} from '../utils/editorFields'

const text = { id: 'cover_text', type: 'text', max: { es: 5, en: 3 } }

describe('values', () => {
  it('picks the interface language and falls back to the other one', () => {
    expect(pick({ es: 'Hola', en: 'Hi' }, 'en')).toBe('Hi')
    expect(pick({ es: 'Hola' }, 'en')).toBe('Hola')
    expect(pick(null, 'es')).toBe('')
  })

  it('validates hex colors with 3, 4, 6 and 8 digits and normalizes what can be', () => {
    for (const ok of ['#abc', '#abcd', '#aabbcc', '#aabbccdd']) expect(isHex(ok)).toBe(true)
    for (const bad of ['abc', '#ab', '#ggg', 'red', '']) expect(isHex(bad)).toBe(false)
    expect(normalizeHex('AABBCC')).toBe('#aabbcc')
    expect(normalizeHex('#abz')).toBe('#abz')
    expect(toSixDigit('#abc')).toBe('#aabbcc')
    expect(toSixDigit('#aabbccdd')).toBe('#aabbcc')
  })

  it('warns about low contrast with the light page, never blocks', () => {
    expect(contrastRatio('#000000')).toBeCloseTo(21, 0)
    expect(lowContrast('#ffe9a8')).toBe(true)
    expect(lowContrast('#3b2f2f')).toBe(false)
    expect(lowContrast('nope')).toBe(false)
  })

  it('trims text per language and sends null as is', () => {
    expect(cleanValue(text, { es: '  hola ', en: undefined })).toEqual({ es: 'hola', en: '' })
    expect(cleanValue(text, null)).toBeNull()
  })

  it('mirrors the limits with the API codes', () => {
    expect(validateValue(text, { es: '123456', en: '' })).toEqual({ code: 'too_long', lang: 'es' })
    expect(validateValue(text, { es: '12345', en: '123' })).toBeNull()
    expect(validateValue({ type: 'color' }, '#zzz')).toEqual({ code: 'invalid_color' })
    expect(validateValue({ type: 'choice', choices: [{ value: 'a' }] }, 'b')).toEqual({ code: 'invalid_choice' })
    expect(validateValue({ type: 'toggle' }, 'yes')).toEqual({ code: 'invalid_type' })
    expect(validateValue({ type: 'color' }, null)).toBeNull()
  })
})

describe('errors', () => {
  const known = ['cover_text', 'color_primary']
  it('reads flat dotted keys, with and without language', () => {
    const error = { response: { status: 422, data: { errors: { 'fields.cover_text.es': ['too_long'], 'fields.color_primary': ['invalid_color'] } } } }
    expect(fieldErrorsFrom(error, known)).toEqual({ cover_text: { code: 'too_long', lang: 'es' }, color_primary: { code: 'invalid_color' } })
  })

  it('reads the nested shape too', () => {
    const error = { response: { status: 422, data: { errors: { fields: { color_primary: ['invalid_color'], cover_text: { en: ['too_long'] } } } } } }
    expect(fieldErrorsFrom(error, known)).toEqual({ color_primary: { code: 'invalid_color' }, cover_text: { code: 'too_long', lang: 'en' } })
  })

  it('classifies failures', () => {
    expect(classify({})).toBe('network')
    expect(classify({ response: { status: 422 } })).toBe('validation')
    expect(classify({ response: { status: 403, data: { code: 'plan_required' } } })).toBe('plan')
    expect(classify({ response: { status: 409, data: { code: 'template_locked' } } })).toBe('locked')
    expect(classify({ response: { status: 500 } })).toBe('server')
    expect(classify({ response: { status: 404 } })).toBe('other')
  })

  it('finds the first section error', () => {
    const error = { response: { data: { errors: { 'sections.2.enabled': ['module_locked'] } } } }
    expect(sectionErrorFrom(error)).toEqual({ index: 2, field: 'enabled', code: 'module_locked' })
  })
})

describe('sections', () => {
  const list = [
    { type: 'cover', enabled: true, order: 1, required: true },
    { type: 'a', enabled: true, order: 2 },
    { type: 'b', enabled: false, order: 3 },
    { type: 'rsvp', enabled: true, order: 4, required: true }
  ]
  it('never moves the cover nor puts anything above it', () => {
    expect(canMove(list, 'cover', 1)).toBe(false)
    expect(canMove(list, 'a', -1)).toBe(false)
    expect(canMove(list, 'a', 1)).toBe(true)
    expect(canMove(list, 'rsvp', 1)).toBe(false)
  })
  it('keeps the closing last: it does not move and nothing slides below it', () => {
    const withClosing = [...list.slice(0, 3), { type: 'closing', enabled: true, order: 4 }]
    expect(canMove(withClosing, 'closing', -1)).toBe(false)
    expect(canMove(withClosing, 'b', 1)).toBe(false)
    expect(canMove(withClosing, 'a', 1)).toBe(true)
    // switched off, the closing is a normal section again
    const off = withClosing.map(s => (s.type === 'closing' ? { ...s, enabled: false } : s))
    expect(canMove(off, 'closing', -1)).toBe(true)
    expect(canMove(off, 'b', 1)).toBe(true)
  })
  it('moves and renumbers, and the payload carries only type, enabled and order', () => {
    const moved = moveSection(list, 'b', -1)
    expect(moved.map(s => s.type)).toEqual(['cover', 'b', 'a', 'rsvp'])
    expect(sectionsPayload(moved)).toEqual([
      { type: 'cover', enabled: true, order: 1 },
      { type: 'b', enabled: false, order: 2 },
      { type: 'a', enabled: true, order: 3 },
      { type: 'rsvp', enabled: true, order: 4 }
    ])
  })
})
