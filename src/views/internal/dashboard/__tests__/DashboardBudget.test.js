import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardBudget from '../DashboardBudget.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="to"><slot /></a>' } }
const cat = (id, name, sortOrder, estimated, paid, itemCount = 1) => ({ id, name, sortOrder, itemCount, totals: { estimated, paid } })
// Valentina's budget (seed): Música and Vestido went past their estimate; Banquete sets the scale.
const SUMMARY = {
  currency: 'USD',
  cap: 18000,
  totals: { estimated: 17950, owed: 18530, paid: 12030, remaining: 8400, overCap: true, overBy: 530, overByCents: 53000 },
  categories: [
    cat(3, 'Banquete', 2, 6500, 3000),
    cat(1, 'Salón', 1, 4500, 4500),
    cat(4, 'Música y DJ', 4, 1200, 2400),
    cat(5, 'Recuerdos', 5, 0, 0, 0),
    cat(6, 'Vestido', 3, 1400, 2350)
  ],
  uncategorized: { itemCount: 1, totals: { estimated: 300, paid: 0 } }
}
const mountBudget = (props = {}) => mount(DashboardBudget, { props: { summary: SUMMARY, status: 'ready', canEdit: true, ...props }, global: { plugins: [i18n], stubs } })
const tile = (w, key) => w.find(`[data-tile=${key}]`)

beforeEach(() => setLocale('es'))

describe('DashboardBudget', () => {
  it('draws a skeleton while loading and never the empty state', () => {
    const w = mountBudget({ summary: null, status: 'loading' })
    expect(w.find('[data-testid=budget-skeleton]').exists()).toBe(true)
    expect(w.find('[data-testid=budget-empty]').exists()).toBe(false)
  })
  it('shows an error with retry instead of an empty budget', async () => {
    const w = mountBudget({ summary: null, status: 'error' })
    expect(w.find('[data-testid=budget-empty]').exists()).toBe(false)
    expect(w.get('[data-testid=block-error]').text()).toContain('No pudimos cargar tu presupuesto')
    await w.get('[data-testid=block-retry]').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
  })
  it('shows paid, left to pay, the cap and what is committed over it, in the event currency', () => {
    const w = mountBudget()
    expect(tile(w, 'paid').text()).toContain('$12,030')
    expect(tile(w, 'remaining').text()).toContain('$8,400')
    expect(tile(w, 'cap').text()).toContain('$18,000')
    expect(tile(w, 'over').text()).toContain('Sobre el tope')
    expect(tile(w, 'over').text()).toContain('$530')
    expect(mountBudget({ summary: { ...SUMMARY, currency: 'EUR' } }).find('[data-tile=paid]').text()).toMatch(/EUR|€/)
  })
  it('without a cap shows neither the cap nor anything over it', () => {
    const w = mountBudget({ summary: { ...SUMMARY, cap: null, totals: { ...SUMMARY.totals, overCap: false, overBy: 0 } } })
    expect(tile(w, 'cap').exists()).toBe(false)
    expect(tile(w, 'over').exists()).toBe(false)
    expect(tile(w, 'paid').exists()).toBe(true)
  })
  it('one bar per category with movement, in sortOrder, the loose items last', () => {
    const bars = mountBudget().findAll('[data-testid=budget-bars] > li')
    expect(bars.map(b => b.text().split(/\+?\$/)[0].trim())).toEqual(['Salón', 'Banquete', 'Vestido', 'Música y DJ', 'Sin categoría'])
  })
  it('turns a category red and says by how much when paid went past the estimate', () => {
    const w = mountBudget()
    const music = w.get('[data-bar=category-4]')
    expect(music.attributes('data-over')).toBe('true')
    expect(music.get('[data-testid=bar-note]').text()).toContain('+$1,200 sobre')
    expect(music.get('[data-testid=bar-paid]').classes()).toContain('bg-danger-500')
    const hall = w.get('[data-bar=category-1]')
    expect(hall.attributes('data-over')).toBe('false')
    expect(hall.get('[data-testid=bar-note]').text()).toContain('$4,500 / $4,500')
    expect(hall.get('[data-testid=bar-paid]').classes()).toContain('bg-success-500')
  })
  it('puts every bar on the scale of the largest amount', () => {
    const w = mountBudget()
    expect(w.get('[data-bar=category-3] [data-testid=bar-estimated]').attributes('style')).toContain('left: 100%')
    expect(w.get('[data-bar=category-1] [data-testid=bar-paid]').attributes('style')).toMatch(/width: 69\.2/)
    expect(w.find('[data-bar=uncategorized] [data-testid=bar-paid]').attributes('style')).toContain('width: 0%')
  })
  it('without anything written down nor a cap invites to start (editors only)', () => {
    const blank = { currency: 'USD', cap: null, totals: { paid: 0, remaining: 0, overCap: false }, categories: [cat(1, 'Salón', 1, 0, 0, 0)], uncategorized: { itemCount: 0, totals: { estimated: 0, paid: 0 } } }
    const w = mountBudget({ summary: blank })
    expect(w.get('[data-testid=budget-empty]').text()).toContain('Define tu presupuesto')
    expect(w.find('[data-testid=budget-empty] a').exists()).toBe(true)
    expect(mountBudget({ summary: blank, canEdit: false }).find('[data-testid=budget-empty] a').exists()).toBe(false)
  })
  it('with a cap but no expenses keeps the figures and says there is nothing written down', () => {
    const w = mountBudget({ summary: { currency: 'USD', cap: 5000, totals: { paid: 0, remaining: 0, overCap: false }, categories: [], uncategorized: { itemCount: 0, totals: { estimated: 0, paid: 0 } } } })
    expect(tile(w, 'cap').text()).toContain('$5,000')
    expect(w.get('[data-testid=budget-no-bars]').text()).toContain('Aún no hay gastos anotados')
  })
  it('speaks English', () => {
    setLocale('en')
    const w = mountBudget()
    expect(tile(w, 'over').text()).toContain('Over the cap')
    expect(w.get('[data-bar=category-4] [data-testid=bar-note]').text()).toContain('+$1,200 over')
  })
})
