import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), removeImage: vi.fn(), addImages: vi.fn() }))
const tl = vi.hoisted(() => ({ list: vi.fn() }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('../services/LocationsService', () => ({ default: api }))
vi.mock('@/modules/timeline/services/timelineService', () => ({ default: tl }))
vi.mock('@/ui/useToast', () => ({ useToast: () => toast }))
vi.mock('@/utils/googleMaps', () => ({ loadGoogleLibraries: vi.fn().mockRejectedValue(new Error('no google')) }))

import LocationsView from '../views/LocationsView.vue'
import LocationCard from '../components/LocationCard.vue'
import LocationForm from '../components/LocationForm.vue'
import LocationEmpty from '../components/LocationEmpty.vue'

const place = (id, type, extra = {}) => ({ id, type, name: `Lugar ${id}`, address: '1 Main St', city: 'Miami', state: 'FL', zipCode: '33131', country: 'US', latitude: null, longitude: null, placeId: null, directions: null, images: [], ...extra })

async function setup(places, role = 'owner') {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: role, eventName: 'XV', modules: [] }
  api.list.mockResolvedValue(places)
  tl.list.mockResolvedValue([])
  const w = shallowMount(LocationsView, { global: { plugins: [i18n, pinia], renderStubDefaultSlot: true } })
  await flushPromises()
  return w
}

beforeEach(() => {
  setLocale('es')
  Object.values(api).forEach(fn => fn.mockReset())
  toast.success.mockReset()
  toast.error.mockReset()
})

describe('LocationsView actions', () => {
  it('editing a card opens the dialog with that place', async () => {
    const w = await setup([place(1, 'ceremony')])
    w.findComponent(LocationCard).vm.$emit('edit', place(1, 'ceremony'))
    await flushPromises()
    const form = w.findComponent(LocationForm)
    expect(form.props('open')).toBe(true)
    expect(form.props('location').id).toBe(1)
  })

  it('editing an other place from its card opens that place too', async () => {
    const w = await setup([place(3, 'other')])
    w.find('[data-testid=section-other]').findComponent(LocationCard).vm.$emit('edit', place(3, 'other'))
    await flushPromises()
    expect(w.findComponent(LocationForm).props('location').id).toBe(3)
  })

  it('closes the dialog when it asks to be closed', async () => {
    const w = await setup([])
    w.find('[data-testid=add-other]').trigger('click')
    await flushPromises()
    expect(w.findComponent(LocationForm).props('open')).toBe(true)
    w.findComponent(LocationForm).vm.$emit('update:open', false)
    await flushPromises()
    expect(w.findComponent(LocationForm).props('open')).toBe(false)
  })

  it('saves a new place, uploads its photos and closes the dialog', async () => {
    api.create.mockResolvedValue({ id: 20 })
    api.addImages.mockResolvedValue()
    const w = await setup([])
    const form = { type: 'reception', name: 'Jardín', address: '1 Main', city: 'Miami', state: '', zipCode: '', country: 'US', latitude: null, longitude: null, placeId: '', directions: '' }
    w.findComponent(LocationForm).vm.$emit('save', { form, files: [new File(['x'], 'a.png', { type: 'image/png' })], googlePhotos: ['https://g/1'], removedImageIds: [] })
    await flushPromises()
    expect(api.create).toHaveBeenCalledWith(7, expect.objectContaining({ name: 'Jardín', type: 'reception' }))
    expect(api.addImages).toHaveBeenCalledWith(7, 20, expect.objectContaining({ googlePhotos: ['https://g/1'] }))
    expect(toast.success).toHaveBeenCalled()
    expect(w.findComponent(LocationForm).props('open')).toBe(false)
  })

  it('updates an existing place, removes the dropped photos and does not upload when there are none new', async () => {
    api.update.mockResolvedValue({ id: 1 })
    api.removeImage.mockResolvedValue()
    const w = await setup([place(1, 'ceremony')])
    w.findComponent(LocationCard).vm.$emit('edit', place(1, 'ceremony'))
    await flushPromises()
    const form = { type: 'ceremony', name: 'Iglesia', address: '1 Main', city: 'Miami', state: '', zipCode: '', country: 'US', latitude: null, longitude: null, placeId: '', directions: '' }
    w.findComponent(LocationForm).vm.$emit('save', { form, files: [], googlePhotos: [], removedImageIds: [5, 6] })
    await flushPromises()
    expect(api.update).toHaveBeenCalledWith(7, 1, expect.objectContaining({ name: 'Iglesia' }))
    expect(api.removeImage).toHaveBeenCalledTimes(2)
    expect(api.addImages).not.toHaveBeenCalled()
  })

  it('shows the server message about a bad photo, or a generic error, and keeps the dialog open', async () => {
    const w = await setup([])
    const payload = { form: { type: 'other', name: 'X', address: 'y', city: 'z', state: '', zipCode: '', country: 'US', latitude: null, longitude: null, placeId: '', directions: '' }, files: [], googlePhotos: [], removedImageIds: [] }
    api.create.mockRejectedValueOnce({ response: { data: { errors: { images: ['La foto pesa demasiado'] } } } })
    w.findComponent(LocationForm).vm.$emit('save', payload)
    await flushPromises()
    expect(toast.error).toHaveBeenLastCalledWith('La foto pesa demasiado')
    api.create.mockRejectedValueOnce(new Error('500'))
    w.findComponent(LocationForm).vm.$emit('save', payload)
    await flushPromises()
    expect(toast.error).toHaveBeenLastCalledWith(i18n.global.t('app.locations.saveError'))
  })

  it('says so when moving an other place to reception fails, or when removing fails', async () => {
    const other = place(3, 'other')
    const w = await setup([other])
    api.update.mockRejectedValue(new Error('500'))
    w.find('[data-testid=section-other]').findComponent(LocationCard).vm.$emit('retype', other)
    await flushPromises()
    expect(toast.error).toHaveBeenLastCalledWith(i18n.global.t('app.locations.saveError'))
    api.remove.mockRejectedValue(new Error('500'))
    w.find('[data-testid=section-other]').findComponent(LocationCard).vm.$emit('remove', other)
    await flushPromises()
    await w.vm.confirmRemove()
    await flushPromises()
    expect(toast.error).toHaveBeenCalledTimes(2)
  })

  it('reports a failure to load the places', async () => {
    api.list.mockRejectedValue(new Error('500'))
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: 'owner', eventName: 'XV', modules: [] }
    shallowMount(LocationsView, { global: { plugins: [i18n, pinia] } })
    await flushPromises()
    expect(toast.error).toHaveBeenCalledWith(i18n.global.t('app.locations.loadError'))
  })
})

