import { describe, it, expect } from 'vitest'
import { resolveVar, VAR_PATHS, FILTERS } from '../variables'
import { formatWallClock } from '../../composables/wallClock'
import { makeCtx } from './helpers'

const rsvp = { type: 'rsvp', data: { companions: [{ id: 1 }], deadline: '2026-12-01T23:59:00' } }
const ctx = (over = {}) => makeCtx({ ...over, invitation: { sections: [{ type: 'cover', title: 'T', text: 'x', data: { description: 'Una noche' } }, rsvp], ...(over.invitation ?? {}) } })

describe('variables', () => {
  it('resolves the server catalogue', () => {
    const c = ctx()
    expect(resolveVar('event.name', undefined, c)).toBe('Los XV de Valentina')
    expect(resolveVar('event.description', undefined, c)).toBe('Una noche')
    expect(resolveVar('guest.first_name', undefined, c)).toBe('Rosa')
    expect(resolveVar('rsvp.seats', undefined, c)).toBe('2')
    expect(resolveVar('section.position', undefined, c)).toBe('1')
    expect(resolveVar('theme.slug', undefined, c)).toBe('classic')
    expect(resolveVar('t.invitedFor', undefined, c)).toBe('Invitación para')
    expect(resolveVar('event.time', undefined, c)).toMatch(/^7:00/)
  })

  it('text filters: upper, lower, capitalize', () => {
    const c = ctx()
    expect(resolveVar('guest.name', 'upper', c)).toBe('ROSA FERNÁNDEZ')
    expect(resolveVar('guest.name', 'lower', c)).toBe('rosa fernández')
    expect(resolveVar('guest.name', 'capitalize', ctx({ invitation: { guest: { name: 'rosa' } } }))).toBe('Rosa')
  })

  it('date filters are the server ones and use the invitation language', () => {
    const c = ctx()
    expect(resolveVar('event.date', undefined, c)).toBe('28 de diciembre de 2026')
    const out = Object.fromEntries(FILTERS.date.map(f => [f, resolveVar('event.date', f, c)]))
    expect(out).toMatchObject({ weekday: 'lunes', weekday_short: 'lun', day: '28', month: 'diciembre', month_short: 'dic', year: '2026', upper_month: 'DICIEMBRE' })
    expect(out.time).toMatch(/^7:00/)
    expect(resolveVar('event.date', 'month', ctx({ ctx: { locale: 'en' } }))).toBe('December')
    expect(resolveVar('rsvp.deadline', 'short', c)).toMatch(/2026|26/)
  })

  it('a filter that does not belong to the type is ignored with a warning', () => {
    const warnings = []
    expect(resolveVar('guest.name', 'month', ctx(), m => warnings.push(m))).toBe('Rosa Fernández')
    expect(resolveVar('rsvp.seats', 'upper', ctx(), m => warnings.push(m))).toBe('2')
    expect(resolveVar('event.date', 'date.weekdayShort', ctx(), m => warnings.push(m))).toBe('28 de diciembre de 2026')
    expect(warnings).toHaveLength(3)
  })

  it('wall-clock time stays put whatever the viewer zone is (DST edge, midnight, offsets)', () => {
    expect(formatWallClock('2026-03-08T02:30:00', 'en', { timeStyle: 'short' })).toMatch(/^2:30\sAM$/)
    expect(formatWallClock('2026-12-31T23:59:59', 'en', { day: 'numeric' })).toBe('31')
    expect(formatWallClock('2026-12-28T19:00:00-05:00', 'en', { timeStyle: 'short' }, 'America/New_York')).toMatch(/^7:00\sPM$/)
    expect(formatWallClock('2026-12-28T19:00:00Z', 'en', { timeStyle: 'short' }, 'America/Bogota')).toMatch(/^2:00\sPM$/)
    expect(formatWallClock('nonsense', 'es', { day: 'numeric' })).toBe('')
  })

  it('unknown paths do not leak anything and warn', () => {
    const warnings = []
    const c = ctx()
    for (const path of ['event.secret', '__proto__', 'constructor.name', 'event.startsAt', 'section.eventName']) expect(resolveVar(path, undefined, c, m => warnings.push(m))).toBe('')
    expect(warnings).toHaveLength(5)
  })

  it('only engine strings are reachable through t.*; the package adds its own per language', () => {
    expect(resolveVar('t.rsvp.error', undefined, ctx())).toBe('')
    const c = ctx()
    c.strings = { es: { thanks: 'Gracias', invitedFor: 'Para' }, en: { thanks: 'Thanks' } }
    expect(resolveVar('t.thanks', undefined, c)).toBe('Gracias')
    expect(resolveVar('t.invitedFor', undefined, c)).toBe('Para')
  })

  it('long values are capped', () => {
    expect(resolveVar('guest.name', undefined, ctx({ invitation: { guest: { name: 'x'.repeat(9000) } } }))).toHaveLength(2000)
  })

  it('exposes only the documented paths', () => {
    expect([...VAR_PATHS].every(p => /^(event|section|guest|rsvp|theme)\./.test(p))).toBe(true)
    expect(VAR_PATHS.size).toBe(13)
  })
})
