import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const roster = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), addCompanion: vi.fn(), confirm: vi.fn(), revert: vi.fn(), setLocale: vi.fn() }))
vi.mock('../services/RosterService', () => ({ default: roster }))
const wizardService = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn(), markShared: vi.fn(), unmarkShared: vi.fn() }))
vi.mock('../services/SendWizardService', () => ({ default: wizardService }))
vi.mock('../services/WhatsappService', () => ({ default: { send: vi.fn(), retry: vi.fn() } }))
import RosterView from '../views/RosterView.vue'
import GuestCard from '../components/GuestCard.vue'
import GuestFormModal from '../components/GuestFormModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import SendWizard from '../components/send/SendWizard.vue'

const family = (id, name, extra = {}) => ({ id, name, phone: '+13055550123', email: null, status: 'pending', link: `https://q.test/i/xv/${id}`, companions: [], notes: null, locale: null, effectiveLocale: 'es', delivery: { state: 'none' }, ...extra })
const counts = { all: 3, attending: 1, notAttending: 0, pending: 2, delivery: { unsent: 3 } }
const page = (data, extra = {}) => ({ data, meta: { currentPage: 1, lastPage: 1, total: data.length }, counts, ...extra })
let wrapper
let router
let eventsStore
const body = () => document.body.textContent
const toasts = () => useToast().toasts.map(x => x.title)
const button = text => [...document.body.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(text))
const card = i => wrapper.findAllComponents(GuestCard)[i]

