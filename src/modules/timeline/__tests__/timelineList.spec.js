import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), typical: vi.fn() }))
vi.mock('../services/timelineService', () => ({ default: api }))

import TimelineView from '../views/TimelineView.vue'

const at = (id, title, start, end = null, day = '20') => ({
  id,
  title,
  type: 'other',
  description: id === 1 ? 'Con la familia' : null,
  startTime: `2027-03-${day} ${start}:00`,
  endTime: end ? `2027-03-${end.day ?? day} ${end.time ?? end}:00` : null
})

const MOMENTS = [
  at(1, 'Entrada de la quinceañera y vals', '16:30', '17:30'),
  at(2, 'Cena', '18:15', '19:00'), // 45 min free before it
  at(3, 'Brindis', '18:45', '19:15'), // overlaps the dinner by 15 min
  at(4, 'Baile', '22:00', { day: '21', time: '01:00' }), // crosses midnight
  at(5, 'Cierre', '01:30', null, '21'),
  at(6, 'Fin', '03:00', null, '21')
]

async function setup(moments = MOMENTS, role = 'owner') {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: role, eventName: 'XV', modules: [], startDate: '03/20/2027 16:30' }
  api.list.mockResolvedValue(moments)
  const w = mount(TimelineView, { global: { plugins: [i18n, pinia], stubs: { MomentForm: true, UiModal: true, UiBottomSheet: true } } })
  await flushPromises()
  return w
}
const norm = text => text.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()

describe('timeline list', () => {
  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
  })

  it('draws an ordered list with one item per moment and a <time> for each hour', async () => {
    const w = await setup()
    const items = w.findAll('[data-testid="timeline-moment"]')
    expect(w.find('ol[data-testid="timeline-list"]').exists()).toBe(true)
    expect(items).toHaveLength(6)
    expect(items[0].find('time').attributes('datetime')).toBe('16:30')
    expect(items[0].findAll('time').some(t => t.attributes('datetime') === '17:30')).toBe(true)
  })

  it('shows the duration and the free or overlapping time between moments', async () => {
    const w = await setup()
    const links = w.findAll('[data-testid="timeline-link"]')
    // 17:30 -> 18:15 gap, 19:00 -> 18:45 overlap, 19:15 -> 22:00 gap, Baile ends 1:00 -> Cierre 1:30 gap; Cierre has no end, so nothing after it
    expect(links.map(l => l.attributes('data-kind'))).toEqual(['gap', 'overlap', 'gap', 'gap'])
    expect(norm(links[0].text())).toBe('45 min libre')
    expect(norm(links[1].text())).toBe('Se cruza 15 min con el anterior')
    expect(links[1].find('p').classes()).toContain('text-danger-700')
    expect(norm(links[2].text())).toBe('2 h 45 min libre')
    expect(norm(links[3].text())).toBe('30 min libre')
  })

  it('counts a moment that crosses midnight as 3 h, and shows nothing for one without an end', async () => {
    const w = await setup()
    const items = w.findAll('[data-testid="timeline-moment"]')
    expect(norm(items[3].find('[data-testid="timeline-hours"]').text())).toMatch(/–.*· 3 h$/)
    expect(norm(items[4].find('[data-testid="timeline-hours"]').text())).not.toContain('·')
    expect(items[4].text()).not.toContain('hasta')
  })

  it('omits the shared meridiem in the phone range', async () => {
    const w = await setup()
    const hours = norm(w.find('[data-testid="timeline-hours"]').text())
    expect(hours).toMatch(/^4:30 – 5:30 [ap]\.? ?m\.? · 1 h$/i)
  })

  it('names the actions for assistive technology', async () => {
    const w = await setup()
    const labels = w.findAll('button').map(b => b.attributes('aria-label'))
    expect(labels).toContain('Editar Cena')
    expect(labels).toContain('Quitar Cena')
    expect(labels).toContain('Acciones para Cena')
  })

  it('has no actions for a viewer', async () => {
    const w = await setup(MOMENTS, 'viewer')
    expect(w.find('[data-testid="timeline-actions"]').exists()).toBe(false)
    expect(w.find('[data-testid="timeline-more"]').exists()).toBe(false)
  })

  it('draws a single moment without a line', async () => {
    const w = await setup([MOMENTS[0]])
    expect(w.findAll('[data-testid="timeline-moment"]')).toHaveLength(1)
    expect(w.find('.bg-cream-300').exists()).toBe(false)
  })

  it('opens the form from the desktop button and the confirmation from the trash', async () => {
    const w = await setup()
    await w.find('[aria-label="Quitar Cena"]').trigger('click')
    expect(w.vm.removing.title).toBe('Cena')
  })

  it('from the phone sheet: Editar opens the form and Eliminar asks for confirmation', async () => {
    vi.useFakeTimers()
    try {
      const w = await setup()
      await w.findAll('[data-testid="timeline-more"]')[1].trigger('click')
      expect(w.vm.sheetOpen).toBe(true)
      expect(w.vm.sheetMoment.title).toBe('Cena')
      w.vm.fromSheet('remove')
      expect(w.vm.sheetOpen).toBe(false)
      vi.advanceTimersByTime(200)
      expect(w.vm.removing.title).toBe('Cena')
      w.vm.openSheet(MOMENTS[2])
      w.vm.fromSheet('edit')
      vi.advanceTimersByTime(200)
      expect(w.vm.editing.title).toBe('Brindis')
      expect(w.vm.formOpen).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('reads in English too', async () => {
    setLocale('en')
    const w = await setup()
    const links = w.findAll('[data-testid="timeline-link"]')
    expect(norm(links[0].text())).toBe('45 min free')
    expect(norm(links[1].text())).toBe('Overlaps the previous one by 15 min')
  })
})
