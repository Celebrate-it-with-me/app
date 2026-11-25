import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'

const m = vi.hoisted(() => ({ loadStats: vi.fn(), activities: vi.fn(), progress: vi.fn(), templates: vi.fn(), list: vi.fn(), summary: vi.fn() }))
vi.mock('@/modules/rsvp/services/RsvpService', () => ({ default: { loadStats: m.loadStats } }))
vi.mock('@/services/ActivityService', () => ({ default: { loadDashboardActivities: m.activities } }))
vi.mock('@/modules/onboarding/services/OnboardingService', () => ({ default: { progress: m.progress } }))
vi.mock('@/modules/template-picker/services/TemplatePickerService', () => ({ default: { templates: m.templates } }))
vi.mock('@/modules/timeline/services/timelineService', () => ({ default: { list: m.list } }))
vi.mock('@/modules/budget/services/BudgetService', () => ({ default: { summary: m.summary } }))
vi.mock('@/modules/email-verification/components/EmailVerifyNotice.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/services/axios', () => ({ CWM_API: { get: vi.fn() } }))

import Dashboard from '../Dashboard.vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useAssistantStore } from '@/modules/assistant/stores/useAssistantStore'

const stubs = {
  RouterLink: { props: ['to'], template: '<a><slot /></a>' },
  DashboardHero: { props: ['plan'], template: '<div data-testid="hero" :data-plan="JSON.stringify(plan)" />' },
  DashboardMore: { props: ['budget'], template: '<div data-testid="more" :data-budget="JSON.stringify(budget)" />' }
}

const totals = extra => ({ estimated: 18530.1, owed: 18530.1, paid: 100, remaining: 0, estimatedOverCap: true, estimatedOverByCents: 53010, overCap: true, overByCents: 53010, paidOverCap: false, paidOverByCents: 0, ...extra })

async function mountDashboard({ next = null, summary = { cap: 18000, currency: 'USD', totals: totals(), categories: [], uncategorized: { itemCount: 1 } } } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  m.summary.mockResolvedValue(summary)
  useEventsStore().initActiveEvent({ id: 7, guestsCount: 5, eventName: 'XV', userRole: 'owner', modules: [{ key: 'budget', state: 'active' }] })
  if (next) useAssistantStore().$patch({ eventId: 7, next })
  const w = mount(Dashboard, { global: { plugins: [i18n, pinia], stubs } })
  await flushPromises()
  return w
}
const read = (w, id, attr) => JSON.parse(w.get(`[data-testid=${id}]`).attributes(attr))

beforeEach(() => {
  setLocale('es')
  localStorage.clear()
  Object.values(m).forEach(fn => fn.mockReset())
  m.loadStats.mockResolvedValue({ status: 200, data: { totals: { people: 5 } } })
  m.activities.mockResolvedValue({ status: 200, data: { data: [] } })
  m.progress.mockResolvedValue({})
  m.templates.mockResolvedValue([])
  m.list.mockResolvedValue([])
})

describe('Dashboard home data', () => {
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
  it('passes the overage of what is owed (the card "estimated") and of what is paid', async () => {
    const w = await mountDashboard({ summary: { cap: 18000, currency: 'USD', totals: totals({ paidOverCap: true, paidOverByCents: 250 }), categories: [], uncategorized: { itemCount: 1 } } })
    expect(read(w, 'more', 'data-budget')).toMatchObject({ estimated: 18530.1, overByCents: 53010, paidOverByCents: 250 })
  })
  it('passes zeros without a cap or with an old API', async () => {
    const free = await mountDashboard({ summary: { cap: null, totals: totals({ overCap: false, overByCents: 0, paidOverCap: false }), categories: [], uncategorized: { itemCount: 1 } } })
    expect(read(free, 'more', 'data-budget')).toMatchObject({ overByCents: 0, paidOverByCents: 0 })
    const old = await mountDashboard({ summary: { cap: 10, totals: { owed: 20, paid: 1, overCap: true }, categories: [], uncategorized: { itemCount: 1 } } })
    expect(read(old, 'more', 'data-budget')).toMatchObject({ overByCents: 0 })
  })
})
