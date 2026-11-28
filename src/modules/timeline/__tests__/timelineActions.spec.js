import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), typical: vi.fn() }))
vi.mock('../services/timelineService', () => ({ default: api }))

import TimelineView from '../views/TimelineView.vue'
import MomentForm from '../components/MomentForm.vue'

const moment = (id, title, start) => ({ id, title, type: 'other', description: null, startTime: `2027-03-20 ${start}:00`, endTime: null })
const MOMENTS = [moment(1, 'Ceremonia', '16:30'), moment(2, 'Cena', '18:15')]

let wrapper
async function setup() {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: 'owner', eventName: 'XV', modules: [], startDate: '03/20/2027 16:30' }
  api.list.mockResolvedValue(MOMENTS)
  wrapper = mount(TimelineView, { attachTo: document.body, global: { plugins: [i18n, pinia], stubs: { MomentForm: true } } })
  await flushPromises()
}
const sheetButton = label => [...document.querySelectorAll('[data-testid=timeline-sheet] button')].find(b => b.textContent.trim() === label)

beforeEach(() => {
  setLocale('es')
  Object.values(api).forEach(fn => fn.mockReset())
})
afterEach(() => {
  vi.useRealTimers()
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('TimelineView actions', () => {
  it('the pencil on a row opens the form with that moment', async () => {
    await setup()
    await wrapper.get(`button[aria-label="${i18n.global.t('app.timeline.editMoment', { name: 'Cena' })}"]`).trigger('click')
    expect(wrapper.findComponent(MomentForm).props('open')).toBe(true)
    expect(wrapper.findComponent(MomentForm).props('moment').id).toBe(2)
  })

  it('on a phone "⋯" opens a sheet; "Editar" and "Eliminar" act once the sheet has left', async () => {
    await setup()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await wrapper.findAll('[data-testid=timeline-more]')[0].trigger('click')
    await flushPromises()
    expect(document.body.textContent).toContain('Ceremonia')
    sheetButton(i18n.global.t('app.timeline.edit')).click()
    await flushPromises()
    expect(wrapper.findComponent(MomentForm).props('open')).toBe(false)
    await vi.advanceTimersByTimeAsync(600)
    expect(wrapper.findComponent(MomentForm).props('open')).toBe(true)
    expect(wrapper.findComponent(MomentForm).props('moment').id).toBe(1)

    await wrapper.findAll('[data-testid=timeline-more]')[1].trigger('click')
    await flushPromises()
    sheetButton(i18n.global.t('app.timeline.delete')).click()
    await vi.advanceTimersByTimeAsync(600)
    await flushPromises()
    expect(document.body.textContent).toContain(i18n.global.t('app.timeline.removeTitle'))
    expect(document.body.textContent).toContain('Cena')
  })

  it('does not act on a sheet choice if the page goes away first', async () => {
    await setup()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await wrapper.findAll('[data-testid=timeline-more]')[0].trigger('click')
    await flushPromises()
    sheetButton(i18n.global.t('app.timeline.delete')).click()
    wrapper.unmount()
    wrapper = null
    await vi.advanceTimersByTimeAsync(600)
    expect(document.body.textContent).not.toContain(i18n.global.t('app.timeline.removeTitle'))
  })
})
