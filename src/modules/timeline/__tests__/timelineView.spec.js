import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn() }))
vi.mock('../services/timelineService', () => ({ default: api }))

import TimelineView from '../views/TimelineView.vue'
import MomentForm from '../components/MomentForm.vue'

const form = (startTime, endTime = '') => ({ title: ' Vals ', type: 'dance', description: '', startTime, endTime })

describe('TimelineView: new moments land on the event day', () => {
  async function setup(event) {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: 'owner', eventName: 'XV', modules: [], ...event }
    const w = shallowMount(TimelineView, { global: { plugins: [i18n, pinia], renderStubDefaultSlot: true } })
    await flushPromises()
    return w
  }
  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    api.list.mockResolvedValue([])
    api.create.mockResolvedValue({})
  })

  it("uses the event's wall-clock day from its ISO start (in UTC it is already the next day)", async () => {
    // 8 PM in Miami on January 2 is 01:00 UTC on January 3.
    const w = await setup({ startsAt: '2027-01-03T01:00:00Z', startDate: '', timezone: 'America/New_York' })
    w.findComponent(MomentForm).vm.$emit('save', form('21:00', '23:30'))
    await flushPromises()
    expect(api.create).toHaveBeenCalledWith(7, { title: 'Vals', type: 'dance', description: null, startTime: '2027-01-02 21:00:00', endTime: '2027-01-02 23:30:00' })
  })

  it('falls back to the text start date when the API sends no ISO moment', async () => {
    const w = await setup({ startDate: '01/02/2027 18:00', timezone: 'America/New_York' })
    w.findComponent(MomentForm).vm.$emit('save', form('19:30'))
    await flushPromises()
    expect(api.create.mock.calls[0][1].startTime).toBe('2027-01-02 19:30:00')
  })
})
