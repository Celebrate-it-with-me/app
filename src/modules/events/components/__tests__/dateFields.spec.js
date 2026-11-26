import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'

const { CWM_API } = vi.hoisted(() => {
  const fail = () => Promise.reject(new Error('offline'))
  return { CWM_API: { get: fail, post: fail, put: fail, patch: fail, delete: fail } }
})
vi.mock('@/services/axios', () => ({ CWM_API }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/dashboard/x', name: 'x', params: { id: '7' }, query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  onBeforeRouteLeave: vi.fn()
}))

import i18n, { setLocale } from '@/locales/i18n'
import { UiDateTimeField } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import CreateEventView from '@/modules/events/views/CreateEventView.vue'
import EditEventView from '@/modules/events/views/EditEventView.vue'
import MomentForm from '@/modules/timeline/components/MomentForm.vue'
import TimelineView from '@/modules/timeline/views/TimelineView.vue'
import SaveTheDateView from '@/modules/save-the-date/views/SaveTheDateView.vue'
import PaymentModal from '@/modules/budget/components/PaymentModal.vue'
import ItemFormModal from '@/modules/budget/components/ItemFormModal.vue'
import CustomTaskModal from '@/modules/assistant/components/CustomTaskModal.vue'
import { useTimelineStore } from '@/modules/timeline/stores/timelineStore'

/** Each form asks for a date or a time through the one UiDateTimeField (never a bare native input). */
describe('forms use the spelled-out date field', () => {
  let pinia
  beforeEach(() => {
    setLocale('es')
    pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    useEventsStore().eventTypes = [{ id: 1, slug: 'quinceanera', name: 'Quinceañera' }]
    const event = { id: 7, userRole: 'owner', modules: [], eventName: 'Los XV', startDate: '01/02/2027 18:00', endDate: '01/03/2027 01:00', timezone: 'America/New_York', eventType: 1 }
    useEventsStore().events = [event]
    useEventsStore().activeEvent = event
  })

  const mountIt = (component, props = {}) =>
    shallowMount(component, { props, global: { plugins: [i18n, pinia], stubs: { RouterLink: true, RouterView: true }, renderStubDefaultSlot: true } })
  const modes = wrapper => wrapper.findAllComponents(UiDateTimeField).map(f => f.props('mode'))

  it.each([
    ['Create event', CreateEventView, {}, ['datetime']],
    ['Edit event', EditEventView, {}, ['datetime', 'datetime']],
    ['Timeline moment', MomentForm, { open: true }, ['time', 'time']],
    ['Budget payment', PaymentModal, { open: true, item: { id: 1, title: 'x' } }, ['date']],
    ['Budget item', ItemFormModal, { open: true }, ['date']],
    ['Custom task', CustomTaskModal, { open: true }, ['date']]
  ])('%s', async (_name, component, props, expected) => {
    const wrapper = mountIt(component, props)
    await flushPromises()
    expect(modes(wrapper)).toEqual(expected)
    // Typing in each field reaches the form (the v-model handler runs without throwing).
    for (const field of wrapper.findAllComponents(UiDateTimeField)) {
      field.vm.$emit('update:modelValue', field.props('mode') === 'time' ? '18:30' : field.props('mode') === 'date' ? '2027-01-02' : '2027-01-02T18:30')
    }
    await flushPromises()
    expect(wrapper.findAllComponents(UiDateTimeField).map(f => f.props('modelValue')).every(Boolean)).toBe(true)
    expect(wrapper.html()).not.toMatch(/type="(date|time|datetime-local)"/)
  })

  it('Save the date prints the date of the event spelled out, never 01/02/2027', async () => {
    const wrapper = mountIt(SaveTheDateView)
    await flushPromises()
    expect(wrapper.text()).not.toContain('01/02/2027')
  })

  it('the program lists times in 12 hours', async () => {
    useTimelineStore().timelines = [{ id: 1, title: 'Misa', type: 'ceremony', startTime: '2027-01-02 16:30:00', endTime: '2027-01-02 17:30:00', description: '' }]
    const wrapper = mountIt(TimelineView)
    await flushPromises()
    expect(wrapper.text().replace(/\s+/g, ' ')).toMatch(/4:30 p\.\s?m\. – 5:30 p\.\s?m\./)
  })
})
