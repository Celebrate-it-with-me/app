import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { routerKey } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ summary: vi.fn(), items: vi.fn() }))
vi.mock('../services/BudgetService', () => ({ default: api }))
const padrinos = vi.hoisted(() => ({ list: vi.fn() }))
vi.mock('@/modules/padrinos/services/PadrinosService', () => ({ default: padrinos }))

import BudgetView from '../views/BudgetView.vue'
import { useBudgetStore } from '../stores/useBudgetStore'

const SUMMARY = { cap: 18000, currency: 'USD', totals: { estimated: 1000, owed: 1000, paid: 250, remaining: 750 }, categories: [], uncategorized: { itemCount: 1, estimated: 1000, paid: 250 } }
const ITEMS = [{ id: 1, title: 'Banquete', owed: 1000, paid: 250, payments: [], categoryId: null }]

describe('BudgetView loading', () => {
  let wrapper
  let replace
  const toasts = () => useToast().toasts.map(t => `${t.tone}:${t.title}`)

  async function setup(role = 'owner') {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: role, eventName: 'XV', modules: [] }
    replace = vi.fn()
    wrapper = shallowMount(BudgetView, { global: { plugins: [i18n, pinia], provide: { [routerKey]: { replace, push: vi.fn() } } } })
    await flushPromises()
    return pinia
  }

  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    padrinos.list.mockReset()
    useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
  })
  afterEach(() => wrapper?.unmount())

  it('a 403 (money is not for this role) clears the budget and goes back to the Inicio with a notice, not an error', async () => {
    api.summary.mockRejectedValue({ response: { status: 403 } })
    api.items.mockResolvedValue(ITEMS)
    padrinos.list.mockResolvedValue({ data: [{ id: 9, name: 'Tío Raúl' }] })
    await setup('viewer')
    expect(replace).toHaveBeenCalledWith({ name: 'dashboard' })
    expect(toasts()).toEqual(['warning:No tienes permiso para abrir esa sección de este evento.'])
    expect(useBudgetStore().summary).toBeNull()
    expect(useBudgetStore().items).toEqual([])
    expect(padrinos.list).not.toHaveBeenCalled()
    expect(wrapper.findComponent({ name: 'ItemRow' }).exists()).toBe(false)
  })

  it('any other failure stays on the page and says the budget could not load', async () => {
    api.summary.mockRejectedValue({ response: { status: 500 } })
    api.items.mockResolvedValue(ITEMS)
    await setup()
    expect(replace).not.toHaveBeenCalled()
    expect(toasts()).toEqual([`danger:${i18n.global.t('app.budget.loadError')}`])
    expect(useBudgetStore().items).toEqual([])
  })

  it('loads the budget and keeps working when the padrinos cannot load', async () => {
    api.summary.mockResolvedValue(SUMMARY)
    api.items.mockResolvedValue(ITEMS)
    padrinos.list.mockRejectedValue(new Error('500'))
    await setup()
    expect(useBudgetStore().items).toEqual(ITEMS)
    expect(useBudgetStore().eventId).toBe(7)
    expect(padrinos.list).toHaveBeenCalledWith(7)
    expect(toasts()).toEqual([])
    expect(replace).not.toHaveBeenCalled()
  })
})
