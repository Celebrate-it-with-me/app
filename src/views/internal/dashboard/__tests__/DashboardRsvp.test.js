import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardRsvp from '../DashboardRsvp.vue'
import RsvpRing from '../RsvpRing.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="typeof to === \'string\' ? to : JSON.stringify(to)"><slot /></a>' } }
const STATS = {
  attending: { guests: 17, companions: 12, total: 29 },
  pending: { guests: 5, companions: 2, total: 7 },
  not_attending: { guests: 2, companions: 1, total: 3 },
  totals: { guests: 24, companions: 15, people: 39, responded: 19 },
  response_rate: 79,
  recent: [
    { name: 'Ana María Pérez', status: 'attending', statusDate: '2026-11-14T15:00:00Z' },
    { name: 'Javier Montes', status: 'not-attending', statusDate: '2026-11-15T15:00:00Z' },
    { name: 'Héctor Fernández', status: 'attending', statusDate: '2026-11-16T15:00:00Z' },
    { name: 'Alejandra Núñez', status: 'attending', statusDate: '2026-11-12T15:00:00Z' },
    { name: 'Zoe', status: 'attending', statusDate: '2026-11-10T15:00:00Z' }
  ]
}
const mountRsvp = (props = {}) =>
  mount(DashboardRsvp, { props: { stats: STATS, status: 'ready', canEdit: true, canViewGuests: true, timezone: 'America/New_York', ...props }, global: { plugins: [i18n], stubs } })
const one = (key, over) => ({ ...STATS, [key]: { ...STATS[key], ...over } })

beforeEach(() => setLocale('es'))

describe('DashboardRsvp', () => {
  it('draws a skeleton while loading and never the empty state', () => {
    const w = mountRsvp({ stats: null, status: 'loading' })
    expect(w.find('[data-testid=rsvp-skeleton]').exists()).toBe(true)
    expect(w.find('[data-testid=rsvp-empty]').exists()).toBe(false)
  })
  it('shows an error with retry instead of an empty list when the stats fail', async () => {
    const w = mountRsvp({ stats: null, status: 'error' })
    expect(w.find('[data-testid=rsvp-empty]').exists()).toBe(false)
    expect(w.get('[data-testid=block-error]').text()).toContain('No pudimos cargar las confirmaciones')
    await w.get('[data-testid=block-retry]').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
  })
  it('people per answer and the totals line, with the right plurals', () => {
    const w = mountRsvp()
    expect(w.get('[data-row=attending]').text()).toContain('29 personas')
    expect(w.get('[data-testid=rsvp-totals]').text()).toBe('39 personas en 24 invitaciones · 15 acompañantes')
    const single = mountRsvp({ stats: { ...one('attending', { total: 1 }), totals: { guests: 1, companions: 1, people: 1 } } })
    expect(single.get('[data-row=attending]').text()).toContain('1 persona')
    expect(single.get('[data-testid=rsvp-totals]').text()).toBe('1 persona en 1 invitación · 1 acompañante')
    expect(mountRsvp({ stats: { ...STATS, totals: { guests: 3, companions: 0, people: 3 } } }).get('[data-testid=rsvp-totals]').text()).toBe('3 personas en 3 invitaciones · sin acompañantes')
    setLocale('en')
    expect(mountRsvp().get('[data-testid=rsvp-totals]').text()).toBe('39 people in 24 invitations · 15 companions')
  })
  it('reminds the pending invitations through the send wizard, with the pending card preselected', () => {
    const remind = mountRsvp().get('[data-testid=rsvp-remind]')
    expect(remind.text()).toContain('Recordar a las 5 invitaciones pendientes')
    expect(JSON.parse(remind.attributes('data-to'))).toEqual({ path: '/dashboard/guests', query: { send: 'pending' } })
    expect(mountRsvp({ stats: one('pending', { guests: 1 }) }).get('[data-testid=rsvp-remind]').text()).toContain('Recordar a la invitación pendiente')
  })
  it('has no remind button without pending invitations or for people who cannot send', () => {
    expect(mountRsvp({ stats: one('pending', { guests: 0 }) }).find('[data-testid=rsvp-remind]').exists()).toBe(false)
    expect(mountRsvp({ canEdit: false }).find('[data-testid=rsvp-remind]').exists()).toBe(false)
    expect(mountRsvp({ canViewGuests: false }).find('[data-testid=rsvp-remind]').exists()).toBe(false)
  })
  it('lists the four latest answers, newest first, with their state in words', () => {
    const rows = mountRsvp().findAll('[data-testid=rsvp-recent] li')
    expect(rows.map(r => r.text().split(/\d/)[0].trim())).toEqual(['Héctor Fernández', 'Javier Montes', 'Ana María Pérez', 'Alejandra Núñez'])
    expect(rows[0].text()).toMatch(/16 nov/)
    expect(rows[0].text()).toContain('Asiste')
    expect(rows[1].text()).toContain('No asiste')
  })
  it('hides "Últimas respuestas" when the API sends none (a role without names) and keeps the rest', () => {
    const w = mountRsvp({ stats: { ...STATS, recent: [] } })
    expect(w.find('[data-testid=rsvp-recent]').exists()).toBe(false)
    expect(w.find('[data-testid=rsvp-ring]').exists()).toBe(true)
  })
  it('without guests invites to add them (editors only)', () => {
    const empty = { attending: { total: 0 }, pending: { total: 0, guests: 0 }, not_attending: { total: 0 }, totals: { guests: 0, companions: 0, people: 0 }, response_rate: 0, recent: [] }
    const w = mountRsvp({ stats: empty })
    expect(w.get('[data-testid=rsvp-empty]').text()).toContain('Aún no tienes invitados')
    expect(w.get('[data-testid=rsvp-empty] a').attributes('data-to')).toBe('/dashboard/guests')
    expect(mountRsvp({ stats: empty, canEdit: false }).find('[data-testid=rsvp-empty] a').exists()).toBe(false)
  })
})

describe('RsvpRing', () => {
  const ring = props => mount(RsvpRing, { props: { attending: 29, pending: 7, declined: 3, rate: 79, ...props }, global: { plugins: [i18n] } })
  it('is one image that says every figure, and shows the response rate', () => {
    const w = ring()
    expect(w.get('svg').attributes('role')).toBe('img')
    expect(w.get('svg').attributes('aria-label')).toBe('29 asisten, 7 pendientes, 3 no asisten. 79 % de las invitaciones respondieron')
    expect(w.text()).toContain('79 %')
    expect(w.findAll('[data-segment]').map(c => c.attributes('data-segment'))).toEqual(['attending', 'pending', 'declined'])
  })
  it('uses the singular and leaves out empty arcs', () => {
    const w = ring({ attending: 1, pending: 1, declined: 0 })
    expect(w.get('svg').attributes('aria-label')).toContain('1 asiste, 1 pendiente, 0 no asisten')
    expect(w.findAll('[data-segment]')).toHaveLength(2)
  })
})
