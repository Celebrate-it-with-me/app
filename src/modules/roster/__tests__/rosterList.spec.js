import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const roster = vi.hoisted(() => ({ list: vi.fn() }))
vi.mock('../services/RosterService', () => ({ default: roster }))
const wizardService = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn(), markShared: vi.fn(), unmarkShared: vi.fn() }))
vi.mock('../services/SendWizardService', () => ({ default: wizardService }))
vi.mock('../services/WhatsappService', () => ({ default: { send: vi.fn(), retry: vi.fn() } }))
import RosterView from '../views/RosterView.vue'
import GuestCard from '../components/GuestCard.vue'

const family = (id, name, extra = {}) => ({ id, name, phone: '+13055550123', email: null, status: 'pending', link: `https://q.test/i/xv/${id}`, companions: [], notes: null, locale: null, delivery: { state: 'none' }, ...extra })
const delivery = { unsent: 3, queued: 0, sent: 1, delivered: 2, read: 1, failed: 1, noPhone: 0, shared: 0 }
const counts = { all: 8, attending: 2, notAttending: 1, pending: 5, delivery }
const page = (data, extra = {}) => ({ data, meta: { currentPage: 1, lastPage: 1, total: data.length }, counts, ...extra })
let wrapper
let router
const body = () => document.body.textContent
const button = text => [...document.body.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(text))
const chip = text => [...document.body.querySelectorAll('[data-testid="delivery-chips"] button')].find(b => b.textContent.includes(text))

