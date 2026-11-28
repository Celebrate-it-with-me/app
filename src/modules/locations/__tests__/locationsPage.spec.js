import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ list: vi.fn(), update: vi.fn(), remove: vi.fn() }))
const tl = vi.hoisted(() => ({ list: vi.fn() }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('../services/LocationsService', () => ({ default: api }))
vi.mock('@/modules/timeline/services/timelineService', () => ({ default: tl }))
vi.mock('@/ui/useToast', () => ({ useToast: () => toast }))

import LocationsView from '../views/LocationsView.vue'
import LocationCard from '../components/LocationCard.vue'
import LocationEmpty from '../components/LocationEmpty.vue'
import LocationForm from '../components/LocationForm.vue'

const place = (id, type, extra = {}) => ({ id, type, name: `Lugar ${id}`, address: '1 Main St', city: 'Miami', state: 'FL', zipCode: '33131', country: 'US', latitude: null, longitude: null, placeId: null, directions: null, images: [], ...extra })
const moment = (type, title, s, e) => ({ id: type, type, title, startTime: `2027-03-20 ${s}:00`, endTime: e ? `2027-03-20 ${e}:00` : null })

async function setup(places, moments, role = 'owner') {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: role, eventName: 'XV', modules: [] }
  api.list.mockResolvedValue(places)
  tl.list.mockResolvedValue(moments)
  const w = shallowMount(LocationsView, { global: { plugins: [i18n, pinia], renderStubDefaultSlot: true } })
  await flushPromises()
  return w
}

describe('LocationsView', () => {
  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    toast.success.mockReset()
    toast.error.mockReset()
  })

  it('draws the three sections with each place in its own', async () => {
    const w = await setup([place(1, 'ceremony'), place(2, 'reception'), place(3, 'other')], [])
    expect(w.find('[data-testid=section-ceremony]').findAllComponents(LocationCard)).toHaveLength(1)
    expect(w.find('[data-testid=section-reception]').findAllComponents(LocationCard)).toHaveLength(1)
    expect(w.find('[data-testid=section-other]').findAllComponents(LocationCard)).toHaveLength(1)
    expect(w.find('[data-testid=section-other]').text()).toContain('opcional')
    expect(w.findAllComponents(LocationEmpty)).toHaveLength(0)
  })

  it('names the program moment in the empty state, with its time', async () => {
    const w = await setup([place(1, 'ceremony')], [moment('reception', 'Recepción', '19:00', '23:00')])
    const empty = w.findComponent(LocationEmpty)
    expect(empty.props('title')).toBe('¿Dónde será la recepción?')
    expect(empty.props('text')).toContain('7:00')
  })

  it('invites to add the place when the program has no such moment, and stays neutral for the ceremony', async () => {
    const w = await setup([], [])
    const [ceremony, reception] = w.findAllComponents(LocationEmpty)
    expect(ceremony.props('title')).toBe('Sin ceremonia aparte')
    expect(reception.props('title')).toBe('Añade el lugar de la recepción')
  })

  it('opens the dialog with the type of the section', async () => {
    const w = await setup([], [])
    const [, reception] = w.findAllComponents(LocationEmpty)
    reception.vm.$emit('add')
    await flushPromises()
    const form = w.findComponent(LocationForm)
    expect(form.props('open')).toBe(true)
    expect(form.props('defaultType')).toBe('reception')
    await w.find('[data-testid=add-other]').trigger('click')
    expect(w.findComponent(LocationForm).props('defaultType')).toBe('other')
  })

  it('asks before removing from the menu', async () => {
    api.remove.mockResolvedValue()
    const w = await setup([place(1, 'ceremony')], [])
    w.findComponent(LocationCard).vm.$emit('remove', place(1, 'ceremony'))
    await flushPromises()
    expect(api.remove).not.toHaveBeenCalled()
    const modal = w.findComponent({ name: 'UiModal' })
    expect(modal.props('open')).toBe(true)
    expect(modal.text()).toContain('Lugar 1')
    await w.vm.confirmRemove()
    await flushPromises()
    expect(api.remove).toHaveBeenCalledWith(7, 1)
  })

  it('offers the reception for an other place and changes only the type', async () => {
    api.update.mockResolvedValue({})
    const other = place(3, 'other', { directions: 'Entrada lateral' })
    const w = await setup([place(1, 'ceremony'), other], [])
    const card = w.find('[data-testid=section-other]').findComponent(LocationCard)
    expect(card.props('suggestReception')).toBe(true)
    card.vm.$emit('retype', other)
    await flushPromises()
    expect(api.update).toHaveBeenCalledWith(7, 3, expect.objectContaining({ type: 'reception', name: 'Lugar 3', address: '1 Main St', directions: 'Entrada lateral', country: 'US' }))
  })

  it('does not suggest it when the reception already has a place', async () => {
    const w = await setup([place(2, 'reception'), place(3, 'other')], [])
    expect(w.find('[data-testid=section-other]').findComponent(LocationCard).props('suggestReception')).toBe(false)
  })

  it('shows the schedule from the program on ceremony and reception cards only', async () => {
    const w = await setup([place(1, 'ceremony'), place(3, 'other')], [moment('ceremony', 'Misa', '17:00', '18:00')])
    expect(w.find('[data-testid=section-ceremony]').findComponent(LocationCard).props('schedule')).toMatch(/5:00.*6:00/)
    expect(w.find('[data-testid=section-other]').findComponent(LocationCard).props('schedule')).toBe('')
  })
})

