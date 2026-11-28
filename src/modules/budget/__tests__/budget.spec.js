import { describe, it, expect } from 'vitest'
import {
  NONE,
  FILTERS,
  emptyItem,
  emptyPayment,
  filterCounts,
  filterItems,
  formFromItem,
  formatMoney,
  groupByCategory,
  itemErrors,
  itemPayload,
  paymentErrors,
  paymentPayload,
  percent,
  coverageOf,
  statusOf,
  overpaidOf,
  barOf,
  STATUS_TONE
} from '../utils/budget'

const item = (id, status, extra = {}) => ({ id, title: `Gasto ${id}`, vendorName: null, categoryId: null, status, ...extra })

describe('money and percent', () => {
  it('formats in the event currency and language', () => {
    expect(formatMoney(1500, 'USD', 'es')).toContain('1,500')
    expect(formatMoney(1500.5, 'USD', 'en')).toBe('$1,500.50')
    expect(formatMoney(null)).toBe('$0')
  })

  it('computes a share, capped, with no division by zero', () => {
    expect(percent(250, 1000)).toBe(25)
    expect(percent(2000, 1000)).toBe(100)
    expect(percent(5, 0)).toBe(0)
  })
})

describe('item form', () => {
  it('asks for a title and valid amounts', () => {
    expect(itemErrors(emptyItem())).toEqual({ title: 'app.budget.errors.title', estimatedCost: 'app.budget.errors.amount' })
    expect(itemErrors({ ...emptyItem(), title: 'Salón', estimatedCost: '1000' })).toEqual({})
    expect(itemErrors({ ...emptyItem(), title: 'Salón', estimatedCost: '10', agreedCost: '-1' })).toEqual({ agreedCost: 'app.budget.errors.amount' })
  })

  it('builds the payload with numbers and nulls', () => {
    expect(itemPayload({ ...emptyItem(), title: ' Salón ', categoryId: 3, estimatedCost: '1000', agreedCost: '', vendorName: ' Cristal ' })).toEqual({
      title: 'Salón', categoryId: 3, estimatedCost: 1000, agreedCost: null, dueDate: null, vendorName: 'Cristal', vendorPhone: null, description: null
    })
    expect(itemPayload({ ...emptyItem(), title: 'X', estimatedCost: '5' }).categoryId).toBeNull()
  })

  it('round-trips an item into the form', () => {
    expect(formFromItem({ title: 'A', categoryId: null, estimatedCost: 10, agreedCost: 12, dueDate: '2027-01-05', vendorName: null, vendorPhone: null, description: null }))
      .toMatchObject({ categoryId: 'none', estimatedCost: '10', agreedCost: '12', dueDate: '2027-01-05', vendorName: '' })
  })
})

