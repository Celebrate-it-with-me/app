import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const roster = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), addCompanion: vi.fn(), setLocale: vi.fn() }))
vi.mock('../services/RosterService', () => ({ default: roster }))
const wizardService = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn() }))
vi.mock('../services/SendWizardService', () => ({ default: wizardService }))
vi.mock('../services/WhatsappService', () => ({ default: { send: vi.fn(), retry: vi.fn() } }))
import RosterView from '../views/RosterView.vue'
import GuestFormModal from '../components/GuestFormModal.vue'
import GuestImportModal from '../components/GuestImportModal.vue'

const family = (id, name) => ({ id, name, phone: '+13055550123', email: null, status: 'pending', link: `https://q.test/i/xv/${id}`, companions: [], notes: null, locale: null, effectiveLocale: 'es', delivery: { state: 'none' } })
const counts = { all: 2, attending: 0, notAttending: 0, pending: 2, delivery: { unsent: 2 } }
let wrapper
const toasts = () => useToast().toasts.map(x => `${x.tone}:${x.title}`)

async function setup() {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const store = useEventsStore()
  store.activeEvent = { id: 7, userRole: 'owner', modules: [{ key: 'whatsapp', state: 'active' }], eventName: 'Los XV' }
  store.fetchEvent = vi.fn().mockResolvedValue({})
  roster.list.mockResolvedValue({ data: [family(1, 'Ana Perez'), family(2, 'Beto Ruiz')], meta: { currentPage: 1, lastPage: 1, total: 2 }, counts })
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }] })
  await router.push('/')
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
})

describe('RosterView: import and language', () => {
  it('"Importar" opens the import dialog, from the page button and from the phone "⋯" menu', async () => {
    await setup()
    expect(wrapper.findComponent(GuestImportModal).props('open')).toBe(false)
    const importButton = wrapper.findAll('button').find(b => b.text().trim() === i18n.global.t('app.guestImport.button'))
    await importButton.trigger('click')
    expect(wrapper.findComponent(GuestImportModal).props('open')).toBe(true)
    wrapper.findComponent(GuestImportModal).vm.$emit('update:open', false)
    await flushPromises()
    expect(wrapper.findComponent(GuestImportModal).props('open')).toBe(false)
    const more = wrapper.findAllComponents({ name: 'UiDropdown' }).map(d => d.props('items')).find(items => items.some(i => i.label === i18n.global.t('app.guestImport.button')))
    more.find(i => i.label === i18n.global.t('app.guestImport.button')).onSelect()
    await flushPromises()
    expect(wrapper.findComponent(GuestImportModal).props('open')).toBe(true)
  })

  it('editing a family with a new invitation language saves the guest and then the language, and the form can be closed', async () => {
    await setup()
    roster.update.mockResolvedValue({})
    roster.setLocale.mockResolvedValue({ locale: 'en', effectiveLocale: 'en' })
    wrapper.findComponent({ name: 'GuestList' }).vm.$emit('edit', family(1, 'Ana Perez'))
    await flushPromises()
    expect(wrapper.findComponent(GuestFormModal).props('open')).toBe(true)
    wrapper.findComponent(GuestFormModal).vm.$emit('save', { person: { name: 'Ana P', email: '', phone: '', notes: '' }, companions: [], removed: [], locale: 'en' })
    await flushPromises()
    expect(roster.update).toHaveBeenCalledWith(7, 1, expect.objectContaining({ name: 'Ana P' }))
    expect(roster.setLocale).toHaveBeenCalledWith(7, 1, 'en')
    expect(toasts()).toContain(`success:${i18n.global.t('app.roster.locale.saved')}`)
    wrapper.findComponent(GuestFormModal).vm.$emit('update:open', false)
    await flushPromises()
    expect(wrapper.findComponent(GuestFormModal).props('open')).toBe(false)
  })
})
