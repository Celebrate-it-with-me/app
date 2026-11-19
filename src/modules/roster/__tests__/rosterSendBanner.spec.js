import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const roster = vi.hoisted(() => ({ list: vi.fn(), update: vi.fn() }))
const wizard = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn() }))
const wa = vi.hoisted(() => ({ activeBatch: vi.fn(), batch: vi.fn(), send: vi.fn(), retry: vi.fn(), preview: vi.fn() }))
vi.mock('../services/RosterService', () => ({ default: roster }))
vi.mock('../services/SendWizardService', () => ({ default: wizard }))
vi.mock('../services/WhatsappService', () => ({ default: wa }))
vi.mock('@/modules/template-picker/components/InvitationMiniature.vue', () => ({ default: { template: '<div />' } }))
import RosterView from '../views/RosterView.vue'

const family = (id, name) => ({ id, name, phone: '+13055550123', email: null, status: 'pending', link: `https://q.test/i/xv/${id}`, companions: [], notes: null, locale: null, delivery: { state: 'none' } })
const counts = { all: 2, attending: 0, notAttending: 0, pending: 2, delivery: { unsent: 2 } }
const batch = (queued, extra = {}) => ({ batchId: 'b1', total: 10, queued, sent: 10 - queued, delivered: 0, read: 0, failed: 0, cancelled: 0, done: queued === 0, messages: [], ...extra })
let wrapper
const body = () => document.body.textContent
const banner = () => document.querySelector('[data-testid="send-banner"]')

async function setup({ role = 'owner', modules = [{ key: 'whatsapp', state: 'active' }] } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: role, modules, eventName: 'Los XV', startDate: '03/14/2027 18:00' }
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }] })
  await router.push('/')
  wrapper = mount(RosterView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  ;[...Object.values(roster), ...Object.values(wizard), ...Object.values(wa)].forEach(fn => fn.mockReset())
  roster.list.mockResolvedValue({ data: [family(1, 'Ana Perez'), family(2, 'Beto Ruiz')], meta: { currentPage: 1, lastPage: 1, total: 2 }, counts })
  wizard.audience.mockResolvedValue({ event: { published: true }, rsvp: { isOpen: true }, mode: { automatic: true }, templates: {} })
  wizard.allRecipients.mockResolvedValue([])
  wizard.allRoster.mockResolvedValue([])
  wa.activeBatch.mockResolvedValue(null)
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('RosterView: send in flight banner', () => {
  it('shows nothing when no batch is in flight', async () => {
    await setup()
    expect(wa.activeBatch).toHaveBeenCalledWith(7)
    expect(banner()).toBeNull()
  })

  it('shows the progress of the batch in flight and reopens the wizard on it', async () => {
    wa.activeBatch.mockResolvedValue(batch(4, { done: false }))
    wa.batch.mockResolvedValue(batch(4, { done: false }))
    await setup()
    expect(banner().textContent).toContain('Enviando invitaciones: 6 de 10')
    expect(banner().querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('6')
    document.querySelector('[data-testid="send-banner-view"]').click()
    await flushPromises()
    expect(wrapper.findComponent({ name: 'SendWizard' }).props('resume')).toBe(true)
    expect(banner()).toBeNull() // the wizard shows the progress now
    expect(body()).toContain('Paso 3 de 3')
  })

  it('goes away, and the list reloads, when the batch empties', async () => {
    vi.useFakeTimers()
    wa.activeBatch.mockResolvedValue(batch(4, { done: false }))
    wa.batch.mockResolvedValueOnce(batch(4, { done: false })).mockResolvedValue(batch(0))
    await setup()
    expect(banner()).not.toBeNull()
    roster.list.mockClear()
    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()
    expect(banner()).toBeNull()
    expect(roster.list).toHaveBeenCalled()
  })

  it('is not shown to a viewer, nor in manual mode', async () => {
    wa.activeBatch.mockResolvedValue(batch(4, { done: false }))
    await setup({ role: 'viewer' })
    expect(wa.activeBatch).not.toHaveBeenCalled()
    wrapper.unmount()
    await setup({ modules: [{ key: 'whatsapp', state: 'locked' }] })
    expect(wa.activeBatch).not.toHaveBeenCalled()
    expect(banner()).toBeNull()
  })

  it('looks again when the wizard sends or closes, and survives a failed read', async () => {
    await setup()
    wa.activeBatch.mockClear()
    wrapper.findComponent({ name: 'SendWizard' }).vm.$emit('sent')
    await flushPromises()
    expect(wa.activeBatch).toHaveBeenCalledTimes(1)
    wa.activeBatch.mockRejectedValue(new Error('x'))
    wrapper.findComponent({ name: 'SendWizard' }).vm.$emit('closed')
    await flushPromises()
    expect(banner()).toBeNull()
  })

  it('formats the event date for the preview step and opens it from the header', async () => {
    await setup()
    document.querySelector('[data-testid="send-header"]').click()
    await flushPromises()
    expect(wrapper.findComponent({ name: 'SendWizard' }).props('eventDateLabel')).toContain('14 de marzo de 2027')
    expect(wrapper.findComponent({ name: 'SendWizard' }).props('resume')).toBe(false)
  })
})
