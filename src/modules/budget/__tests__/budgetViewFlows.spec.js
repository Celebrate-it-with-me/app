import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { routerKey } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ summary: vi.fn(), items: vi.fn(), exportCsv: vi.fn(), updatePayment: vi.fn(), addPayment: vi.fn(), updateItem: vi.fn() }))
vi.mock('../services/BudgetService', () => ({ default: api }))
const padrinos = vi.hoisted(() => ({ list: vi.fn() }))
vi.mock('@/modules/padrinos/services/PadrinosService', () => ({ default: padrinos }))

import BudgetView from '../views/BudgetView.vue'

const SUMMARY = {
  cap: 18000,
  currency: 'USD',
  totals: { estimated: 3000, owed: 3000, paid: 1500, remaining: 1500 },
  categories: [{ id: 5, name: 'Comida', itemCount: 1, estimated: 1000, owed: 1000, paid: 1500 }],
  uncategorized: { itemCount: 1, estimated: 2000, owed: 2000, paid: 0 }
}
const base = { status: 'unpaid', estimatedCost: 1000, agreedCost: 1000, dueDate: null, vendorName: null, vendorPhone: null, description: null, padrinos: [] }
const OVER = { ...base, id: 1, title: 'Banquete', owed: 1000, paid: 1500, remaining: 0, status: 'paid', categoryId: 5, payments: [{ id: 11, amount: 1500, paidOn: '2027-01-01', note: '' }] }
const OTHER = { ...base, id: 2, title: 'Fotografo', owed: 2000, paid: 0, remaining: 2000, categoryId: null, payments: [] }

describe('BudgetView page flows', () => {
  let wrapper
  const toasts = () => useToast().toasts.map(t => `${t.tone}:${t.title}`)

  async function setup(role = 'owner', items = [OVER, OTHER]) {
    api.summary.mockResolvedValue(SUMMARY)
    api.items.mockResolvedValue(items)
    padrinos.list.mockResolvedValue({ data: [] })
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: role, eventName: 'XV', customUrlSlug: 'xv', modules: [] }
    wrapper = mount(BudgetView, { attachTo: document.body, global: { plugins: [i18n, pinia], stubs: { RouterLink: { template: '<a><slot /></a>' } }, provide: { [routerKey]: { replace: vi.fn(), push: vi.fn() } } } })
    await flushPromises()
  }

  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
  })
  afterEach(() => {
    wrapper?.unmount()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('"overpaid" in the summary narrows the list to the overpaid expenses and can be cleared', async () => {
    await setup()
    expect(wrapper.text()).toContain('Fotografo')
    await wrapper.get('[data-testid="overpaid-link"]').trigger('click')
    expect(wrapper.find('[data-testid="overpaid-filter"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Banquete')
    expect(wrapper.text()).not.toContain('Fotografo')
    await wrapper.get('[data-testid="overpaid-filter"] button').trigger('click')
    expect(wrapper.find('[data-testid="overpaid-filter"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Fotografo')
  })

  it('"overpaid" can also be toggled off from the summary link', async () => {
    await setup()
    await wrapper.get('[data-testid="overpaid-link"]').trigger('click')
    await wrapper.get('[data-testid="overpaid-link"]').trigger('click')
    expect(wrapper.find('[data-testid="overpaid-filter"]').exists()).toBe(false)
  })

  it('tapping a category bar scrolls to its group, smooth by default and instant for reduced motion', async () => {
    await setup()
    const scroll = vi.fn()
    const el = document.getElementById('budget-group-5')
    el.scrollIntoView = scroll
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    wrapper.findComponent({ name: 'CategoryBars' }).vm.$emit('select', 5)
    expect(scroll).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'start' })
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    wrapper.findComponent({ name: 'CategoryBars' }).vm.$emit('select', 5)
    expect(scroll).toHaveBeenLastCalledWith({ behavior: 'auto', block: 'start' })
    expect(() => wrapper.findComponent({ name: 'CategoryBars' }).vm.$emit('select', 999)).not.toThrow()
  })

  it('"Exportar" downloads a csv named after the event, and says so when it fails', async () => {
    await setup()
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    api.exportCsv.mockResolvedValue(new Blob(['a']))
    const exportBtn = wrapper.findAll('button').find(b => b.text().includes(i18n.global.t('app.budget.export')))
    await exportBtn.trigger('click')
    await flushPromises()
    expect(api.exportCsv).toHaveBeenCalledWith(7)
    expect(click).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
    api.exportCsv.mockRejectedValue(new Error('500'))
    await exportBtn.trigger('click')
    await flushPromises()
    expect(toasts()).toContain(`danger:${i18n.global.t('app.budget.exportError')}`)
    click.mockRestore()
  })

  it('"Añadir gasto" opens the expense form for an editor, and a viewer does not get it', async () => {
    await setup('editor')
    const add = wrapper.findAll('button').find(b => b.text().includes(i18n.global.t('app.budget.add')))
    expect(add).toBeTruthy()
    await add.trigger('click')
    expect(wrapper.findComponent({ name: 'ItemFormModal' }).props('open')).toBe(true)
    wrapper.unmount()
    await setup('viewer')
    expect(wrapper.findAll('button').some(b => b.text().includes(i18n.global.t('app.budget.add')))).toBe(false)
  })

  it('editing an existing payment updates that payment', async () => {
    api.updatePayment.mockResolvedValue({})
    await setup()
    wrapper.findAllComponents({ name: 'ItemRow' })[0].vm.$emit('edit-payment', { item: OVER, payment: OVER.payments[0] })
    await flushPromises()
    wrapper.findComponent({ name: 'PaymentModal' }).vm.$emit('save', { amount: '900', paidOn: '2027-01-02', note: '', padrinoId: 'none' }, null)
    await flushPromises()
    expect(api.updatePayment).toHaveBeenCalledWith(7, 1, 11, expect.objectContaining({ amount: 900 }))
    expect(api.addPayment).not.toHaveBeenCalled()
  })

  it('"Cambiar tope" opens the cap form and the status tabs narrow the list', async () => {
    await setup()
    const cap = wrapper.findAll('button').find(b => b.text().includes(i18n.global.t('app.budget.summary.changeCap')))
    await cap.trigger('click')
    expect(wrapper.findComponent({ name: 'CapModal' }).props('open')).toBe(true)
    const due = wrapper.findAll('[role="tab"]').find(b => b.text().startsWith(i18n.global.t('app.budget.filters.due')))
    await due.trigger('click')
    await due.trigger('mousedown')
    await flushPromises()
    expect(wrapper.text()).toContain('Fotografo')
  })
})
