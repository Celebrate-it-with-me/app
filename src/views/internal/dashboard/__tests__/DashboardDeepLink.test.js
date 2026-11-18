import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'

const m = vi.hoisted(() => ({
  loadStats: vi.fn(),
  activities: vi.fn(),
  progress: vi.fn(),
  templates: vi.fn(),
  list: vi.fn()
}))
vi.mock('@/modules/rsvp/services/RsvpService', () => ({ default: { loadStats: m.loadStats } }))
vi.mock('@/services/ActivityService', () => ({ default: { loadDashboardActivities: m.activities } }))
vi.mock('@/modules/onboarding/services/OnboardingService', () => ({ default: { progress: m.progress } }))
vi.mock('@/modules/template-picker/services/TemplatePickerService', () => ({ default: { templates: m.templates } }))
vi.mock('@/modules/timeline/services/timelineService', () => ({ default: { list: m.list } }))
vi.mock('@/modules/email-verification/components/EmailVerifyNotice.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/services/axios', () => ({ CWM_API: { get: vi.fn() } }))

import Dashboard from '../Dashboard.vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useUserStore } from '@/stores/useUserStore'

const stubs = {
  RouterLink: { props: ['to'], template: '<a><slot /></a>' },
  DashboardHero: { template: '<div />' },
  DashboardMore: { template: '<div />' }
}

function setup() {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return pinia
}

beforeEach(() => {
  setLocale('es')
  localStorage.clear()
  Object.values(m).forEach(fn => fn.mockReset())
  m.loadStats.mockResolvedValue({ status: 200, data: { attending: { total: 3, guests: 2 }, pending: { total: 2, guests: 1 }, not_attending: { total: 0 }, totals: { people: 5, guests: 3 } } })
  m.activities.mockResolvedValue({ status: 200, data: { data: [] } })
  m.progress.mockResolvedValue({})
  m.templates.mockResolvedValue([])
  m.list.mockResolvedValue([])
})

describe('Dashboard after a deep link', () => {
  it('asks for the stats of the hydrated event and does not show the empty state', async () => {
    const pinia = setup()
    // What the hydration does for a deep link: the event object arrives through initActiveEvent.
    useEventsStore().initActiveEvent({ id: 7, guestsCount: 5, eventName: 'XV', userRole: 'owner' })
    expect(useUserStore().activeEvent).toBe(7)

    const wrapper = mount(Dashboard, { global: { plugins: [i18n, pinia], stubs } })
    await flushPromises()

    expect(m.loadStats).toHaveBeenCalledWith({ eventId: 7 })
    expect(m.activities).toHaveBeenCalledWith({ eventId: 7 })
    expect(wrapper.find('[data-testid=stats-empty]').exists()).toBe(false)
  })
})
