import { describe, it, expect } from 'vitest'
import { resolveVar, formatInstant, VAR_PATHS } from '../variables'
import { makeCtx } from './helpers'

const ctx = (over = {}) => makeCtx(over)

describe('variables', () => {
  it('resolves the closed context', () => {
    const c = ctx()
    expect(resolveVar('event.name', undefined, c)).toBe('Los XV de Valentina')
    expect(resolveVar('guest.firstName', undefined, c)).toBe('Rosa')
    expect(resolveVar('section.position', undefined, c)).toBe('1')
    expect(resolveVar('t.invitedFor', undefined, c)).toBe('Invitación para')
  })

  it('date and time filters use the invitation language, never the browser time zone', () => {
    const c = ctx()
    expect(resolveVar('event.date', 'date', c)).toBe('28 de diciembre de 2026')
    expect(resolveVar('event.date', 'date.weekday', c)).toBe('lunes')
    expect(resolveVar('event.date', 'date.weekdayShort|upper', c)).toBe('LUN')
    expect(resolveVar('event.date', 'date.day', c)).toBe('28')
    expect(resolveVar('event.date', 'date.month|upper', c)).toBe('DICIEMBRE')
    expect(resolveVar('event.date', 'time', c)).toMatch(/^7:00/)
    const en = ctx({ ctx: { locale: 'en' } })
    expect(resolveVar('event.date', 'date.month', en)).toBe('December')
    expect(resolveVar('event.date', 'time', en)).toMatch(/^7:00\sPM$/)
  })

  it('wall-clock time stays put whatever the viewer zone is (DST edge, midnight, offsets)', () => {
    expect(formatInstant('2026-03-08T02:30:00', 'en', { timeStyle: 'short' })).toMatch(/^2:30\sAM$/)
    expect(formatInstant('2026-12-31T23:59:59', 'en', { day: 'numeric' })).toBe('31')
    expect(formatInstant('2026-12-28T19:00:00-05:00', 'en', { timeStyle: 'short' }, 'America/New_York')).toMatch(/^7:00\sPM$/)
    expect(formatInstant('2026-12-28T19:00:00Z', 'en', { timeStyle: 'short' }, 'America/Bogota')).toMatch(/^2:00\sPM$/)
    expect(formatInstant('nonsense', 'es', { day: 'numeric' })).toBe('')
  })

  it('unknown paths and filters do not leak anything and warn', () => {
    const warnings = []
    const c = ctx()
    expect(resolveVar('event.secret', undefined, c, m => warnings.push(m))).toBe('')
    expect(resolveVar('__proto__', undefined, c, m => warnings.push(m))).toBe('')
    expect(resolveVar('constructor.name', undefined, c, m => warnings.push(m))).toBe('')
    expect(resolveVar('event.name', 'evil|upper', c, m => warnings.push(m))).toBe('LOS XV DE VALENTINA')
    expect(warnings).toHaveLength(4)
  })

  it('only engine strings are reachable through t.*; the package can add its own per language', () => {
    expect(resolveVar('t.rsvp.error', undefined, ctx())).toBe('')
    const c = ctx()
    c.strings = { es: { thanks: 'Gracias' }, en: { thanks: 'Thanks' } }
    expect(resolveVar('t.thanks', undefined, c)).toBe('Gracias')
  })

  it('long values are capped', () => {
    const c = ctx({ invitation: { guest: { name: 'x'.repeat(9000) } } })
    expect(resolveVar('guest.name', undefined, c)).toHaveLength(2000)
  })

  it('exposes only the documented paths', () => {
    expect([...VAR_PATHS].every(p => /^(event|section|guest|theme)\./.test(p))).toBe(true)
  })
})
