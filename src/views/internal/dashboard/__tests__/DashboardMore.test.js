import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardMore from '../DashboardMore.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a><slot /></a>' } }
const mountMore = budget =>
  mount(DashboardMore, { props: { budgetEnabled: true, budget: { cap: 18000, estimated: 18530.1, paid: 1000, items: 3, currency: 'USD', overByCents: 0, paidOverByCents: 0, ...budget } }, global: { plugins: [i18n], stubs } })

beforeEach(() => setLocale('es'))

describe('DashboardMore budget over the cap', () => {
  it('flags the estimate and says how far it goes past the cap', () => {
    const w = mountMore({ overByCents: 53010 })
    expect(w.get('[data-testid=budget-over]').text()).toBe('+$530.10 sobre el tope')
    expect(w.get('[data-testid=budget-estimated]').classes()).toContain('text-warning-700')
  })
  it('shows whole dollars without decimals and speaks English', () => {
    setLocale('en')
    expect(mountMore({ overByCents: 53000 }).get('[data-testid=budget-over]').text()).toBe('+$530 over the cap')
  })
  it('flags the paid amount on its own', () => {
    const w = mountMore({ paidOverByCents: 1 })
    expect(w.get('[data-testid=budget-paid-over]').text()).toBe('+$0.01 sobre el tope')
    expect(w.get('[data-testid=budget-paid]').classes()).toContain('text-warning-700')
    expect(w.find('[data-testid=budget-over]').exists()).toBe(false)
  })
  it('stays quiet within the cap', () => {
    const w = mountMore({})
    expect(w.find('[data-testid=budget-over]').exists()).toBe(false)
    expect(w.find('[data-testid=budget-paid-over]').exists()).toBe(false)
    expect(w.get('[data-testid=budget-estimated]').classes()).toContain('text-ink-900')
  })
})