async function setup({ role = 'owner', modules = [{ key: 'whatsapp', state: 'active' }], query = '/', rows } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  eventsStore = useEventsStore()
  eventsStore.activeEvent = { id: 7, userRole: role, modules, eventName: 'Los XV' }
  eventsStore.fetchEvent = vi.fn().mockResolvedValue({})
  roster.list.mockResolvedValue(page(rows ?? [family(1, 'Ana Perez'), family(2, 'Beto Ruiz'), family(3, 'Lucia Mora')]))
  router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }, { path: '/:p(.*)', name: 'any', component: { template: '<div />' } }, { path: '/events/:id', name: 'edit-event', component: { template: '<div />' } }] })
  router.addRoute({ path: '/unlock', component: { template: '<div />' } })
  await router.push(query)
  wrapper = mount(RosterView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  Object.values(roster).forEach(fn => fn.mockReset())
  wizardService.audience.mockResolvedValue({ event: { published: true }, rsvp: { isOpen: true }, mode: { automatic: false } })
  wizardService.allRecipients.mockResolvedValue([])
  wizardService.allRoster.mockResolvedValue([])
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('RosterView: saving a guest', () => {
  it('creates a guest with named companions, reloads and refreshes the event count', async () => {
    await setup()
    roster.create.mockResolvedValue({})
    wrapper.findComponent(GuestFormModal).vm.$emit('save', { person: { name: ' Nuevo ', email: '', phone: '', notes: '' }, companions: [{ name: 'Acomp' }], removed: [] })
    await flushPromises()
    expect(roster.create).toHaveBeenCalledWith(7, { guest: { name: 'Nuevo', email: null, phone: null, notes: null }, companions: [{ name: 'Acomp' }] })
    expect(toasts()).toContain('Invitado guardado.')
    expect(roster.list).toHaveBeenCalledTimes(2)
    expect(eventsStore.fetchEvent).toHaveBeenCalledWith(7)
  })

  it('edits a family: updates her, deletes removed companions, updates old ones and adds new ones, in that order', async () => {
    await setup()
    const calls = []
    roster.update.mockImplementation(async (...a) => calls.push(['update', a[1], a[2]]))
    roster.remove.mockImplementation(async (...a) => calls.push(['remove', a[1]]))
    roster.addCompanion.mockImplementation(async (...a) => calls.push(['add', a[1], a[2]]))
    card(0).vm.$emit('edit', family(1, 'Ana Perez'))
    await flushPromises()
    wrapper.findComponent(GuestFormModal).vm.$emit('save', {
      person: { name: 'Ana P', email: 'a@x.com', phone: '', notes: '' },
      companions: [{ id: 11, name: 'Beto' }, { name: 'Nueva' }],
      removed: [12]
    })
    await flushPromises()
    expect(calls).toEqual([
      ['update', 1, { name: 'Ana P', email: 'a@x.com', phone: null, notes: null }],
      ['remove', 12],
      ['update', 11, { name: 'Beto' }],
      ['add', 1, { name: 'Nueva' }]
    ])
    expect(roster.create).not.toHaveBeenCalled()
  })

  it('explains the plan limit when the server refuses, and reloads anyway', async () => {
    await setup()
    roster.create.mockRejectedValue({ response: { status: 402, data: { code: 'guest_limit_exceeded', limit: 50, total: 50, excess: 1 } } })
    wrapper.findComponent(GuestFormModal).vm.$emit('save', { person: { name: 'X', email: '', phone: '', notes: '' }, companions: [], removed: [] })
    await flushPromises()
    expect(toasts()).toEqual([expect.stringContaining('50')])
    expect(roster.list).toHaveBeenCalledTimes(2)
  })

  it('shows a generic error when saving fails halfway, and unblocks the form', async () => {
    await setup()
    roster.create.mockRejectedValue(new Error('500'))
    wrapper.findComponent(GuestFormModal).vm.$emit('save', { person: { name: 'X', email: '', phone: '', notes: '' }, companions: [], removed: [] })
    await flushPromises()
    expect(toasts()).toEqual(['No pudimos guardar los cambios. Inténtalo de nuevo.'])
    expect(wrapper.findComponent(GuestFormModal).props('saving')).toBe(false)
  })

  it('the event refresh failing does not break the screen', async () => {
    await setup()
    eventsStore.fetchEvent.mockRejectedValue(new Error('x'))
    roster.create.mockResolvedValue({})
    wrapper.findComponent(GuestFormModal).vm.$emit('save', { person: { name: 'X', email: '', phone: '', notes: '' }, companions: [], removed: [] })
    await flushPromises()
    expect(toasts()).toContain('Invitado guardado.')
  })
})

describe('RosterView: phone confirmation', () => {
  it('opens the dialog for the family, saves her answers and reloads', async () => {
    await setup()
    roster.confirm.mockResolvedValue({})
    card(1).vm.$emit('confirm', family(2, 'Beto Ruiz'))
    await flushPromises()
    expect(wrapper.findComponent(ConfirmModal).props('family').name).toBe('Beto Ruiz')
    wrapper.findComponent(ConfirmModal).vm.$emit('save', { status: 'attending', companions: [] })
    await flushPromises()
    expect(roster.confirm).toHaveBeenCalledWith(7, 2, { status: 'attending', companions: [] })
    expect(toasts()).toContain('Respuestas guardadas.')
    expect(wrapper.findComponent(ConfirmModal).props('open')).toBe(false)
  })

  it('keeps the dialog open and tells the error when the answers cannot be saved', async () => {
    await setup()
    roster.confirm.mockRejectedValue(new Error('500'))
    card(0).vm.$emit('confirm', family(1, 'Ana Perez'))
    await flushPromises()
    wrapper.findComponent(ConfirmModal).vm.$emit('save', { status: 'attending', companions: [] })
    await flushPromises()
    expect(toasts()).toEqual(['No pudimos guardar los cambios. Inténtalo de nuevo.'])
    expect(wrapper.findComponent(ConfirmModal).props('open')).toBe(true)
  })

  it('closes the dialog when asked', async () => {
    await setup()
    card(0).vm.$emit('confirm', family(1, 'Ana Perez'))
    await flushPromises()
    wrapper.findComponent(ConfirmModal).vm.$emit('update:open', false)
    await flushPromises()
    expect(wrapper.findComponent(ConfirmModal).props('open')).toBe(false)
  })

  it('reverts a confirmation, or tells the error', async () => {
    await setup()
    roster.revert.mockResolvedValue()
    card(0).vm.$emit('revert', family(1, 'Ana Perez'))
    await flushPromises()
    expect(roster.revert).toHaveBeenCalledWith(7, 1)
    expect(toasts()).toContain('Volvió a pendiente.')
    roster.revert.mockRejectedValue(new Error('x'))
    card(0).vm.$emit('revert', family(1, 'Ana Perez'))
    await flushPromises()
    expect(toasts()).toContain('No pudimos guardar los cambios. Inténtalo de nuevo.')
  })
})

describe('RosterView: language of an invitation', () => {
  it('changes at once and keeps the answer of the server', async () => {
    await setup()
    const f = wrapper.vm.families[0]
    let release
    roster.setLocale.mockReturnValue(new Promise(r => (release = r)))
    card(0).vm.$emit('locale', f, 'en')
    await flushPromises()
    expect(f.locale).toBe('en')
    expect(f.effectiveLocale).toBe('en')
    release({ locale: 'en', effectiveLocale: 'en' })
    await flushPromises()
    expect(roster.setLocale).toHaveBeenCalledWith(7, 1, 'en')
    expect(toasts()).toContain('Idioma guardado.')
  })

  it('goes back to what it was when the server refuses', async () => {
    await setup()
    const f = wrapper.vm.families[0]
    f.locale = 'es'
    roster.setLocale.mockRejectedValue(new Error('x'))
    card(0).vm.$emit('locale', f, null)
    await flushPromises()
    expect(f.locale).toBe('es')
    expect(f.effectiveLocale).toBe('es')
    expect(toasts()).toContain('No pudimos cambiar el idioma. Quedó como estaba.')
  })

  it('"follow the event" uses the language of the event meanwhile', async () => {
    roster.setLocale.mockReturnValue(new Promise(() => {}))
    await setup()
    const f = wrapper.vm.families[0]
    f.locale = 'es'
    wrapper.vm.eventLocale = 'en'
    card(0).vm.$emit('locale', f, null)
    expect(f.effectiveLocale).toBe('en')
  })
})

describe('RosterView: removing a family', () => {
  it('asks first, naming the family and her companions, then deletes', async () => {
    await setup()
    roster.remove.mockResolvedValue({})
    card(0).vm.$emit('remove', family(1, 'Ana Perez', { companions: [{ id: 5, name: 'X', status: 'pending' }] }))
    await flushPromises()
    expect(body()).toContain('Ana Perez')
    expect(roster.remove).not.toHaveBeenCalled()
    button('Eliminar').click()
    await flushPromises()
    expect(roster.remove).toHaveBeenCalledWith(7, 1)
    expect(toasts()).toContain('Invitado eliminado.')
  })

  it('does nothing when the organizer cancels', async () => {
    await setup()
    card(0).vm.$emit('remove', family(1, 'Ana Perez'))
    await flushPromises()
    button('Cancelar').click()
    await flushPromises()
    expect(roster.remove).not.toHaveBeenCalled()
  })

  it('goes back one page when the last family of a later page is removed', async () => {
    await setup({ rows: [family(1, 'Ana Perez')] })
    roster.list.mockResolvedValue({ data: [family(1, 'Ana Perez')], meta: { currentPage: 2, lastPage: 2, total: 16 }, counts })
    wrapper.vm.page = 2
    await flushPromises()
    roster.remove.mockResolvedValue({})
    card(0).vm.$emit('remove', family(1, 'Ana Perez'))
    await flushPromises()
    button('Eliminar').click()
    await flushPromises()
    expect(wrapper.vm.page).toBe(1)
  })

  it('tells when deleting fails and keeps the dialog', async () => {
    await setup()
    roster.remove.mockRejectedValue(new Error('x'))
    card(0).vm.$emit('remove', family(1, 'Ana Perez'))
    await flushPromises()
    button('Eliminar').click()
    await flushPromises()
    expect(toasts()).toContain('No pudimos guardar los cambios. Inténtalo de nuevo.')
    expect(body()).toContain('Ana Perez')
  })
})

describe('RosterView: copying the link', () => {
  it('copies the invitation link', async () => {
    await setup()
    const writeText = vi.fn().mockResolvedValue()
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    card(0).vm.$emit('copy', family(1, 'Ana Perez'))
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('https://q.test/i/xv/1')
    expect(toasts()).toContain('Enlace copiado.')
  })

  it('tells when the browser refuses', async () => {
    await setup()
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    card(0).vm.$emit('copy', family(1, 'Ana Perez'))
    await flushPromises()
    expect(toasts()).toEqual([expect.stringContaining('No pudimos copiar')])
  })
})

describe('RosterView: events of the send wizard (manual mode)', () => {
  const manual = { modules: [] }
  const wizard = () => wrapper.findComponent(SendWizard)

  it('reloads quietly and forgets the selection when the wizard closes', async () => {
    await setup(manual)
    card(0).vm.$emit('send', family(1, 'Ana Perez'))
    await flushPromises()
    roster.list.mockClear()
    wizard().vm.$emit('closed')
    await flushPromises()
    expect(roster.list).toHaveBeenCalledTimes(1)
    expect(wizard().props('preselectedIds')).toEqual([])
  })

  it('goes to the unlock page from the wizard', async () => {
    await setup(manual)
    wizard().vm.$emit('unlock')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toContain('/dashboard')
  })

  it('goes to the event editor to publish', async () => {
    await setup(manual)
    wizard().vm.$emit('publish')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('edit-event')
    expect(router.currentRoute.value.params.id).toBe('7')
  })

  it('opens the guest form over the wizard to add a guest', async () => {
    await setup(manual)
    wizard().vm.$emit('add-guest')
    await flushPromises()
    expect(wizard().props('open')).toBe(false)
    expect(wrapper.findComponent(GuestFormModal).props('open')).toBe(true)
    expect(wrapper.findComponent(GuestFormModal).props('family')).toBeNull()
  })

  it('edits a guest of the list straight from the wizard', async () => {
    await setup(manual)
    wizard().vm.$emit('edit-guest', { id: 2, name: 'Beto Ruiz' })
    await flushPromises()
    expect(wrapper.findComponent(GuestFormModal).props('family').name).toBe('Beto Ruiz')
    expect(roster.list).toHaveBeenCalledTimes(1)
  })

  it('looks the guest up when she is not on the page, and says so when she cannot be found', async () => {
    await setup(manual)
    roster.list.mockResolvedValueOnce(page([family(99, 'Fuera de pagina')]))
    wizard().vm.$emit('edit-guest', { id: 99, name: 'Fuera de pagina' })
    await flushPromises()
    expect(roster.list).toHaveBeenLastCalledWith(7, { search: 'Fuera de pagina', perPage: 100 })
    expect(wrapper.findComponent(GuestFormModal).props('family').id).toBe(99)
    roster.list.mockResolvedValueOnce(page([]))
    wizard().vm.$emit('edit-guest', { id: 98, name: 'Nadie' })
    await flushPromises()
    expect(toasts()).toContain('No pudimos cargar tu lista.')
    useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
    roster.list.mockRejectedValueOnce(new Error('x'))
    wizard().vm.$emit('edit-guest', { id: 97, name: 'Error' })
    await flushPromises()
    expect(toasts()).toContain('No pudimos cargar tu lista.')
  })
})

describe('RosterView: roles and the send wizard (automatic mode)', () => {
  it('a viewer has no way to add, import, edit or send', async () => {
    await setup({ role: 'viewer' })
    expect(button('Agregar')).toBeUndefined()
    expect(button('Importar')).toBeUndefined()
    expect(document.body.querySelector('[data-testid="send-header"]')).toBeNull()
    expect(wrapper.findAllComponents(GuestCard).every(c => c.props('canEdit') === false)).toBe(true)
  })

  it('an editor can edit like an owner', async () => {
    await setup({ role: 'editor' })
    expect(card(0).props('canEdit')).toBe(true)
  })

  it('sends from the header with nobody preselected, and unlock closes the wizard', async () => {
    await setup()
    document.body.querySelector('[data-testid="send-header"]').click()
    await flushPromises()
    expect(body()).toContain('Nadie por ahora')
    expect(wrapper.vm.sendIds).toEqual([])
    wrapper.findComponent({ name: 'SendWizard' }).vm.$emit('unlock')
    await flushPromises()
    expect(wrapper.vm.wizardOpen).toBe(false)
  })

  it('reloads the list when the wizard closes', async () => {
    await setup()
    roster.list.mockClear()
    wrapper.findComponent({ name: 'SendWizard' }).vm.$emit('closed')
    await flushPromises()
    expect(roster.list).toHaveBeenCalledTimes(1)
  })
})

describe('RosterView: loading, paging and the mobile bar', () => {
  it('searches after a pause, from the first page, and trims the text', async () => {
    await setup()
    vi.useFakeTimers()
    const input = document.body.querySelector('input[type="search"]')
    input.value = '  ana '
    input.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(299)
    expect(roster.list).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(2)
    expect(roster.list).toHaveBeenLastCalledWith(7, { status: 'all', search: 'ana', delivery: null, page: 1 })
  })

  it('shows the limit-aware counter when the plan has one', async () => {
    await setup()
    roster.list.mockResolvedValue(page([family(1, 'Ana Perez')], { counts: { ...counts, limit: 50 } }))
    wrapper.vm.status = 'pending'
    await flushPromises()
    expect(body()).toContain('3 de 50')
  })

  it('hides the floating bar while the inline button is visible and shows it when it scrolls away', async () => {
    let callback
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', class {
      constructor(cb) { callback = cb }
      observe = observe
      disconnect = disconnect
    })
    await setup()
    expect(document.body.querySelector('[data-testid="send-bar"]')).toBeTruthy()
    callback([{ isIntersecting: true }])
    await flushPromises()
    expect(document.body.querySelector('[data-testid="send-bar"]')).toBeNull()
    callback([{ isIntersecting: false }])
    await flushPromises()
    expect(document.body.querySelector('[data-testid="send-bar"]')).toBeTruthy()
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('does nothing without an active event', async () => {
    await setup()
    roster.list.mockClear()
    eventsStore.activeEvent = null
    await flushPromises()
    expect(roster.list).not.toHaveBeenCalled()
  })

  it('goes back to page 1 when the tab changes, and reads the event language of the answer', async () => {
    await setup()
    roster.list.mockResolvedValue(page([family(1, 'Ana Perez')], { eventLocale: 'en' }))
    wrapper.vm.page = 2
    await flushPromises()
    wrapper.vm.status = 'attending'
    await flushPromises()
    expect(wrapper.vm.page).toBe(1)
    expect(wrapper.vm.eventLocale).toBe('en')
    expect(router.currentRoute.value.query).toEqual({ status: 'attending' })
  })
})