describe('LocationCard', () => {
  const card = (p = place(1, 'ceremony'), props = {}) =>
    mount(LocationCard, { props: { place: p, canEdit: true, ...props }, global: { plugins: [i18n], stubs: { UiDropdown: { name: 'UiDropdown', props: ['items'], template: '<div><slot name="trigger" /></div>' } } } })
  beforeEach(() => {
    setLocale('es')
    toast.success.mockReset()
    toast.error.mockReset()
  })

  it('writes the address in two lines and opens Maps in a new tab', () => {
    const w = card()
    expect(w.findAll('[data-testid=location-address] span').map(s => s.text())).toEqual(['1 Main St', 'Miami, FL 33131'])
    const a = w.find('[data-testid=location-directions]')
    expect(a.attributes('href')).toContain(encodeURIComponent('Lugar 1 1 Main St, Miami, FL 33131'))
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toBe('noopener noreferrer')
  })

  it('copies the address and thanks, or reports a failure without breaking', async () => {
    const writeText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const w = card()
    await w.find('[data-testid=location-copy]').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('1 Main St, Miami, FL 33131')
    expect(toast.success).toHaveBeenCalledWith('Dirección copiada')
    writeText.mockRejectedValue(new Error('insecure'))
    await w.find('[data-testid=location-copy]').trigger('click')
    await flushPromises()
    expect(toast.error).toHaveBeenCalled()
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    await w.find('[data-testid=location-copy]').trigger('click')
    await flushPromises()
    expect(toast.error).toHaveBeenCalledTimes(2)
  })

  it('has no edit actions for a viewer and the menu only with edit rights', () => {
    const w = card(place(1, 'ceremony'), { canEdit: false })
    expect(w.find('[data-testid=location-more]').exists()).toBe(false)
    expect(w.find('[data-testid=location-edit]').exists()).toBe(false)
    expect(w.find('[data-testid=location-directions]').exists()).toBe(true)
  })

  it('falls back to the placeholder when the static map fails', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'K')
    const w = card(place(1, 'ceremony', { latitude: 1, longitude: 2 }))
    expect(w.find('[data-testid=location-image]').attributes('data-kind')).toBe('map')
    await w.find('img').trigger('error')
    expect(w.find('[data-testid=location-image]').attributes('data-kind')).toBe('placeholder')
    vi.unstubAllEnvs()
  })

  it('uses the first photo before anything else', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'K')
    const w = card(place(1, 'ceremony', { images: [{ id: 1, path: 'https://x/a.jpg' }] }))
    expect(w.find('img').attributes('src')).toBe('https://x/a.jpg')
    vi.unstubAllEnvs()
  })

  it('emits edit, retype and the remove from the menu item', async () => {
    const w = card(place(3, 'other'), { suggestReception: true })
    await w.find('[data-testid=location-edit]').trigger('click')
    await w.find('[data-testid=location-suggestion] button').trigger('click')
    expect(w.emitted('edit')).toHaveLength(1)
    expect(w.emitted('retype')).toHaveLength(1)
    w.findComponent({ name: 'UiDropdown' }).props('items')[0].onSelect()
    expect(w.emitted('remove')[0][0].id).toBe(3)
  })
})
