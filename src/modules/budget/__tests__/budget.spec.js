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
  percent
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
