import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardRoute from '../DashboardRoute.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' } }
const now = new Date(2026, 10, 26, 12, 0)
const task = (title, state = 'available') => ({ title, state })
const makePlan = (foundation = [], invitations = [], extra = {}) => ({
  mode: 'normal',
  progress: { done: 13, total: 33 },
  phases: [{ key: 'foundation', tasks: foundation }, { key: 'invitations', tasks: invitations }],
  ...extra
})
const mountRoute = (props = {}) =>
  mount(DashboardRoute, {
    props: { plan: makePlan([task('Reserva la misa', 'next'), task('Define la corte', 'next'), task('Fecha', 'done')], [task('Envía las invitaciones')]), status: 'ready', startDate: '01/02/2027 19:00', now, canEdit: true, editTo: { name: 'edit-event' }, ...props },
    global: { plugins: [i18n], stubs }
  })
const node = (w, key) => w.get(`[data-testid=route-${key}]`)

beforeEach(() => setLocale('es'))

describe('DashboardRoute milestones', () => {
  it('puts the clock in the event day\'s title, the current milestone as a hollow rose-700 ring', () => {
    const w = mountRoute()
    expect(node(w, 'event').find('p').text()).toMatch(/sáb.*2.*ene.*·\s*7:00/i)
    expect(node(w, 'event').findAll('p')[1].text()).toBe('Tu gran día')
    const ring = node(w, 'foundation').find('[aria-hidden=true].rounded-full')
    expect(ring.classes()).toEqual(expect.arrayContaining(['border-rose-700', 'bg-white']))
    expect(ring.find('span').exists()).toBe(false)
  })
  it('draws the four milestones in order', () => {
    const w = mountRoute()
    expect(w.findAll('[data-testid=route-list] > li').map(li => li.attributes('data-testid'))).toEqual(['route-today', 'route-foundation', 'route-invitations', 'route-event'])
  })
  it('puts today first, with the plan percentage and the days left', () => {
    const w = mountRoute()
    expect(node(w, 'today').text()).toContain('Hoy')
    expect(node(w, 'today').text()).toContain('Plan al 39 %')
    expect(w.get('[data-testid=route-summary]').text()).toMatch(/^Hoy, 26 de noviembre · quedan 37 días$/)
  })
  it('says one day left in the singular', () => {
    expect(mountRoute({ startDate: '11/27/2026 19:00' }).get('[data-testid=route-summary]').text()).toContain('queda 1 día')
  })
  it('gives the states from the phases: foundations current, invitations upcoming', () => {
    const w = mountRoute()
    expect(node(w, 'foundation').attributes('data-state')).toBe('current')
    expect(node(w, 'invitations').attributes('data-state')).toBe('upcoming')
    expect(node(w, 'foundation').text()).toContain('Reserva la misa')
    expect(node(w, 'foundation').text()).not.toContain('Define la corte')
    expect(node(w, 'foundation').text()).toContain('1 de 3 pasos')
    expect(node(w, 'foundation').text()).toContain('en curso')
    expect(node(w, 'invitations').text()).toContain('próximo')
  })
  it('uses the singular for a one-step phase and names only the next step', () => {
    const w = mountRoute({ plan: makePlan([task('A', 'next'), task('B', 'next'), task('C', 'next')], [task('Envía', 'next')]) })
    expect(node(w, 'invitations').text()).toContain('0 de 1 paso')
    expect(node(w, 'invitations').text()).not.toContain('0 de 1 pasos')
    expect(node(w, 'foundation').text()).not.toContain('C')
  })
  it('marks a finished phase as done with "Todo listo" and no counter', () => {
    const w = mountRoute({ plan: makePlan([task('A', 'done')], [task('B', 'next')]) })
    expect(node(w, 'foundation').attributes('data-state')).toBe('done')
    expect(node(w, 'foundation').text()).toContain('Todo listo')
    expect(node(w, 'foundation').text()).toContain('completado')
    expect(node(w, 'foundation').text()).not.toContain(' de 1 ')
    expect(node(w, 'invitations').attributes('data-state')).toBe('current')
  })
  it('says a phase has no steps', () => {
    expect(node(mountRoute({ plan: makePlan([], [task('B', 'next')]) }), 'foundation').text()).toContain('Sin pasos por ahora')
  })
  it('draws the event day with the date and time, and "Tu gran día"', () => {
    const t = node(mountRoute(), 'event').text()
    expect(t).toMatch(/sáb/i)
    expect(t).toMatch(/2 (de )?ene/)
    expect(t).toMatch(/7:00\s?p\.\s?m\./)
    expect(t).toContain('Tu gran día')
  })
  it('skips the clock when the date has no time and says it is today / already passed', () => {
    expect(node(mountRoute({ startDate: '01/02/2027' }), 'event').text()).not.toMatch(/a\.\s?m\.|p\.\s?m\./)
    expect(node(mountRoute({ startDate: '11/26/2026 19:00', plan: makePlan() }), 'event').text()).toContain('¡Es hoy!')
    expect(node(mountRoute({ startDate: '11/20/2026 19:00' }), 'event').text()).toContain('Ya pasó')
  })
  it('is laid out vertically on phones and horizontally from 640 px', () => {
    const w = mountRoute()
    expect(w.get('[data-testid=route-list]').classes()).toContain('sm:grid-cols-4')
    expect(node(w, 'foundation').classes()).toEqual(expect.arrayContaining(['flex', 'sm:flex-col']))
  })
  it('speaks English', () => {
    setLocale('en')
    const w = mountRoute()
    expect(w.text()).toContain('Road to the event')
    expect(node(w, 'foundation').text()).toContain('Foundations')
    expect(node(w, 'foundation').text()).toContain('1 of 3 steps')
    expect(w.get('[data-testid=route-summary]').text()).toContain('37 days left')
  })
})

