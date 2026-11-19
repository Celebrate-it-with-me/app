import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const roster = vi.hoisted(() => ({ list: vi.fn(), update: vi.fn() }))
const wizard = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn(), markShared: vi.fn(), unmarkShared: vi.fn() }))
vi.mock('../services/RosterService', () => ({ default: roster }))
vi.mock('../services/SendWizardService', () => ({ default: wizard }))
vi.mock('../services/WhatsappService', () => ({ default: { send: vi.fn(), retry: vi.fn() } }))
import RosterView from '../views/RosterView.vue'
import GuestCard from '../components/GuestCard.vue'

const family = (id, name, extra = {}) => ({ id, name, phone: '+13055550123', email: null, status: 'pending', link: `https://q.test/i/xv/${id}`, companions: [], notes: null, locale: null, delivery: { state: 'none' }, ...extra })
const counts = { all: 3, attending: 0, notAttending: 0, pending: 3, delivery: { unsent: 3 } }
const page = data => ({ data, meta: { currentPage: 1, lastPage: 1, total: data.length }, counts })
let wrapper
let router
const body = () => document.body.textContent
const button = text => [...document.body.querySelectorAll('button')].find(b => b.textContent.trim().includes(text))

async function setup({ modules = [{ key: 'whatsapp', state: 'locked' }] } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: 'owner', modules, eventName: 'Los XV' }
  router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }, { path: '/edit/:id', name: 'edit-event', component: { template: '<div />' } }] })
  await router.push('/')
  wrapper = mount(RosterView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  roster.list.mockReset()
  roster.list.mockResolvedValue(page([family(1, 'Ana Perez'), family(2, 'Beto Ruiz'), family(3, 'Lucia Mora')]))
  wizard.audience.mockResolvedValue({ event: { published: false }, rsvp: { isOpen: true }, mode: { automatic: false } })
  wizard.allRecipients.mockResolvedValue([
    { id: 1, name: 'Ana Perez', people: 1, phone: '+13055550123', status: 'pending', reason: 'invalid_phone', delivery: { state: 'none' } }
  ])
  wizard.allRoster.mockResolvedValue([family(1, 'Ana Perez')])
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('RosterView mobile send bar', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows the fixed bar only once the inline button has scrolled away', async () => {
    let notify
    const disconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', class { constructor(cb) { notify = cb } observe() {} disconnect() { disconnect() } })
    await setup()
    const bar = () => document.querySelector('[data-testid="send-bar"]')
    expect(bar()).not.toBeNull()
    notify([{ isIntersecting: true }])
    await flushPromises()
    expect(bar()).toBeNull()
    expect(wrapper.find('div').classes().join(' ')).not.toContain('pb-[calc')
    expect(document.querySelector('[data-testid="send-inline"]')).not.toBeNull()
    notify([{ isIntersecting: false }])
    await flushPromises()
    expect(bar()).not.toBeNull()
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
    wrapper = null
  })

  it('opens the wizard from the inline button', async () => {
    await setup()
    document.querySelector('[data-testid="send-inline"] button').click()
    await flushPromises()
    expect(body()).toContain('¿A quién se lo enviamos?')
  })
})

describe('RosterView send wizard (manual)', () => {
  it('opens from the header and mobile bar buttons, and shows the bar clear of the list', async () => {
    await setup()
    expect(wrapper.find('div').classes().join(' ')).toContain('pb-[calc(12.5rem')
    button('Enviar invitaciones').click()
    await flushPromises()
    expect(body()).toContain('¿A quién se lo enviamos?')
    expect(body()).not.toContain('Qué quieres enviar')
  })

  it('keeps the previous dialog when the WhatsApp module is on', async () => {
    await setup({ modules: [{ key: 'whatsapp', state: 'active' }] })
    wrapper.findAllComponents(GuestCard)[0].vm.$emit('send', family(1, 'Ana Perez'))
    await flushPromises()
    expect(body()).toContain('Qué quieres enviar')
    expect(wizard.audience).not.toHaveBeenCalled()
  })

  it('opens the form over the wizard to fix a phone, using the family of the page', async () => {
    await setup()
    button('Enviar invitaciones').click()
    await flushPromises()
    button('Corregir').click()
    await flushPromises()
    expect(body()).toContain('Editar')
  })

  it('looks the family up when she is not on the page, and says so if she cannot be found', async () => {
    await setup()
    const emit = (id, name) => wrapper.findComponent({ name: 'SendWizard' }).vm.$emit('edit-guest', { id, name })
    roster.list.mockResolvedValueOnce(page([family(99, 'Zoe')]))
    emit(99, 'Zoe')
    await flushPromises()
    expect(roster.list).toHaveBeenCalledWith(7, { search: 'Zoe', perPage: 100 })
    expect(body()).toContain('Editar')
    roster.list.mockResolvedValueOnce(page([]))
    emit(98, 'Nadie')
    await flushPromises()
    roster.list.mockRejectedValueOnce(new Error('x'))
    emit(97, 'Falla')
    await flushPromises()
    expect(useToast().toasts.length).toBeGreaterThanOrEqual(1)
  })

  it('goes to publish the event, to the plan, and back to the list when it closes', async () => {
    await setup()
    button('Enviar invitaciones').click()
    await flushPromises()
    const calls = roster.list.mock.calls.length
    const w = wrapper.findComponent({ name: 'SendWizard' })
    w.vm.$emit('publish')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('edit-event')
    w.vm.$emit('closed')
    await flushPromises()
    expect(roster.list.mock.calls.length).toBeGreaterThan(calls)
    w.vm.$emit('unlock')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/dashboard/unlock/whatsapp')
  })

  it('closes the wizard and opens the add form from the empty state', async () => {
    await setup()
    button('Enviar invitaciones').click()
    await flushPromises()
    wrapper.findComponent({ name: 'SendWizard' }).vm.$emit('add-guest')
    await flushPromises()
    expect(body()).toContain('Añadir')
  })
})