describe('payment form', () => {
  it('needs an amount above zero and a date', () => {
    expect(paymentErrors({ amount: '', paidOn: '' })).toEqual({ amount: 'app.budget.errors.paymentAmount', paidOn: 'app.budget.errors.paidOn' })
    expect(paymentErrors({ amount: '0', paidOn: '2027-01-01' })).toEqual({ amount: 'app.budget.errors.paymentAmount' })
    expect(paymentErrors({ amount: '50', paidOn: '2027-01-01' })).toEqual({})
    expect(emptyPayment().paidOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('builds the payload', () => {
    expect(paymentPayload({ amount: '50.5', paidOn: '2027-01-01', note: ' anticipo ' })).toEqual({ amount: 50.5, paidOn: '2027-01-01', note: 'anticipo', padrinoId: null })
    expect(paymentPayload({ amount: '5', paidOn: '2027-01-01', padrinoId: 'none' }).padrinoId).toBeNull()
    expect(paymentPayload({ amount: '5', paidOn: '2027-01-01', padrinoId: 7 }).padrinoId).toBe(7)
  })
})

describe('list helpers', () => {
  const items = [item(1, 'unpaid', { categoryId: 1 }), item(2, 'partial', { categoryId: 1, vendorName: 'DJ Marcos' }), item(3, 'paid', { categoryId: 2 }), item(4, 'overdue'), item(5, 'unpaid', { categoryId: 99 })]
  const categories = [{ id: 1, name: 'Salón' }, { id: 2, name: 'Pastel' }]

  it('filters by tab and by text (title or vendor)', () => {
    expect(filterItems(items, 'all', '').length).toBe(5)
    expect(filterItems(items, 'due', '').map(i => i.id)).toEqual([1, 2, 5])
    expect(filterItems(items, 'overdue', '').map(i => i.id)).toEqual([4])
    expect(filterItems(items, 'all', 'marcos').map(i => i.id)).toEqual([2])
    expect(FILTERS.map(f => f.value)).toEqual(['all', 'due', 'overdue', 'paid'])
  })

  it('counts every tab', () => {
    expect(filterCounts(items)).toEqual({ all: 5, due: 3, overdue: 1, paid: 1 })
  })

  it('groups by category in order, leaving the loose ones last', () => {
    const groups = groupByCategory(items, categories)
    expect(groups.map(g => g.category?.name ?? null)).toEqual(['Salón', 'Pastel', null])
    expect(groups.at(-1).items.map(i => i.id)).toEqual([4, 5])
  })
})

describe('select values', () => {
  it('never uses an empty value for "none": the select component rejects it and the modal would break', () => {
    expect(NONE).not.toBe('')
    expect(emptyItem().categoryId).toBe(NONE)
    expect(emptyPayment().padrinoId).toBe(NONE)
  })
})

// Valentina's budget as the API serves it (seed): the DJ and the dress were paid past their cost.
const VALENTINA = [
  { id: 1, title: 'Salón', owed: 4500, paid: 4500, remaining: 0, status: 'paid' },
  { id: 2, title: 'Banquete', owed: 6800, paid: 6800, remaining: 0, status: 'paid' },
  { id: 3, title: 'Decoración', owed: 1800, paid: 0, remaining: 1800, status: 'unpaid' },
  { id: 4, title: 'DJ', owed: 1200, paid: 2400, remaining: 0, status: 'paid' },
  { id: 5, title: 'Foto y video', owed: 1600, paid: 400, remaining: 1200, status: 'partial' },
  { id: 6, title: 'Vestido', owed: 1650, paid: 2350, remaining: 0, status: 'paid' },
  { id: 7, title: 'Limusina', owed: 600, paid: 0, remaining: 600, status: 'unpaid' },
  { id: 8, title: 'Recuerdos', owed: 380, paid: 380, remaining: 0, status: 'paid' }
]
const TOTALS = { owed: 18530, paid: 16830, remaining: 3600 }

describe('coverage of what is paid', () => {
  it('splits an item into covered, remaining and overpaid', () => {
    expect(coverageOf({ owed: 1200, paid: 2400, remaining: 0 })).toEqual({ total: 1200, paid: 2400, covered: 1200, remaining: 0, overpaid: 1200, percent: 100 })
    expect(coverageOf({ owed: 1600, paid: 400 })).toMatchObject({ covered: 400, remaining: 1200, overpaid: 0, percent: 25 })
    expect(coverageOf({ owed: 1800, paid: 0 })).toMatchObject({ covered: 0, remaining: 1800, overpaid: 0, percent: 0 })
    expect(coverageOf({ owed: 0, paid: 0 })).toMatchObject({ percent: 0, overpaid: 0 })
    expect(coverageOf(null)).toMatchObject({ total: 0, paid: 0 })
  })

  it('reads the whole budget: 81 %, not the 91 % that paid / owed gave', () => {
    expect(coverageOf(TOTALS)).toEqual({ total: 18530, paid: 16830, covered: 14930, remaining: 3600, overpaid: 1900, percent: 81 })
  })

  it('always keeps covered + remaining equal to the total, whatever the payments', () => {
    const cases = [...VALENTINA, TOTALS, { owed: 0.1, paid: 0.2 }, { owed: 10.07, paid: 3.01 }, { owed: 5, paid: 9999 }, { owed: 100, paid: 100 }]
    for (const c of cases) {
      const x = coverageOf(c)
      expect(Math.round((x.covered + x.remaining) * 100)).toBe(Math.round(x.total * 100))
      expect(x.remaining).toBeGreaterThanOrEqual(0)
      expect(x.overpaid).toBeGreaterThanOrEqual(0)
    }
    // And the sum of the items equals the totals of the page.
    const sum = VALENTINA.map(coverageOf).reduce((a, x) => ({ covered: a.covered + x.covered, remaining: a.remaining + x.remaining, overpaid: a.overpaid + x.overpaid, paid: a.paid + x.paid, total: a.total + x.total }), { covered: 0, remaining: 0, overpaid: 0, paid: 0, total: 0 })
    expect(sum).toEqual({ covered: 14930, remaining: 3600, overpaid: 1900, paid: 16830, total: 18530 })
    expect(sum.covered + sum.remaining).toBe(sum.total)
  })

  it('does not let an overpaid item hide what another still owes (the API remaining is a sum per item)', () => {
    // Raw paid - owed would say 18530 - 16830 = 1700 left; the sum per item says 3600.
    expect(coverageOf(TOTALS).remaining).toBe(3600)
  })

  it('shows "overpaid" as a status of its own, and lists those items under Pagados', () => {
    expect(VALENTINA.map(statusOf)).toEqual(['paid', 'paid', 'unpaid', 'overpaid', 'partial', 'overpaid', 'unpaid', 'paid'])
    expect(STATUS_TONE.overpaid).toBe('danger')
    expect(filterItems(VALENTINA, 'paid', '').map(i => i.id)).toEqual([1, 2, 4, 6, 8])
    expect(filterCounts(VALENTINA)).toEqual({ all: 8, due: 3, overdue: 0, paid: 5 })
    expect(statusOf({ status: 'overdue', owed: 10, paid: 0 })).toBe('overdue')
  })

  it('counts the overpaid items and what they went over by', () => {
    const o = overpaidOf(VALENTINA)
    expect(o.count).toBe(2)
    expect(o.amount).toBe(1900)
    expect(o.items.map(i => i.id)).toEqual([4, 6])
    expect(overpaidOf([]).count).toBe(0)
    expect(overpaidOf(undefined).amount).toBe(0)
  })

  it('draws a bar that is empty with nothing paid, full and green when complete, red when over', () => {
    expect(barOf({ owed: 1800, paid: 0, remaining: 1800 })).toMatchObject({ fill: 0, tone: 'partial' })
    expect(barOf({ owed: 1600, paid: 400, remaining: 1200 })).toMatchObject({ fill: 25, tone: 'partial' })
    expect(barOf({ owed: 380, paid: 380, remaining: 0 })).toMatchObject({ fill: 100, tone: 'complete' })
    expect(barOf({ owed: 1200, paid: 2400, remaining: 0 })).toMatchObject({ fill: 100, tone: 'over', overpaid: 1200 })
    expect(barOf({ owed: 0, paid: 0 })).toMatchObject({ fill: 0, tone: 'partial' })
  })
})
