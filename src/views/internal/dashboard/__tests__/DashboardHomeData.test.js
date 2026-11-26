import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'

const m = vi.hoisted(() => ({ loadStats: vi.fn(), activities: vi.fn(), progress: vi.fn(), templates: vi.fn(), list: vi.fn(), summary: vi.fn(), dress: vi.fn(), next: vi.fn(), plan: vi.fn(), invitation: vi.fn() }))
vi.mock('@/modules/assistant/services/AssistantService', () => ({ default: { next: m.next, plan: m.plan } }))
vi.mock('@/modules/rsvp/services/RsvpService', () => ({ default: { loadStats: m.loadStats } }))
vi.mock('@/services/ActivityService', () => ({ default: { loadDashboardActivities: m.activities } }))
vi.mock('@/modules/onboarding/services/OnboardingService', () => ({ default: { progress: m.progress } }))
vi.mock('@/modules/template-picker/services/TemplatePickerService', () => ({ default: { templates: m.templates } }))
vi.mock('@/modules/invitation-editor/services/InvitationEditorService', () => ({ default: { get: m.invitation } }))
vi.mock('@/modules/timeline/services/timelineService', () => ({ default: { list: m.list } }))
vi.mock('@/modules/dress-code/services/DressCodeService', () => ({ default: { get: m.dress } }))
vi.mock('@/modules/budget/services/BudgetService', () => ({ default: { summary: m.summary } }))
vi.mock('@/modules/email-verification/components/EmailVerifyNotice.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/services/axios', () => ({ CWM_API: { get: vi.fn() } }))

import Dashboard from '../Dashboard.vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useAssistantStore } from '@/modules/assistant/stores/useAssistantStore'

const stubs = {
  RouterLink: { props: ['to'], template: '<a><slot /></a>' },
  DashboardHero: { props: ['plan', 'startDate', 'timezone', 'templateName', 'templateStatus'], template: '<div data-testid="hero" :data-plan="JSON.stringify(plan)" :data-start="startDate" :data-zone="timezone" :data-template="templateName" :data-template-status="templateStatus" />' }
}

const totals = extra => ({ estimated: 18530.1, owed: 18530.1, paid: 100, remaining: 0, estimatedOverCap: true, estimatedOverByCents: 53010, overCap: true, overByCents: 53010, paidOverCap: false, paidOverByCents: 0, ...extra })

async function mountDashboard({ next = null, event = {}, summary = { cap: 18000, currency: 'USD', totals: totals(), categories: [], uncategorized: { itemCount: 1 } } } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  if (summary instanceof Promise) {
    summary.catch(() => {})
    m.summary.mockReturnValue(summary)
  } else m.summary.mockResolvedValue(summary)
  useEventsStore().initActiveEvent({ id: 7, guestsCount: 5, eventName: 'XV', userRole: 'owner', modules: [{ key: 'budget', state: 'active' }], ...event })
  m.next.mockResolvedValue(next ?? { mode: 'normal', progress: { done: 0, total: 0 } })
  const w = mount(Dashboard, { global: { plugins: [i18n, pinia], stubs } })
  await flushPromises()
  return w
}
const read = (w, id, attr) => JSON.parse(w.get(`[data-testid=${id}]`).attributes(attr))

beforeEach(() => {
  setLocale('es')
  localStorage.clear()
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
  Object.values(m).forEach(fn => fn.mockReset())
  m.loadStats.mockResolvedValue({ status: 200, data: { totals: { people: 5 } } })
  m.activities.mockResolvedValue({ status: 200, data: { data: [] } })
  m.progress.mockResolvedValue({})
  m.templates.mockResolvedValue([])
  m.list.mockResolvedValue([])
  m.dress.mockResolvedValue({ dressCodeType: null, reservedColors: [] })
  m.plan.mockResolvedValue({ mode: 'normal', phases: [] })
})

