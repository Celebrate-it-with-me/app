import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardActivity from '../DashboardActivity.vue'
import { activityWho, readableActivity } from '../dashboardLogic'

const NOW = new Date('2026-11-26T15:00:00Z')
const ago = minutes => new Date(NOW.getTime() - minutes * 60_000).toISOString()
const row = (id, type, params, minutes, message = `Mensaje ${id}`) => ({ id, type, params, message, occurredAt: ago(minutes), createdAt: 'hace un rato' })
// Valentina's feed (seed): an organizer action and things guests did.
const FEED = [
  row(1, 'invitation_template_changed', { actor: 'Marisol Fernández', template: 'Miami Nights' }, 25),
  row(2, 'guest_confirmed', { actor: 'Sistema', name: 'Rosa Fernández', companions: 2 }, 60 * 24 * 2),
  row(3, 'invitation_opened', { actor: 'Sistema', name: 'Héctor' }, 60 * 3),
  row(4, 'guest_declined', { actor: 'Sistema', name: 'Javier Montes' }, 60 * 24 * 8),
  row(5, 'guests_imported', { actor: 'Marisol Fernández', count: 12 }, 60 * 24 * 40),
  row(6, 'event_updated', { actor: 'Carlos', name: 'Los XV' }, 60 * 24 * 50)
]
const mountActivity = (props = {}) => mount(DashboardActivity, { props: { activity: FEED, status: 'ready', now: NOW, ...props }, global: { plugins: [i18n] } })
const items = w => w.findAll('[data-testid=activity-item]')

beforeEach(() => setLocale('es'))

describe('activityWho', () => {
  it('is the guest for what guests do and the actor for what organizers do', () => {
    expect(activityWho(FEED[0])).toBe('Marisol Fernández')
    expect(activityWho(FEED[1])).toBe('Rosa Fernández')
    expect(activityWho({ type: 'music_suggested', params: { name: ' Ana ', actor: 'Sistema' } })).toBe('Ana')
    expect(activityWho({ type: 'event_created', params: {} })).toBe('')
    expect(activityWho(null)).toBe('')
  })
})

describe('readableActivity (ORG-016)', () => {
  it('drops only entries with no text', () => {
    const list = [{ id: 1, message: 'Actividad registrada.' }, { id: 3, message: '  ' }, { id: 4 }, { id: 5, message: 'Valentina confirmó' }]
    expect(readableActivity(list).map(i => i.id)).toEqual([1, 5])
    expect(readableActivity()).toEqual([])
  })
})

describe('DashboardActivity', () => {
  it('draws at most five entries with initials, the translated sentence and "hace…"', () => {
    const w = mountActivity()
    expect(items(w)).toHaveLength(5)
    expect(items(w)[0].get('[data-testid=activity-initials]').text()).toBe('MF')
    expect(items(w)[0].text()).toContain('Marisol Fernández cambió la plantilla a Miami Nights')
    expect(items(w)[0].text()).toContain('hace 25 minutos')
    expect(items(w)[1].get('[data-testid=activity-initials]').text()).toBe('RF')
    expect(items(w)[1].text()).toContain('Rosa Fernández confirmó su asistencia con 2 acompañantes')
    expect(items(w)[1].text()).toContain('hace 2 días')
    expect(items(w)[2].text()).toContain('hace 3 horas')
    expect(items(w)[3].text()).toContain('hace 1 semana')
    expect(items(w)[4].text()).toContain('hace 1 mes')
    expect(items(w)[0].get('time').attributes('datetime')).toBe(FEED[0].occurredAt)
  })
  it('hides the initials from screen readers: the sentence already says who', () => {
    expect(mountActivity().get('[data-testid=activity-initials]').attributes('aria-hidden')).toBe('true')
  })
  it('speaks English with the app in English, plurals included', () => {
    setLocale('en')
    const w = mountActivity({ max: 3 })
    expect(items(w)).toHaveLength(3)
    expect(items(w)[0].text()).toContain('25 minutes ago')
    expect(items(w)[1].text()).toContain('2 days ago')
  })
  it('a row without anyone gets a neutral mark instead of initials, never a hole', () => {
    const w = mountActivity({ activity: [{ id: 9, type: 'unknown', message: 'Algo pasó', occurredAt: ago(1) }] })
    expect(items(w)[0].get('[data-testid=activity-initials]').find('svg').exists()).toBe(true)
    expect(items(w)[0].text()).toContain('Algo pasó')
  })
  it('without readable activity: the empty state', () => {
    const w = mountActivity({ activity: [{ id: 1, message: '' }] })
    expect(w.get('[data-testid=activity-empty]').text()).toContain('Aún no hay actividad')
    expect(items(w)).toHaveLength(0)
  })
  it('loading draws the skeleton, never the empty state; an error offers retry', async () => {
    const loading = mountActivity({ activity: null, status: 'loading' })
    expect(loading.find('[data-testid=activity-skeleton]').exists()).toBe(true)
    expect(loading.find('[data-testid=activity-empty]').exists()).toBe(false)
    const error = mountActivity({ activity: null, status: 'error' })
    expect(error.get('[data-testid=block-error]').text()).toContain('No pudimos cargar la actividad reciente')
    await error.get('[data-testid=block-retry]').trigger('click')
    expect(error.emitted('retry')).toHaveLength(1)
  })
})

describe('DashboardActivity on a phone', () => {
  const original = window.matchMedia
  beforeEach(() => { window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) })
  afterEach(() => { window.matchMedia = original })

  it('shows 3 entries and "Ver todo" opens the rest in place', async () => {
    const w = mountActivity()
    expect(items(w)).toHaveLength(3)
    const toggle = w.get('[data-testid=activity-toggle]')
    expect(toggle.text()).toBe('Ver todo')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(items(w)).toHaveLength(5)
    expect(w.get('[data-testid=activity-toggle]').text()).toBe('Ver menos')
    await w.get('[data-testid=activity-toggle]').trigger('click')
    expect(items(w)).toHaveLength(3)
  })
  it('has no toggle when 3 or fewer entries exist', () => {
    const w = mountActivity({ activity: FEED.slice(0, 3) })
    expect(items(w)).toHaveLength(3)
    expect(w.find('[data-testid=activity-toggle]').exists()).toBe(false)
  })
})
