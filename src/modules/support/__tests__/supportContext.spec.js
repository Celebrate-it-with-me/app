import { describe, it, expect } from 'vitest'
import es from '@/locales/es'
import en from '@/locales/en'
import {
  CONTEXT_MAX,
  CONTEXT_KEYS,
  MESSAGE_MAX,
  VALUE_MAX,
  browserLabel,
  buildContext,
  buildPayload,
  clampContext,
  errorKeyFor,
  isButtonHidden,
  isLongField,
  planOf,
  validateMessage
} from '../utils/supportContext'

describe('validateMessage', () => {
  it('needs 5 to 2000 characters once trimmed', () => {
    expect(validateMessage('')).toBe('tooShort')
    expect(validateMessage('  hola ')).toBe('tooShort')
    expect(validateMessage('hola!')).toBeNull()
    expect(validateMessage('a'.repeat(MESSAGE_MAX))).toBeNull()
    expect(validateMessage('a'.repeat(MESSAGE_MAX + 1))).toBe('tooLong')
    expect(validateMessage(null)).toBe('tooShort')
  })
})

describe('buildContext', () => {
  const route = { name: 'guests', fullPath: '/dashboard/guests?x=1', meta: { title: 'Invitados' } }
  const event = { id: 7, eventName: 'Los XV de Valentina', guestLimit: 50 }
  const ua = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36'

  it('fills the screen, event, plan, browser, language and viewport', () => {
    const ctx = buildContext({ route, event, locale: 'es', userAgent: ua, viewport: { width: 390, height: 844 } })
    expect(ctx).toEqual({
      screen: 'Invitados',
      route: '/dashboard/guests?x=1',
      eventId: 7,
      eventName: 'Los XV de Valentina',
      plan: 'free',
      browser: 'Chrome 126 · Android',
      language: 'es',
      viewport: '390x844'
    })
  })

  it('omits what is unknown and never adds other keys', () => {
    const ctx = buildContext({ route: { name: 'home', fullPath: '/dashboard' }, locale: 'en', userAgent: '' })
    expect(ctx).toEqual({ screen: 'home', route: '/dashboard', language: 'en' })
    expect(Object.keys(buildContext({ route, event, locale: 'es', userAgent: ua, viewport: { width: 1, height: 2 } })).every(k => CONTEXT_KEYS.includes(k))).toBe(true)
  })
})

describe('clampContext', () => {
  it('cuts values to 300 characters and keeps only scalars', () => {
    const ctx = clampContext({ screen: 'x'.repeat(500), route: { a: 1 }, eventId: 3, plan: '  ', extra: 'no' })
    expect(ctx.screen).toHaveLength(VALUE_MAX)
    expect(ctx).not.toHaveProperty('route')
    expect(ctx).not.toHaveProperty('plan')
    expect(ctx).not.toHaveProperty('extra')
    expect(ctx.eventId).toBe(3)
  })

  it('stays within 2000 characters in total', () => {
    const big = 'y'.repeat(VALUE_MAX)
    const ctx = clampContext(Object.fromEntries(CONTEXT_KEYS.map(k => [k, big])))
    expect(JSON.stringify(ctx).length).toBeLessThanOrEqual(CONTEXT_MAX)
    expect(ctx.screen).toBeDefined()
  })
})

describe('buildPayload', () => {
  it('trims the message and sends eventId only with an active event', () => {
    expect(buildPayload({ message: '  Ayuda ya  ', event: { id: 4 }, context: { screen: 'a' } })).toEqual({ message: 'Ayuda ya', eventId: 4, context: { screen: 'a' } })
    expect(buildPayload({ message: 'Hola hola', event: null, context: {} })).not.toHaveProperty('eventId')
  })
})

describe('planOf and browserLabel', () => {
  it('reads the plan from the guest limit', () => {
    expect(planOf({ guestLimit: 50 })).toBe('free')
    expect(planOf({ guestLimit: null })).toBe('full')
    expect(planOf(null)).toBeNull()
  })
  it('names the browser and system', () => {
    expect(browserLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Version/17.0 Mobile Safari/604.1')).toBe('Safari 17 · iOS')
    expect(browserLabel('Mozilla/5.0 (Windows NT 10.0) Chrome/120.0 Safari/537.36 Edg/120.0')).toBe('Edge 120 · Windows')
  })
})

describe('visibility', () => {
  it('hides for another modal or a long field, not for short inputs', () => {
    const textarea = document.createElement('textarea')
    const input = document.createElement('input')
    expect(isLongField(textarea)).toBe(true)
    expect(isLongField(input)).toBe(false)
    expect(isLongField(null)).toBe(false)
    expect(isButtonHidden({ foreignDialogOpen: false, focusedElement: null })).toBe(false)
    expect(isButtonHidden({ foreignDialogOpen: true, focusedElement: null })).toBe(true)
    expect(isButtonHidden({ foreignDialogOpen: false, focusedElement: textarea })).toBe(true)
    expect(isButtonHidden({ foreignDialogOpen: false, focusedElement: input })).toBe(false)
  })
})

describe('errorKeyFor', () => {
  it('maps the API errors to friendly messages', () => {
    expect(errorKeyFor({ response: { status: 429 } })).toBe('tooMany')
    expect(errorKeyFor({ response: { status: 422 } })).toBe('invalid')
    expect(errorKeyFor({ response: { status: 500 } })).toBe('generic')
    expect(errorKeyFor(new Error('network'))).toBe('generic')
  })
})

describe('support texts', () => {
  const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? flat(v, `${p}${k}.`) : [`${p}${k}`]))
  it('exist in es and en with the same keys, and every error key is covered', () => {
    expect(flat(es.support).sort()).toEqual(flat(en.support).sort())
    for (const key of ['tooShort', 'tooLong', 'invalid', 'tooMany', 'generic']) {
      expect(es.support.errors[key]).toBeTruthy()
      expect(en.support.errors[key]).toBeTruthy()
    }
  })
})
