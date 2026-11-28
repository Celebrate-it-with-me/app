import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import ItemRow from '../components/ItemRow.vue'
import PaymentModal from '../components/PaymentModal.vue'

const base = { id: 1, title: 'DJ y vals', categoryId: 4, vendorName: null, vendorPhone: null, estimatedCost: 1200, agreedCost: 1200, owed: 1200, paid: 400, remaining: 800, status: 'partial', dueDate: null, padrinos: [], payments: [{ id: 9, amount: 400, paidOn: '2027-01-01', note: 'Anticipo', padrinoName: 'Tío Raúl' }] }
const mountIt = (item = {}, props = {}) => mount(ItemRow, { props: { item: { ...base, ...item }, canEdit: true, hasPadrinos: true, ...props }, global: { plugins: [i18n] } })
const menuOf = w => w.findComponent({ name: 'UiDropdown' }).props('items')

describe('ItemRow actions menu', () => {
  beforeEach(() => setLocale('es'))

  it('offers pay, view payments, sponsor, edit and remove to an editor, and each one emits for its item', () => {
    const w = mountIt()
    const items = menuOf(w)
    expect(items.map(i => i.label)).toEqual(['Registrar pago', 'Ver pagos (1)', 'Asignar padrino', 'Editar gasto', 'Eliminar'])
    expect(items.at(-1).danger).toBe(true)
    items[0].onSelect()
    items[2].onSelect()
    items[3].onSelect()
    items[4].onSelect()
    expect(w.emitted('pay')[0][0].id).toBe(1)
    expect(w.emitted('sponsors')[0][0].id).toBe(1)
    expect(w.emitted('edit')[0][0].id).toBe(1)
    expect(w.emitted('remove')[0][0].id).toBe(1)
  })

  it('says "Cambiar padrino" when the expense already has one, even if the event lists none', () => {
    const w = mountIt({ padrinos: [{ id: 2, name: 'Tía Ana' }] }, { hasPadrinos: false })
    expect(menuOf(w).map(i => i.label)).toContain('Cambiar padrino')
    expect(w.find('[data-testid=sponsor-chip]').exists()).toBe(true)
  })

  it('does not offer the sponsor entry when there are no padrinos at all', () => {
    const w = mountIt({}, { hasPadrinos: false })
    expect(menuOf(w).map(i => i.label)).not.toContain('Asignar padrino')
  })

  it('a viewer only gets "Ver pagos", and its list has no edit or remove buttons', async () => {
    const w = mountIt({}, { canEdit: false })
    const items = menuOf(w)
    expect(items.map(i => i.label)).toEqual(['Ver pagos (1)'])
    items[0].onSelect()
    await w.vm.$nextTick()
    expect(w.find('[data-testid=payments-list]').exists()).toBe(true)
    expect(w.find('[data-testid=payments-list] button').exists()).toBe(false)
  })

  it('"Ver pagos" toggles the list of payments with date, payer and note; an editor can edit or remove each', async () => {
    const w = mountIt()
    menuOf(w)[1].onSelect()
    await w.vm.$nextTick()
    const list = w.get('[data-testid=payments-list]')
    expect(list.text()).toContain('$400')
    expect(list.text()).toContain('Anticipo')
    const [edit, remove] = list.findAll('button')
    await edit.trigger('click')
    await remove.trigger('click')
    expect(w.emitted('edit-payment')[0][0].payment.id).toBe(9)
    expect(w.emitted('remove-payment')[0][0].payment.id).toBe(9)
    menuOf(w)[1].onSelect()
    await w.vm.$nextTick()
    expect(w.find('[data-testid=payments-list]').exists()).toBe(false)
  })

  it('the pay pill emits pay', async () => {
    const w = mountIt()
    await w.get('[data-testid=pay-button]').trigger('click')
    expect(w.emitted('pay')).toHaveLength(1)
  })
})

describe('PaymentModal without an expense', () => {
  it('opens with no excess warning when no expense is selected', async () => {
    setLocale('es')
    const w = mount(PaymentModal, { props: { open: true, item: null, currency: 'USD', padrinos: [] }, attachTo: document.body, global: { plugins: [i18n] } })
    await flushPromises()
    expect(document.querySelector('[data-testid="over-warning"]')).toBeNull()
    w.unmount()
    document.body.innerHTML = ''
  })
})