async function setup({ role = 'owner', modules = [{ key: 'whatsapp', state: 'active' }], query = '/' } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: role, modules, eventName: 'Los XV' }
  router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }, { path: '/:p(.*)', component: { template: '<div />' } }] })
  await router.push(query)
  wrapper = mount(RosterView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  roster.list.mockReset()
  wizardService.audience.mockResolvedValue({ event: { published: true }, rsvp: { isOpen: true }, mode: { automatic: false } })
  wizardService.allRecipients.mockResolvedValue([])
  wizardService.allRoster.mockResolvedValue([])
  roster.list.mockResolvedValue(page([family(1, 'Ana Perez'), family(2, 'Beto Ruiz', { phone: null }), family(3, 'Lucia Mora', { delivery: { state: 'read' } })]))
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('RosterView list', () => {
  it('puts the filters before the list, with the delivery state in each row', async () => {
    await setup()
    const html = document.body.innerHTML
    expect(html.indexOf('data-testid="delivery-chips"')).toBeLessThan(html.indexOf('Ana Perez'))
    expect(html.indexOf('role="tablist"')).toBeLessThan(html.indexOf('Ana Perez'))
    expect(body()).toContain('Sin enviar')
    expect(body()).toContain('Sin teléfono')
    expect(body()).toContain('Leído')
    expect(chip('Sin enviar').textContent).toContain('3')
    expect(chip('Enviadas').textContent).toContain('4')
    expect(chip('Con problema').textContent).toContain('1')
    expect(document.querySelector('[role="checkbox"]')).toBeNull()
  })

  it('shows a soft red chip with "n of limit" only when the list is over the plan limit', async () => {
    await setup()
    expect(document.querySelector('[data-testid="over-limit-chip"]')).toBeNull()
    wrapper.unmount()
    roster.list.mockResolvedValue(page([family(1, 'Ana Perez')], { counts: { ...counts, all: 39, limit: 30 } }))
    await setup()
    expect(document.querySelector('[data-testid="over-limit-chip"]').textContent).toContain('39 de 30')
  })

  it('filters by delivery from the chips, toggles it off, and keeps it in the address', async () => {
    await setup()
    chip('Con problema').click()
    await flushPromises()
    expect(roster.list).toHaveBeenLastCalledWith(7, expect.objectContaining({ delivery: 'problem', page: 1 }))
    expect(router.currentRoute.value.query.delivery).toBe('problem')
    expect(chip('Con problema').getAttribute('aria-pressed')).toBe('true')
    chip('Con problema').click()
    await flushPromises()
    expect(roster.list).toHaveBeenLastCalledWith(7, expect.objectContaining({ delivery: null }))
    expect(router.currentRoute.value.query.delivery).toBeUndefined()
  })

  it('starts from the filters in the address and says when a filter finds nobody', async () => {
    roster.list.mockResolvedValue(page([]))
    await setup({ query: '/?status=pending&delivery=unsent' })
    expect(roster.list).toHaveBeenCalledWith(7, expect.objectContaining({ status: 'pending', delivery: 'unsent' }))
    expect(body()).toContain('No encontramos a nadie')
    expect(router.currentRoute.value.query).toEqual({ status: 'pending', delivery: 'unsent' })
  })

  it('names the middle chip "Abiertas" in manual mode and hides the problem chip', async () => {
    roster.list.mockResolvedValue(page([family(1, 'Ana Perez')], { counts: { ...counts, delivery: { unsent: 5, shared: 3 } } }))
    await setup({ modules: [{ key: 'whatsapp', state: 'locked' }] })
    expect(chip('Abiertas').textContent).toContain('3')
    expect(chip('Con problema')).toBeUndefined()
  })

  it('has one main action: the header button on desktop and the bar on phones, with the unsent count', async () => {
    await setup()
    expect(document.querySelector('[data-testid="send-header"]').textContent).toContain('Enviar invitaciones')
    expect(document.querySelector('[data-testid="send-bar"]').textContent).toContain('Enviar invitaciones · 3 sin enviar')
    button('Enviar invitaciones ·').click()
    await flushPromises()
    expect(body()).toContain('Nadie por ahora')
  })

  it('shows the plain label in the bar when nothing is left to send', async () => {
    roster.list.mockResolvedValue(page([family(1, 'Ana Perez')], { counts: { ...counts, delivery: { ...delivery, unsent: 0 } } }))
    await setup()
    expect(document.querySelector('[data-testid="send-bar"]').textContent.trim()).toBe('Enviar invitaciones')
    expect(document.querySelector('[data-testid="send-header"]').textContent).not.toMatch(/\d/)
  })

  it('does not offer to send to viewers, nor to an empty list', async () => {
    await setup({ role: 'viewer' })
    expect(document.querySelector('[data-testid="send-bar"]')).toBeNull()
    expect(document.querySelector('[data-testid="send-header"]')).toBeNull()
    expect(body()).toContain('Ana Perez')
  })

  it('sends to one family from her menu: the wizard opens with her preselected (automatic)', async () => {
    await setup()
    wrapper.findAllComponents(GuestCard)[0].vm.$emit('send', family(1, 'Ana Perez'))
    await flushPromises()
    const wizardProps = wrapper.findComponent({ name: 'SendWizard' }).props()
    expect(wizardProps.preselectedIds).toEqual([1])
    expect(wizardProps.mode).toBe('automatic')
    expect(wizardProps.open).toBe(true)
  })

  it('opens the wizard with one family preselected in manual mode', async () => {
    await setup({ modules: [{ key: 'whatsapp', state: 'locked' }] })
    wrapper.findAllComponents(GuestCard)[0].vm.$emit('send', family(1, 'Ana Perez'))
    await flushPromises()
    expect(body()).toContain('Enviar invitaciones')
    expect(wizardService.audience).toHaveBeenCalledWith(7, 'invitation')
  })

  it('filters by answer from the tabs and keeps it in the address', async () => {
    await setup()
    ;[...document.body.querySelectorAll('[role="tab"]')].find(t => t.textContent.includes('Pendientes')).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
    await flushPromises()
    expect(roster.list).toHaveBeenLastCalledWith(7, expect.objectContaining({ status: 'pending' }))
    expect(router.currentRoute.value.query.status).toBe('pending')
  })

  it('loads again when the active event changes', async () => {
    await setup()
    useEventsStore().activeEvent = { id: 8, userRole: 'owner', modules: [] }
    await flushPromises()
    expect(roster.list).toHaveBeenLastCalledWith(8, expect.anything())
  })

  it('opens the form and the import from the toolbar, and offers to add the first guest when there is none', async () => {
    await setup()
    button('Añadir invitado').click()
    await flushPromises()
    expect(body()).toContain('Nuevo invitado')
    wrapper.unmount()
    document.body.innerHTML = ''
    roster.list.mockResolvedValue(page([], { counts: { ...counts, all: 0, delivery: undefined } }))
    await setup()
    expect(body()).toContain('Aún no hay invitados')
    expect(document.querySelector('[data-testid="send-bar"]')).toBeNull()
    // ORG-011: import is the primary action, the toolbar buttons are gone while the list is empty.
    expect(button('Añadir invitado')).toBeUndefined()
    button('Añadir uno por uno').click()
    await flushPromises()
    expect(body()).toContain('Nuevo invitado')
    button('Importar de Excel o CSV').click()
  })

  it('holds the place of the toolbar and the progress while the first load is under way', async () => {
    roster.list.mockReturnValue(new Promise(() => {}))
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: 'owner', modules: [], guestsCount: 4 }
    router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }] })
    await router.push('/')
    wrapper = mount(RosterView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
    await flushPromises()
    expect(document.querySelector('[data-testid="progress-placeholder"]')).toBeTruthy()
    expect(document.querySelector('[data-testid="download-placeholder"]')).toBeTruthy()
  })

  it('ignores the answer of a load that a newer one replaced', async () => {
    let failOld
    roster.list.mockReset()
    roster.list.mockReturnValueOnce(new Promise((_, reject) => { failOld = reject }))
    await setup()
    roster.list.mockResolvedValueOnce(page([family(1, 'Ana Perez')]))
    useEventsStore().activeEvent = { id: 8, userRole: 'owner', modules: [] }
    await flushPromises()
    failOld(new Error('late'))
    await flushPromises()
    expect(body()).toContain('Ana Perez')
    expect(body()).not.toContain('No pudimos cargar tu lista.')
  })

  it('shows a skeleton while loading, dims the old list on a reload, and a retry on error', async () => {
    let resolve
    roster.list.mockReturnValueOnce(new Promise(r => { resolve = r }))
    await setup()
    expect(document.querySelector('[data-testid="list-skeleton"]')).toBeTruthy()
    resolve(page([family(1, 'Ana Perez')]))
    await flushPromises()
    expect(document.querySelector('[data-testid="list-skeleton"]')).toBeNull()
    let again
    roster.list.mockReturnValueOnce(new Promise(r => { again = r }))
    chip('Sin enviar').click()
    await flushPromises()
    const list = document.querySelector('ul[aria-busy]')
    expect(list.getAttribute('aria-busy')).toBe('true')
    expect(list.className).toContain('opacity-50')
    again(page([]))
    await flushPromises()
  })

  it('offers to try again when the first load fails', async () => {
    roster.list.mockReset()
    roster.list.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(page([family(1, 'Ana Perez')]))
    await setup()
    expect(body()).toContain('No pudimos cargar tu lista.')
    button('Reintentar').click()
    await flushPromises()
    expect(body()).toContain('Ana Perez')
  })

  it('looks again while messages are queued, and stops when they settle', async () => {
    vi.useFakeTimers()
    roster.list.mockResolvedValueOnce(page([family(1, 'Ana Perez', { delivery: { state: 'queued' } })]))
    await setup()
    expect(roster.list).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(5000)
    expect(roster.list).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(20000)
    expect(roster.list).toHaveBeenCalledTimes(2)
  })

  it('keeps a silent failure of the background look quiet', async () => {
    vi.useFakeTimers()
    roster.list.mockResolvedValueOnce(page([family(1, 'Ana Perez', { delivery: { state: 'queued' } })])).mockRejectedValueOnce(new Error('x'))
    await setup()
    await vi.advanceTimersByTimeAsync(5000)
    expect(useToast().toasts).toHaveLength(0)
    expect(body()).toContain('Ana Perez')
  })
})