describe('DashboardRoute states', () => {
  it('draws a skeleton while loading and no list', () => {
    const w = mountRoute({ status: 'loading', plan: null })
    expect(w.find('[data-testid=route-skeleton]').exists()).toBe(true)
    expect(w.find('[data-testid=route-list]').exists()).toBe(false)
  })
  it('draws an error with retry', async () => {
    const w = mountRoute({ status: 'error', plan: null })
    expect(w.get('[role=alert]').text()).toContain('No pudimos cargar tu ruta')
    await w.get('[data-testid=block-retry]').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
  })
  it('is hidden for events the assistant does not plan', () => {
    expect(mountRoute({ plan: makePlan([], [], { mode: 'unsupported' }) }).find('[data-testid=dashboard-route]').exists()).toBe(false)
    expect(mountRoute({ plan: makePlan([], [], { mode: 'event_past' }) }).find('[data-testid=dashboard-route]').exists()).toBe(false)
    expect(mountRoute({ plan: null }).find('[data-testid=dashboard-route]').exists()).toBe(false)
  })
  it('asks for the date when the event has none, with the link for editors only', () => {
    const w = mountRoute({ plan: makePlan([], [], { mode: 'no_date' }), startDate: '' })
    expect(w.get('[data-testid=route-no-date]').text()).toContain('Define la fecha')
    expect(w.find('[data-testid=route-list]').exists()).toBe(false)
    expect(w.find('[data-testid=route-no-date] a').exists()).toBe(true)
    expect(mountRoute({ plan: makePlan([], [], { mode: 'no_date' }), startDate: '', canEdit: false }).find('[data-testid=route-no-date] a').exists()).toBe(false)
  })
  it('keeps working without a date: the event milestone says so', () => {
    const w = mountRoute({ startDate: '' })
    expect(node(w, 'event').text()).toContain('Día del evento')
    expect(node(w, 'event').text()).toContain('Sin fecha definida')
    expect(w.get('[data-testid=route-summary]').text()).toBe('Hoy, 26 de noviembre')
  })
})
