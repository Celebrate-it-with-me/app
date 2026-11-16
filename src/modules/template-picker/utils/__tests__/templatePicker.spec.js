import { describe, it, expect } from 'vitest'
import {
  clearTemplateReturn,
  COVER_MAX_BYTES,
  errorCode,
  focusFromPoint,
  formatFocus,
  nudgeFocus,
  parseAspect,
  parseFocus,
  pickText,
  pickerReturnPath,
  readTemplateReturn,
  rememberTemplateReturn,
  sortTemplates,
  unlockLocation,
  validateCoverFile,
  validateCoverWidth,
  visibleRect
} from '../templatePicker'

const file = (name, type, size = 1000) => ({ name, type, size })

describe('sortTemplates', () => {
  it('puts the one in use first, then free, then premium, by name', () => {
    const list = [
      { id: 1, name: 'Zeta', tier: 'free' },
      { id: 2, name: 'Alfa', tier: 'premium' },
      { id: 3, name: 'Beta', tier: 'free', current: true },
      { id: 4, name: 'Alba', tier: 'free' }
    ]
    expect(sortTemplates(list).map(item => item.id)).toEqual([3, 4, 1, 2])
    expect(sortTemplates(null)).toEqual([])
  })
})

describe('pickText / errorCode', () => {
  it('chooses the language and falls back', () => {
    expect(pickText({ es: 'Hola', en: 'Hi' }, 'en')).toBe('Hi')
    expect(pickText({ es: 'Hola' }, 'en')).toBe('Hola')
    expect(pickText('plain')).toBe('plain')
    expect(pickText(null)).toBe('')
  })
  it('reads the code of a 4xx or the first code of a 422 field', () => {
    expect(errorCode({ response: { data: { code: 'plan_required' } } })).toBe('plan_required')
    expect(errorCode({ response: { data: { errors: { photo: ['too_small'] } } } }, 'photo')).toBe('too_small')
    expect(errorCode({ response: { data: { errors: { template_id: ['invalid'] } } } })).toBe('invalid')
    expect(errorCode(new Error('network'))).toBeNull()
  })
})

describe('unlock bridge', () => {
  it('builds the address the contract fixes', () => {
    expect(unlockLocation(12)).toEqual({ name: 'unlock', params: { module: 'full' }, query: { from: 'template', template: '12' } })
    expect(pickerReturnPath('12')).toBe('/dashboard/invitation?template=12')
  })
  it('remembers the wanted template for the same event only and forgets it after two hours', () => {
    clearTemplateReturn()
    expect(readTemplateReturn(5)).toBeNull()
    rememberTemplateReturn(5, 12, 1000)
    expect(readTemplateReturn(5, 2000)).toEqual({ eventId: '5', templateId: '12' })
    expect(readTemplateReturn(6, 2000)).toBeNull()
    expect(readTemplateReturn(5, 1000 + 3 * 60 * 60 * 1000)).toBeNull()
    clearTemplateReturn()
    expect(readTemplateReturn(5, 2000)).toBeNull()
  })
})

describe('cover file validation', () => {
  it('accepts JPEG, PNG and WebP up to 10 MB', () => {
    expect(validateCoverFile(file('a.jpg', 'image/jpeg'))).toBeNull()
    expect(validateCoverFile(file('a.png', 'image/png'))).toBeNull()
    expect(validateCoverFile(file('a.webp', 'image/webp', COVER_MAX_BYTES))).toBeNull()
    expect(validateCoverFile(file('IMG.JPG', ''))).toBeNull()
  })
  it('names what is wrong, with the API codes', () => {
    expect(validateCoverFile(null)).toBe('not_an_image')
    expect(validateCoverFile(file('a.jpg', 'image/jpeg', 0))).toBe('not_an_image')
    expect(validateCoverFile(file('a.pdf', 'application/pdf'))).toBe('not_an_image')
    expect(validateCoverFile(file('a.heic', 'image/heic'))).toBe('unsupported_type')
    expect(validateCoverFile(file('a.heic', ''))).toBe('unsupported_type')
    expect(validateCoverFile(file('a.gif', 'image/gif'))).toBe('unsupported_type')
    expect(validateCoverFile(file('a.jpg', 'image/jpeg', COVER_MAX_BYTES + 1))).toBe('too_large')
  })
  it('flags a photo narrower than the field asks only when both numbers are known', () => {
    expect(validateCoverWidth(800, 960)).toBe('too_small')
    expect(validateCoverWidth(960, 960)).toBeNull()
    expect(validateCoverWidth(100, 0)).toBeNull()
    expect(validateCoverWidth(undefined, 960)).toBeNull()
  })
})

describe('focus', () => {
  it('parses and formats the object-position text, clamped', () => {
    expect(parseFocus('40% 25%')).toEqual({ x: 40, y: 25 })
    expect(parseFocus('250% 3%')).toEqual({ x: 100, y: 3 })
    expect(parseFocus('center top')).toEqual({ x: 50, y: 50 })
    expect(parseFocus(null)).toEqual({ x: 50, y: 50 })
    expect(formatFocus({ x: 40.4, y: -5 })).toBe('40% 0%')
    expect(formatFocus(parseFocus('7% 93%'))).toBe('7% 93%')
  })
  it('turns a tap into a percentage of the box', () => {
    const rect = { left: 10, top: 20, width: 200, height: 400 }
    expect(focusFromPoint(rect, 110, 220)).toEqual({ x: 50, y: 50 })
    expect(focusFromPoint(rect, 0, 1000)).toEqual({ x: 0, y: 100 })
    expect(focusFromPoint({ width: 0, height: 0 }, 5, 5)).toEqual({ x: 50, y: 50 })
  })
  it('moves with the arrows (5 points, 1 with shift) and ignores other keys', () => {
    expect(nudgeFocus({ x: 50, y: 50 }, 'ArrowLeft')).toEqual({ x: 45, y: 50 })
    expect(nudgeFocus({ x: 50, y: 50 }, 'ArrowDown', true)).toEqual({ x: 50, y: 51 })
    expect(nudgeFocus({ x: 2, y: 98 }, 'ArrowUp')).toEqual({ x: 2, y: 93 })
    expect(nudgeFocus({ x: 0, y: 50 }, 'ArrowLeft')).toEqual({ x: 0, y: 50 })
    expect(nudgeFocus({ x: 50, y: 50 }, 'Enter')).toBeNull()
  })
  it('computes which part of the photo a cover frame shows', () => {
    expect(parseAspect('4:5')).toBeCloseTo(0.8)
    expect(parseAspect('nope')).toBeNull()
    // landscape photo in a portrait frame: full height, narrow window that follows the focus
    const wide = visibleRect(1.5, 0.8, { x: 100, y: 0 })
    expect(wide.height).toBe(1)
    expect(wide.width).toBeCloseTo(0.8 / 1.5)
    expect(wide.left + wide.width).toBeCloseTo(1)
    // tall photo in a portrait frame: full width, short window
    const tall = visibleRect(0.5, 0.8, { x: 0, y: 0 })
    expect(tall.width).toBe(1)
    expect(tall.top).toBe(0)
    expect(tall.height).toBeCloseTo(0.5 / 0.8)
    expect(visibleRect(0, 0.8, { x: 50, y: 50 })).toEqual({ left: 0, top: 0, width: 1, height: 1 })
  })
})
