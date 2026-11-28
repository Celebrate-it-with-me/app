import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import BudgetSummary from '../components/BudgetSummary.vue'

const ITEMS = [
  { id: 1, owed: 4500, paid: 4500, remaining: 0 },
  { id: 2, owed: 6800, paid: 6800, remaining: 0 },
  { id: 3, owed: 1800, paid: 0, remaining: 1800 },
  { id: 4, owed: 1200, paid: 2400, remaining: 0 },
  { id: 5, owed: 1600, paid: 400, remaining: 1200 },
  { id: 6, owed: 1650, paid: 2350, remaining: 0 },
  { id: 7, owed: 600, paid: 0, remaining: 600 },
  { id: 8, owed: 380, paid: 380, remaining: 0 }
]
const SUMMARY = { currency: 'USD', cap: 18000, totals: { owed: 18530, paid: 16830, remaining: 3600, overdueCount: 0 } }
const mountIt = (props = {}) => mount(BudgetSummary, { props: { summary: SUMMARY, items: ITEMS, canEdit: true, ...props }, global: { plugins: [i18n] } })
const tile = (w, key) => w.get(`[data-tile=${key}]`).text()

describe('BudgetSummary', () => {
  beforeEach(() => setLocale('es'))

  it('shows the four figures of Valentina: 18,530 / 16,830 (81 %) / 3,600 / cap superado', () => {
    const w = mountIt()
    expect(tile(w, 'owed')).toContain('$18,530')
    expect(tile(w, 'owed')).toContain('8 gastos')
    expect(tile(w, 'paid')).toContain('$16,830')
    expect(tile(w, 'paid')).toContain('81 % de lo contratado')
    expect(tile(w, 'remaining')).toContain('$3,600')
    expect(tile(w, 'remaining')).toContain('en 3 gastos')
    expect(tile(w, 'cap')).toContain('$18,000')
    expect(tile(w, 'cap')).toContain('Superado por $530')
    expect(w.get('[data-tile=cap]').classes()).toContain('bg-rose-50')
  })

  it('warns about what was paid past the cost and filters on tap', async () => {
    const w = mountIt()
    const link = w.get('[data-testid=overpaid-link]')
    expect(link.text()).toContain('$1,900 pagados de más en 2 gastos')
    await link.trigger('click')
    expect(w.emitted('overpaid')).toHaveLength(1)
    expect(mountIt({ overpaidActive: true }).get('[data-testid=overpaid-link]').attributes('aria-pressed')).toBe('true')
  })

  it('draws covered + to pay on one scale that ends where the total does, with the cap mark', () => {
    const w = mountIt()
    const covered = parseFloat(w.get('[data-testid=bar-covered]').attributes('style').match(/width: ([\d.]+)%/)[1])
    const remaining = parseFloat(w.get('[data-testid=bar-remaining]').attributes('style').match(/width: ([\d.]+)%/)[1])
    expect(covered + remaining).toBeCloseTo((18530 / (18530 * 1.02)) * 100, 1)
    expect(w.find('[data-testid=bar-cap]').exists()).toBe(true)
    expect(w.get('[role=progressbar]').attributes('aria-valuenow')).toBe('81')
  })

  it('without a cap: no mark, no overpaid warning when nothing went over, and a button to set it', () => {
    const w = mountIt({ summary: { ...SUMMARY, cap: null }, items: ITEMS.filter(i => i.id !== 4 && i.id !== 6) })
    expect(w.find('[data-testid=bar-cap]').exists()).toBe(false)
    expect(w.find('[data-testid=overpaid-link]').exists()).toBe(false)
    expect(tile(w, 'cap')).toContain('Sin tope')
    expect(w.text()).toContain('Fijar tope')
  })

  it('a viewer cannot change the cap', () => {
    expect(mountIt({ canEdit: false }).text()).not.toContain('Cambiar tope')
  })
})
