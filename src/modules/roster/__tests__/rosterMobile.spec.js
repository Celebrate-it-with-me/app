import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const roster = vi.hoisted(() => ({ list: vi.fn() }))
vi.mock('../services/RosterService', () => ({ default: roster }))
const wizardService = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn() }))
vi.mock('../services/SendWizardService', () => ({ default: wizardService }))
vi.mock('../services/WhatsappService', () => ({ default: { send: vi.fn(), retry: vi.fn() } }))
import RosterView from '../views/RosterView.vue'

const family = (id, name, extra = {}) => ({ id, name, phone: '+13055550123', email: null, status: 'pending', link: `https://q.test/i/xv/${id}`, companions: [], notes: null, locale: null, delivery: { state: 'none' }, ...extra })
const delivery = { unsent: 3, queued: 0, sent: 1, delivered: 2, read: 1, failed: 1, noPhone: 0, shared: 0 }
const counts = { all: 8, attending: 2, notAttending: 1, pending: 5, delivery }
let wrapper
const body = () => document.body

async function setup({ role = 'owner' } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: role, modules: [{ key: 'whatsapp', state: 'active' }], eventName: 'Los XV' }
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }] })
  await router.push('/')
  wrapper = mount(RosterView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  roster.list.mockReset()
  wizardService.audience.mockResolvedValue({ event: { published: true }, rsvp: { isOpen: true }, mode: { automatic: false } })
  wizardService.allRecipients.mockResolvedValue([])
  wizardService.allRoster.mockResolvedValue([])
  roster.list.mockResolvedValue({ data: [family(1, 'Ana Perez'), family(2, 'Beto Ruiz')], meta: { currentPage: 1, lastPage: 1, total: 2 }, counts })
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('Roster on phones: filter tabs', () => {
  it('lays the four tabs out as equal columns, each with a short label and its count', async () => {
    await setup()
    const list = body().querySelector('[role="tablist"]')
    expect(list.className).toContain('grid')
    expect(list.style.gridTemplateColumns).toMatch(/^repeat\(4, minmax\(0/)
    const tabs = [...list.querySelectorAll('[role="tab"]')]
    expect(tabs).toHaveLength(4)
    expect(tabs.map(t => t.querySelector('span.md\\:hidden').textContent)).toEqual(['Todos', 'Asisten', 'Pendientes', 'No asisten'])
    expect(tabs[1].querySelector('span.hidden').textContent).toBe('Confirmados')
    expect(tabs[1].textContent).toContain('2')
  })

  it('has the short labels in both languages', async () => {
    setLocale('en')
    await setup()
    const labels = [...body().querySelectorAll('[role="tab"] span.md\\:hidden')].map(s => s.textContent)
    expect(labels).toEqual(['All', 'Going', 'Pending', 'Declined'])
  })
})
