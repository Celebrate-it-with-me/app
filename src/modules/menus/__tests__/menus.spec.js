import { describe, it, expect } from 'vitest'
import {
  chosenName,
  fieldErrors,
  groupMenuItems,
  itemNameError,
  menuTitleError,
  normalizeMenus,
  toItemPayload,
  toMenuPayload,
  totalPages
} from '../utils/menus'

describe('normalizeMenus', () => {
  it('accepts arrays and wrapped data, and falls back to []', () => {
    expect(normalizeMenus([{ id: 1 }])).toEqual([{ id: 1 }])
    expect(normalizeMenus({ data: [{ id: 2 }] })).toEqual([{ id: 2 }])
    expect(normalizeMenus(null)).toEqual([])
    expect(normalizeMenus('x')).toEqual([])
  })
})

describe('groupMenuItems', () => {
  it('groups by course in order and skips empty ones', () => {
    const menu = {
      menu_items: [
        { id: 1, type: 'dessert' },
        { id: 2, type: 'starter' },
        { id: 3, type: 'dessert' },
        { id: 4, type: 'other' }
      ]
    }
    const groups = groupMenuItems(menu)
    expect(groups.map(g => g.type)).toEqual(['starter', 'dessert'])
    expect(groups[1].items.map(i => i.id)).toEqual([1, 3])
    expect(groupMenuItems(null)).toEqual([])
  })
})

describe('payloads', () => {
  it('uses the plural allowCustomRequests key', () => {
    const p = toMenuPayload({ title: 'Cena', description: '', allow_multiple_choices: 1, allow_custom_request: true, main_menu: false })
    expect(p).toEqual({ title: 'Cena', description: '', allowMultipleChoices: true, allowCustomRequests: true, isDefault: false })
    expect(p).not.toHaveProperty('allowCustomRequest')
  })

  it('omits empty optional item fields', () => {
    expect(toItemPayload({ name: ' Salmon ', itemType: 'main', dietType: 'none', notes: '  ' })).toEqual({ name: 'Salmon', itemType: 'main' })
    expect(toItemPayload({ name: 'Flan', itemType: 'dessert', dietType: 'vegan', notes: 'Sin gluten' })).toEqual({
      name: 'Flan',
      itemType: 'dessert',
      dietType: 'vegan',
      notes: 'Sin gluten'
    })
  })
})

describe('validation and helpers', () => {
  it('validates title and item name', () => {
    expect(menuTitleError(' ab ')).toBe('app.menus.errors.title')
    expect(menuTitleError('Cena')).toBe('')
    expect(itemNameError('a')).toBe('app.menus.errors.itemName')
    expect(itemNameError('Sopa')).toBe('')
  })

  it('flattens 422 errors', () => {
    expect(fieldErrors({ response: { data: { errors: { title: ['Bad', 'x'], isDefault: ['No'] } } } })).toEqual({ title: 'Bad', isDefault: 'No' })
    expect(fieldErrors(new Error('x'))).toEqual({})
  })

  it('hides N/A selections and floors pages at 1', () => {
    expect(chosenName('N/A')).toBe('')
    expect(chosenName('Flan')).toBe('Flan')
    expect(totalPages({ last_page: 4 })).toBe(4)
    expect(totalPages(undefined)).toBe(1)
  })
})