describe('Dashboard home data', () => {
  it('loads the plan and the next steps in parallel, for everybody', async () => {
    await mountDashboard()
    expect(m.next).toHaveBeenCalledTimes(1)
    expect(m.plan).toHaveBeenCalledTimes(1)
  })
  it('draws the route from the plan phases', async () => {
    m.plan.mockResolvedValue({ mode: 'normal', progress: { done: 1, total: 2 }, phases: [{ key: 'foundation', tasks: [{ title: 'Reserva la misa', state: 'next' }] }] })
    const w = await mountDashboard()
    expect(w.get('[data-testid=route-foundation]').text()).toContain('Reserva la misa')
  })
  it('a failed plan only fails the route: the hero stays and the route offers to retry', async () => {
    m.plan.mockRejectedValue(new Error('boom'))
    const w = await mountDashboard()
    expect(w.find('[data-testid=hero]').exists()).toBe(true)
    expect(w.get('[data-testid=dashboard-route] [role=alert]').exists()).toBe(true)
    m.plan.mockResolvedValue({ mode: 'normal', progress: { done: 0, total: 1 }, phases: [{ key: 'foundation', tasks: [{ title: 'Ya', state: 'next' }] }] })
    await w.get('[data-testid=block-retry]').trigger('click')
    await flushPromises()
    expect(w.get('[data-testid=route-foundation]').text()).toContain('Ya')
  })
  it('gives the hero the template name and keeps the chip off when the list fails', async () => {
    m.templates.mockResolvedValue([{ id: 1, name: 'Miami Nights', current: true, previewImage: 'x.webp' }])
    const ok = await mountDashboard()
    expect(ok.get('[data-testid=hero]').attributes('data-template')).toBe('Miami Nights')
    m.templates.mockRejectedValue(new Error('403'))
    const bad = await mountDashboard()
    expect(bad.get('[data-testid=hero]').attributes('data-template')).toBe('')
    expect(bad.get('[data-testid=hero]').attributes('data-template-status')).toBe('error')
  })
  it('gives the confirmations block its own skeleton, then the stats', async () => {
    let resolve
    m.loadStats.mockReturnValue(new Promise(r => (resolve = r)))
    const w = await mountDashboard()
    expect(w.find('[data-testid=rsvp-skeleton]').exists()).toBe(true)
    expect(w.find('[data-testid=rsvp-empty]').exists()).toBe(false)
    resolve({ status: 200, data: { data: { attending: { total: 2 }, pending: { total: 0 }, not_attending: { total: 0 }, totals: { people: 2, guests: 1, companions: 1 }, response_rate: 100 } } })
    await flushPromises()
    expect(w.get('[data-testid=rsvp-totals]').text()).toContain('2 personas en 1 invitación')
  })
  it('a failed stats request shows its own error and retry, no empty list and no shared toast', async () => {
    m.loadStats.mockRejectedValue({ response: { status: 500 } })
    const w = await mountDashboard()
    expect(w.find('[data-testid=dashboard-rsvp] [data-testid=block-error]').exists()).toBe(true)
    expect(w.find('[data-testid=rsvp-empty]').exists()).toBe(false)
    expect(useToast().toasts).toHaveLength(0)
    m.loadStats.mockResolvedValue({ status: 200, data: { totals: { people: 0 } } })
    await w.get('[data-testid=dashboard-rsvp] [data-testid=block-retry]').trigger('click')
    await flushPromises()
    expect(w.find('[data-testid=rsvp-empty]').exists()).toBe(true)
  })
  it('hides the confirmations when the API says they are not for this role or plan (403)', async () => {
    m.loadStats.mockRejectedValue({ response: { status: 403, data: { code: 'module_locked' } } })
    expect((await mountDashboard()).find('[data-testid=dashboard-rsvp]').exists()).toBe(false)
  })
  it('drops a late answer of the previous event: names of event A never show under event B', async () => {
    let resolveA
    m.loadStats.mockReturnValueOnce(new Promise(r => (resolveA = r)))
    m.loadStats.mockResolvedValueOnce({ status: 200, data: { totals: { people: 1, guests: 1 }, attending: { total: 1 }, recent: [{ name: 'Beto B', status: 'attending', statusDate: '2026-11-20T10:00:00Z' }] } })
    const w = await mountDashboard()
    useEventsStore().initActiveEvent({ id: 8, eventName: 'B', userRole: 'owner', modules: [] })
    await flushPromises()
    resolveA({ status: 200, data: { totals: { people: 1, guests: 1 }, attending: { total: 1 }, recent: [{ name: 'Ana A', status: 'attending', statusDate: '2026-11-21T10:00:00Z' }] } })
    await flushPromises()
    expect(w.get('[data-testid=rsvp-recent]').text()).toContain('Beto B')
    expect(w.text()).not.toContain('Ana A')
  })
  it('gives a viewer the template name from the invitation (the template list is for editors)', async () => {
    m.invitation.mockResolvedValue({ template: { name: 'Clásica' } })
    const w = await mountDashboard({ event: { userRole: 'viewer' } })
    expect(m.templates).not.toHaveBeenCalled()
    expect(w.get('[data-testid=hero]').attributes('data-template')).toBe('Clásica')
    m.invitation.mockRejectedValue(new Error('500'))
    const bad = await mountDashboard({ event: { userRole: 'viewer' } })
    expect(bad.get('[data-testid=hero]').attributes('data-template-status')).toBe('error')
  })
  it('gives the program its own block: skeleton, then every moment in time order with its description', async () => {
    let resolve
    m.list.mockReturnValue(new Promise(r => (resolve = r)))
    const w = await mountDashboard({ event: { modules: [{ key: 'timeline', state: 'active' }] } })
    expect(w.find('[data-testid=program-skeleton]').exists()).toBe(true)
    expect(w.find('[data-testid=program-empty]').exists()).toBe(false)
    resolve([
      { id: 2, title: 'Cena', startTime: '2027-01-02 20:30:00' },
      { id: 1, title: 'Misa', startTime: '2027-01-02 16:30:00', description: 'En la parroquia' }
    ])
    await flushPromises()
    expect(m.list).toHaveBeenCalledWith(7)
    const moments = w.findAll('[data-testid=program-moment]').map(n => n.text())
    expect(moments[0]).toMatch(/^4:30\sp\.\s?m\.\s*MisaEn la parroquia$/)
    expect(moments[1]).toContain('Cena')
  })
  it('a failed program shows its own error with retry and no shared toast; a 403 or a module off hides it', async () => {
    m.list.mockRejectedValue({ response: { status: 500 } })
    const w = await mountDashboard({ event: { modules: [{ key: 'timeline', state: 'active' }] } })
    expect(w.find('[data-testid=dashboard-program] [data-testid=block-error]').exists()).toBe(true)
    expect(useToast().toasts).toHaveLength(0)
    m.list.mockResolvedValue([])
    await w.get('[data-testid=dashboard-program] [data-testid=block-retry]').trigger('click')
    await flushPromises()
    expect(w.find('[data-testid=program-empty]').exists()).toBe(true)
    m.list.mockRejectedValue({ response: { status: 403 } })
    expect((await mountDashboard({ event: { modules: [{ key: 'timeline', state: 'active' }] } })).find('[data-testid=dashboard-program]').exists()).toBe(false)
    m.list.mockClear()
    expect((await mountDashboard({ event: { modules: [{ key: 'timeline', state: 'locked' }] } })).find('[data-testid=dashboard-program]').exists()).toBe(false)
    expect(m.list).not.toHaveBeenCalled()
  })
  it('gives the dress code its own block: skeleton, then the style; an error retries only that block', async () => {
    let resolve
    m.dress.mockReturnValue(new Promise(r => (resolve = r)))
    const on = { event: { modules: [{ key: 'dress_code', state: 'active' }] } }
    const w = await mountDashboard(on)
    expect(w.find('[data-testid=dress-skeleton]').exists()).toBe(true)
    expect(w.find('[data-testid=dress-empty]').exists()).toBe(false)
    resolve({ dressCodeType: 'formal', description: '', reservedColors: ['#C2185B'] })
    await flushPromises()
    expect(m.dress).toHaveBeenCalledWith(7)
    expect(w.get('[data-testid=dress-type]').text()).toBe('Formal')
    m.dress.mockRejectedValue({ response: { status: 500 } })
    const bad = await mountDashboard(on)
    expect(bad.find('[data-testid=dashboard-dress] [data-testid=block-error]').exists()).toBe(true)
    expect(useToast().toasts).toHaveLength(0)
    m.dress.mockClear()
    const off = await mountDashboard({ event: { modules: [{ key: 'dress_code', state: 'locked' }] } })
    expect(off.find('[data-testid=dashboard-dress]').exists()).toBe(false)
    expect(m.dress).not.toHaveBeenCalled()
  })
  it('gives the hero the ISO start of the event when the API sends it, else the wall-clock text', async () => {
    const wall = await mountDashboard({ event: { startDate: '01/02/2027 18:00', timezone: 'America/New_York' } })
    expect(wall.get('[data-testid=hero]').attributes('data-start')).toBe('01/02/2027 18:00')
    const iso = await mountDashboard({ event: { startDate: '01/02/2027 18:00', startsAt: '2027-01-02T18:00:00-05:00', timezone: 'America/New_York' } })
    expect(iso.get('[data-testid=hero]').attributes('data-start')).toBe('2027-01-02T18:00:00-05:00')
    expect(iso.get('[data-testid=hero]').attributes('data-zone')).toBe('America/New_York')
  })
  it('gives the hero the assistant plan progress, the same number as "Your next step"', async () => {
    const w = await mountDashboard({ next: { mode: 'normal', progress: { done: 7, total: 18 } } })
    expect(read(w, 'hero', 'data-plan')).toEqual({ done: 7, total: 18, ratio: 7 / 18 })
  })
  it('hides it when the assistant has nothing for this event', async () => {
    expect(read(await mountDashboard(), 'hero', 'data-plan')).toBeNull()
    expect(read(await mountDashboard({ next: { mode: 'unsupported', progress: { done: 0, total: 0 } } }), 'hero', 'data-plan')).toBeNull()
  })
  it('does not reuse the plan of another event', async () => {
    const w = await mountDashboard({ next: { mode: 'normal', progress: { done: 7, total: 18 } } })
    useAssistantStore().$patch({ eventId: 99 })
    await flushPromises()
    expect(read(w, 'hero', 'data-plan')).toBeNull()
  })
  it('gives the budget its own block: skeleton first, never a false "no expenses"', async () => {
    let resolve
    m.summary.mockReset()
    m.summary.mockReturnValue(new Promise(r => (resolve = r)))
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().initActiveEvent({ id: 7, eventName: 'XV', userRole: 'owner', modules: [{ key: 'budget', state: 'active' }] })
    m.next.mockResolvedValue({ mode: 'normal', progress: { done: 0, total: 0 } })
    const w = mount(Dashboard, { global: { plugins: [i18n, pinia], stubs } })
    await flushPromises()
    expect(w.find('[data-testid=budget-skeleton]').exists()).toBe(true)
    expect(w.find('[data-testid=budget-empty]').exists()).toBe(false)
    resolve({ cap: 18000, currency: 'USD', totals: totals(), categories: [], uncategorized: { itemCount: 1, totals: { estimated: 10, paid: 5 } } })
    await flushPromises()
    expect(w.find('[data-tile=cap]').text()).toContain('$18,000')
  })
  it('shows the budget error with retry, no empty state and no shared toast', async () => {
    const w = await mountDashboard({ summary: Promise.reject({ response: { status: 500 } }) })
    expect(w.find('[data-testid=dashboard-budget] [data-testid=block-error]').exists()).toBe(true)
    expect(w.find('[data-testid=budget-empty]').exists()).toBe(false)
    expect(useToast().toasts).toHaveLength(0)
    m.summary.mockResolvedValue({ cap: null, currency: 'USD', totals: totals({ overCap: false }), categories: [], uncategorized: { itemCount: 0 } })
    await w.get('[data-testid=dashboard-budget] [data-testid=block-retry]').trigger('click')
    await flushPromises()
    expect(w.find('[data-testid=budget-empty]').exists()).toBe(true)
  })
  it('never asks a viewer for the budget nor shows it', async () => {
    const w = await mountDashboard({ event: { userRole: 'viewer' } })
    expect(m.summary).not.toHaveBeenCalled()
    expect(w.find('[data-testid=dashboard-budget]').exists()).toBe(false)
    expect(w.text()).not.toMatch(/\$\d/)
  })
  it('asks for the budget only with view_budget (owners always have it)', async () => {
    await mountDashboard({ event: { userRole: 'editor' } })
    expect(m.summary).not.toHaveBeenCalled()
    m.summary.mockClear()
    await mountDashboard()
    expect(m.summary).toHaveBeenCalledWith(7)
  })
  it('hides the budget when the API says it is not for this role (403), and skips it without the module', async () => {
    m.summary.mockReset()
    m.summary.mockRejectedValue({ response: { status: 403, data: { code: 'forbidden' } } })
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().initActiveEvent({ id: 7, eventName: 'XV', userRole: 'editor', modules: [{ key: 'budget', state: 'active' }] })
    useEventsStore().eventPermissions = [{ name: 'view_budget' }]
    m.next.mockResolvedValue({ mode: 'normal', progress: { done: 0, total: 0 } })
    const w = mount(Dashboard, { global: { plugins: [i18n, pinia], stubs } })
    await flushPromises()
    expect(w.find('[data-testid=dashboard-budget]').exists()).toBe(false)
    expect(useToast().toasts).toHaveLength(0)
    const off = await mountDashboard({ event: { modules: [] } })
    expect(off.find('[data-testid=dashboard-budget]').exists()).toBe(false)
  })
})
