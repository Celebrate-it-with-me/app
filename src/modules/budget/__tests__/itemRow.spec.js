import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import ItemRow from '../components/ItemRow.vue'

const base = { id: 1, title: 'DJ y vals', categoryId: 4, vendorName: 'DJ Marcos', vendorPhone: null, estimatedCost: 1200, agreedCost: 1200, owed: 1200, paid: 0, remaining: 1200, status: 'unpaid', dueDate: '2027-01-05', padrinos: [], payments: [] }
const mountIt = (item = {}, props = {}) => mount(ItemRow, { props: { item: { ...base, ...item }, canEdit: true, hasPadrinos: true, ...props }, global: { plugins: [i18n] } })

describe('ItemRow', () => {
  beforeEach(() => setLocale('es'))

  it('an item with nothing paid: empty bar, "Faltan", the pay pill and the status', () => {
    const w = mountIt({ title: 'Decoración', owed: 1800, remaining: 1800, estimatedCost: 1800, agreedCost: null })
    expect(w.get('[data-testid=item-fill]').attributes('style')).toContain('width: 0%')
    expect(w.get('[data-testid=item-detail]').text()).toBe('Faltan $1,800')
    expect(w.get('[data-testid=status-chip]').text()).toBe('Sin pagar')
    expect(w.find('[data-testid=pay-button]').exists()).toBe(true)
    expect(w.text()).toContain('$0 de $1,800')
  })

  it('a partial item shows the bar at its share, wine coloured, and the estimate and payment count', () => {
    const w = mountIt({ owed: 1600, agreedCost: 1600, estimatedCost: 1500, paid: 400, remaining: 1200, status: 'partial', payments: [{ id: 1, amount: 400, paidOn: '2027-01-01' }] })
    const fill = w.get('[data-testid=item-fill]')
    expect(fill.attributes('style')).toContain('width: 25%')
    expect(fill.classes()).toContain('bg-rose-600')
    expect(w.get('[data-testid=item-detail]').text()).toBe('Faltan $1,200 · estimado $1,500 · 1 pago')
    expect(w.get('[data-testid=status-chip]').text()).toBe('Pago parcial')
  })

  it('an item paid past its cost: "Pagado de más", red bar, how much, and no pay pill', () => {
    const w = mountIt({ paid: 2400, remaining: 0, status: 'paid', payments: [{ id: 1, amount: 1200 }, { id: 2, amount: 1200 }] })
    expect(w.get('[data-testid=status-chip]').text()).toBe('Pagado de más')
    expect(w.get('[data-testid=item-fill]').classes()).toContain('bg-danger-500')
    expect(w.get('[data-testid=item-detail]').text()).toBe('Pagaste $1,200 de más · 2 pagos')
    expect(w.find('[data-testid=pay-button]').exists()).toBe(false)
  })

  it('a complete item is green and says "Completo"', () => {
    const w = mountIt({ paid: 1200, remaining: 0, status: 'paid' })
    expect(w.get('[data-testid=item-fill]').classes()).toContain('bg-success-500')
    expect(w.get('[data-testid=item-detail]').text()).toBe('Completo')
    expect(w.get('[data-testid=status-chip]').text()).toBe('Pagado')
  })

  it('shows who sponsors it as a chip instead of the big block', () => {
    const w = mountIt({ padrinos: [{ padrinoId: 1, name: 'Tío Raúl', committed: 1200, paid: 1200 }] })
    expect(w.get('[data-testid=sponsor-chip]').text()).toBe('Apadrinado por Tío Raúl')
    expect(w.text()).not.toContain('Lo apadrinan')
  })

  it('a viewer gets no pay pill and no actions menu unless there are payments to see', () => {
    expect(mountIt({}, { canEdit: false }).find('[data-testid=pay-button]').exists()).toBe(false)
    expect(mountIt({}, { canEdit: false }).find('button[aria-label]').exists()).toBe(false)
    expect(mountIt({ paid: 100, remaining: 1100, payments: [{ id: 1, amount: 100 }] }, { canEdit: false }).find('button[aria-label]').exists()).toBe(true)
  })

  it('asks to pay from the pill', async () => {
    const w = mountIt()
    await w.get('[data-testid=pay-button]').trigger('click')
    expect(w.emitted('pay')[0][0].id).toBe(1)
  })
})
