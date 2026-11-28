import { describe, it, expect } from 'vitest'
import { courseRows, filterCount, menuChosenCount, respondedPercent, statusParam } from '../utils/menus'

const S = { total: 6, responded: 4, pending: 2, menus: [{ menuId: 1, count: 4 }, { menuId: 3, count: 0 }], courses: { main: [{ dishId: 1, name: 'B', count: 1 }, { dishId: 2, name: 'A', count: 3 }] } }

describe('summary helpers', () => {
  it('maps the filters to the contract counts', () => {
    expect(filterCount(S, 'all')).toBe(6)
    expect(filterCount(S, 'pending')).toBe(2)
    expect(filterCount(S, 'chosen')).toBe(4)
    expect(filterCount(null, 'all')).toBeNull()
  })
  it('sends a status only for pending and chosen', () => {
    expect(statusParam('all')).toBeUndefined()
    expect(statusParam('pending')).toBe('pending')
    expect(statusParam('chosen')).toBe('chosen')
  })
  it('computes the percentage and tolerates an empty event', () => {
    expect(respondedPercent(S)).toBe(67)
    expect(respondedPercent({ total: 0, responded: 0 })).toBe(0)
    expect(respondedPercent(null)).toBe(0)
  })
  it('counts guests per menu, 0 when listed with none and null without a summary', () => {
    expect(menuChosenCount(S, 1)).toBe(4)
    expect(menuChosenCount(S, 3)).toBe(0)
    expect(menuChosenCount(S, 99)).toBe(0)
    expect(menuChosenCount(null, 1)).toBeNull()
  })
  it('orders the dishes by count and survives a missing course', () => {
    expect(courseRows(S, 'main').map(r => r.name)).toEqual(['A', 'B'])
    expect(courseRows(S, 'dessert')).toEqual([])
  })
})
