import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n from '@/locales/i18n'

const api = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn(), runAction: vi.fn(), removeCurrentEvent: vi.fn(), loadEventsPlansAndType: vi.fn() }))
vi.mock('../../services/EventsService', () => ({ default: api }))

import EditEventView from '../EditEventView.vue'
import { useEventsStore } from '../../stores/useEventsStore'

const baseEvent = {
  id: 7,
  eventName: 'Los XV de Valentina',
  eventDescription: '',
  eventType: 1,
  status: 'draft',
  startDate: '12/01/2027 18:00',
  endDate: null,
  customUrlSlug: 'los-xv-de-valentina',
  slugLocked: false,
  locale: 'es',
  currency: 'USD',
  timezone: 'America/New_York',
  userRole: 'owner',
  guestsCount: 0
}

const mounted = []
async function setup(event = baseEvent) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const store = useEventsStore()
  store.eventTypes = [{ id: 1, slug: 'quinceanera' }]
  store.events = [{ ...event }]
  api.get.mockResolvedValue({ data: { data: { ...event } } })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>dash</div>' } },
      { path: '/dashboard/events', component: { template: '<div>events</div>' } },
      { path: '/dashboard/events/:id/edit', name: 'edit-event', component: EditEventView }
    ]
  })
  router.push('/dashboard/events/7/edit')
  await router.isReady()
  const wrapper = mount({ template: '<router-view />' }, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
  mounted.push(wrapper)
  return { wrapper, router, store }
}

const saveButton = wrapper => wrapper.findAll('button[type="submit"]')[0]

afterEach(() => {
  mounted.splice(0).forEach(w => w.unmount())
})

beforeEach(() => {
  vi.clearAllMocks()
  api.loadEventsPlansAndType.mockResolvedValue({ status: 200, data: { data: { eventTypes: [], eventPlans: [] } } })
})

describe('EditEventView', () => {
  it('shows the regional settings and keeps save disabled until something changes', async () => {
    const { wrapper } = await setup()
    expect(wrapper.text()).toContain('Event language')
    expect(wrapper.text()).toContain('Currency')
    expect(wrapper.text()).toContain('Time zone')
    expect(saveButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('saves only what changed with PATCH', async () => {
    const { wrapper } = await setup()
    api.update.mockResolvedValue({ data: { data: { ...baseEvent, eventName: 'Mis XV' } } })
    await wrapper.get('#event_name').setValue('Mis XV')
    expect(saveButton(wrapper).attributes('disabled')).toBeUndefined()
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.update).toHaveBeenCalledWith(7, { eventName: 'Mis XV' })
  })

  it('shows the 422 messages next to their fields', async () => {
    const { wrapper } = await setup()
    api.update.mockRejectedValue({ response: { status: 422, data: { errors: { timezone: ['The timezone field must be a valid time zone.'] } } } })
    await wrapper.get('#event_name').setValue('Otro')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('#event_timezone-msg').text()).toBe('Choose one of the options in the list.')
    // Still unsaved: the button stays available to retry.
    expect(saveButton(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('validates required fields before calling the API', async () => {
    const { wrapper } = await setup()
    await wrapper.get('#event_name').setValue('   ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.update).not.toHaveBeenCalled()
    expect(wrapper.get('#event_name-msg').text()).not.toBe('')
  })

  it('shows the public address read-only with an explanation once published', async () => {
    const { wrapper } = await setup({ ...baseEvent, status: 'published', slugLocked: true })
    const address = wrapper.get('#event_address')
    expect(address.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('can no longer be changed')
  })

  it('asks before leaving with unsaved changes, and lets you stay', async () => {
    const { wrapper, router } = await setup()
    await wrapper.get('#event_name').setValue('Mis XV')
    const leaving = router.push('/dashboard/events')
    await flushPromises()
    expect(document.body.textContent).toContain('Leave without saving?')
    const stay = [...document.body.querySelectorAll('button')].find(b => b.textContent.includes('Keep editing'))
    stay.click()
    await leaving
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/dashboard/events/7/edit')
  })

  it('leaves without asking when nothing changed', async () => {
    const { router } = await setup()
    await router.push('/dashboard/events')
    expect(router.currentRoute.value.path).toBe('/dashboard/events')
  })

  it('sends a viewer back to the dashboard: there is nothing for them to edit', async () => {
    const { router } = await setup({ ...baseEvent, userRole: 'viewer' })
    expect(router.currentRoute.value.name).toBe('dashboard')
  })
})