describe('LocationEmpty', () => {
  it('invites an editor to add the place and stays quiet for a viewer', async () => {
    const props = { title: 'Sin recepción', text: 'Añade el lugar', action: 'Añadir lugar' }
    const editor = mount(LocationEmpty, { props: { ...props, canEdit: true } })
    await editor.get('[data-testid=location-empty-add]').trigger('click')
    expect(editor.emitted('add')).toHaveLength(1)
    const viewer = mount(LocationEmpty, { props })
    expect(viewer.text()).toContain('Sin recepción')
    expect(viewer.find('[data-testid=location-empty-add]').exists()).toBe(false)
  })
})

describe('LocationForm dialog', () => {
  let w
  afterEach(() => {
    w?.unmount()
    document.body.innerHTML = ''
  })
  const open = async (props = {}) => {
    w = mount(LocationForm, { props: { open: false, eventId: 7, ...props }, attachTo: document.body, global: { plugins: [i18n] } })
    await w.setProps({ open: true })
    await flushPromises()
  }

  it('starts empty with the type of the section that opened it, and asks for what is missing', async () => {
    await open({ defaultType: 'reception' })
    expect(document.body.textContent).toContain(i18n.global.t('app.locations.addTitle'))
    document.querySelector('#location-form').dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
    expect(w.emitted('save')).toBeUndefined()
    expect(document.querySelectorAll('[role="alert"], [id$="-error"]').length).toBeGreaterThan(0)
  })

  it('opens with the place filled in when editing and sends the form on save; the address search is optional', async () => {
    await open({ location: place(1, 'ceremony', { name: 'Iglesia San José', images: [{ id: 4, url: 'https://x/y.png' }] }) })
    expect(document.body.textContent).toContain(i18n.global.t('app.locations.editTitle'))
    expect([...document.querySelectorAll('input')].some(i => i.value === 'Iglesia San José')).toBe(true)
    expect(document.body.textContent).toContain(i18n.global.t('app.locations.searchOff'))
    document.querySelector('#location-form').dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()
    expect(w.emitted('save')[0][0].form.name).toBe('Iglesia San José')
    expect(w.emitted('save')[0][0].removedImageIds).toEqual([])
  })
})
