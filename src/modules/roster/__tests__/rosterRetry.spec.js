import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const wa = vi.hoisted(() => ({ retry: vi.fn(), send: vi.fn() }))
const roster = vi.hoisted(() => ({ list: vi.fn() }))
vi.mock('../services/WhatsappService', () => ({ default: wa }))
vi.mock('../services/RosterService', () => ({ default: roster }))
import RosterView from '../views/RosterView.vue'

const family = { id: 1, name: 'Ana Perez', phone: '+13055550123', email: null, status: 'pending', link: 'https://q.test/i/xv/A', companions: [], notes: null, locale: null }
const unknown = { id: 9, guestId: 1, status: 'failed', errorCode: 'unknown_delivery' }
const known = { id: 10, guestId: 1, status: 'failed', errorCode: '131026', errorMessage: 'Undeliverable' }
const counts = { all: 1, attending: 0, notAttending: 0, pending: 1 }
const counter = { all: 1, attending: 0, notAttending: 0, pending: 1 }
let wrapper
const body = () => document.body.textContent
const toasts = () => useToast().toasts.map(x => x.title)
const button = text => [...document.body.querySelectorAll('button')].find(b => b.textContent.trim() === text)

async function setup(message) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, userRole: 'owner', modules: [{ key: 'whatsapp', state: 'active' }] }
  const row = { ...family, delivery: { state: 'failed', lastMessageId: message.id, errorCode: message.errorCode, errorMessage: message.errorMessage ?? null } }
  roster.list.mockResolvedValue({ data: [row], meta: { currentPage: 1, lastPage: 1, total: 1 }, counts: { ...counts, ...counter } })
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }] })
  await router.push('/')
  wrapper = mount(RosterView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  Object.values(wa).forEach(fn => fn.mockReset())
  roster.list.mockReset()
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('RosterView retry', () => {
  it('retries a known failure straight away', async () => {
    wa.retry.mockResolvedValue({})
    await setup(known)
    button('Reintentar').click()
    await flushPromises()
    expect(wa.retry).toHaveBeenCalledWith(7, 10)
  })

  it('asks for confirmation before retrying an unknown delivery', async () => {
    wa.retry.mockResolvedValue({})
    await setup(unknown)
    button('Reintentar').click()
    await flushPromises()
    expect(wa.retry).not.toHaveBeenCalled()
    expect(body()).toContain('podría recibirlo dos veces')
    button('Reintentar de todos modos').click()
    await flushPromises()
    expect(wa.retry).toHaveBeenCalledWith(7, 9)
  })

  it('does not retry when the organizer cancels the confirmation', async () => {
    await setup(unknown)
    button('Reintentar').click()
    await flushPromises()
    button('Cancelar').click()
    await flushPromises()
    expect(wa.retry).not.toHaveBeenCalled()
  })

  it('tells the retry limit and the daily limit in plain Spanish', async () => {
    wa.retry.mockRejectedValueOnce({ response: { status: 409, data: { code: 'retry_limit' } } })
    await setup(known)
    button('Reintentar').click()
    await flushPromises()
    expect(toasts()).toContain('Este mensaje ya se reintentó el máximo de veces.')
    wa.retry.mockRejectedValueOnce({ response: { status: 429, data: { code: 'whatsapp_daily_limit' } } })
    button('Reintentar').click()
    await flushPromises()
    expect(toasts().some(x => x.includes('podrás seguir mañana'))).toBe(true)
  })
})
