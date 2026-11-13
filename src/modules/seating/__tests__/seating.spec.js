import { describe, it, expect } from 'vitest'
import {
  NO_LOCATION,
  assignedCount,
  countByStatus,
  emptyTableForm,
  errorKind,
  filterUnassigned,
  formToPayload,
  groupTablesByType,
  isTableFull,
  occupancyPercent,
  occupancyTone,
  rsvpTone,
  seatsLeft,
  sortTables,
  tableToForm,
  validateTableForm
} from '../utils/seating'

const table = (id, name, capacity, guests, extra = {}) => ({
  id,
  name,
  capacity,
  type: 'general',
  priority: 5,
  available_seats: capacity - guests,
  assigned_guests: Array.from({ length: guests }, (_, i) => ({ id: id * 100 + i })),
  ...extra
})

describe('occupancy', () => {
  it('counts assigned guests and seats left', () => {
    const t = table(1, 'A', 8, 3)
    expect(assignedCount(t)).toBe(3)
    expect(seatsLeft(t)).toBe(5)
    expect(occupancyPercent(t)).toBe(38)
  })

  it('falls back to available_seats when guests are missing', () => {
    expect(assignedCount({ capacity: 10, available_seats: 4 })).toBe(6)
    expect(assignedCount(null)).toBe(0)
  })

  it('detects full tables and caps the percentage', () => {
    expect(isTableFull(table(1, 'A', 2, 2))).toBe(true)
    expect(isTableFull(table(1, 'A', 2, 1))).toBe(false)
    expect(isTableFull({ capacity: 0, assigned_guests: [] })).toBe(false)
    expect(occupancyPercent({ capacity: 2, assigned_guests: [1, 2, 3] })).toBe(100)
    expect(occupancyPercent({ capacity: 0 })).toBe(0)
  })

  it('picks a tone from the percentage', () => {
    expect(occupancyTone(table(1, 'A', 4, 4))).toBe('success')
    expect(occupancyTone(table(1, 'A', 4, 3))).toBe('warning')
    expect(occupancyTone(table(1, 'A', 4, 1))).toBe('neutral')
  })
})

describe('sorting and grouping', () => {
  const tables = [
    table(1, 'Beta', 8, 0, { priority: 5 }),
    table(2, 'Alfa', 8, 0, { priority: 5 }),
    table(3, 'Zeta', 8, 0, { priority: 9, type: 'vip' }),
    table(4, 'Eta', 8, 0, { priority: 1, type: 'family' })
  ]

  it('sorts by priority desc then name without mutating', () => {
    const copy = [...tables]
    expect(sortTables(tables).map(t => t.name)).toEqual(['Zeta', 'Alfa', 'Beta', 'Eta'])
    expect(tables).toEqual(copy)
    expect(sortTables(null)).toEqual([])
  })

  it('groups by type in canonical order and skips empty groups', () => {
    const groups = groupTablesByType(tables)
    expect(groups.map(g => g.type)).toEqual(['vip', 'family', 'general'])
    expect(groups[2].tables.map(t => t.name)).toEqual(['Alfa', 'Beta'])
  })
})

describe('unassigned guests', () => {
  const guests = [
    { id: 1, name: 'Ana Pérez', rsvpStatus: 'attending' },
    { id: 2, name: 'Luis Gómez', rsvpStatus: 'pending' },
    { id: 3, name: 'anabel Ruiz', rsvpStatus: 'not-attending' }
  ]

  it('filters by rsvp status', () => {
    expect(filterUnassigned(guests, { status: 'pending' }).map(g => g.id)).toEqual([2])
    expect(filterUnassigned(guests, { status: 'all' })).toHaveLength(3)
  })

  it('filters by name ignoring case and whitespace, combined with status', () => {
    expect(filterUnassigned(guests, { search: '  ANA ' }).map(g => g.id)).toEqual([1, 3])
    expect(filterUnassigned(guests, { search: 'ana', status: 'attending' }).map(g => g.id)).toEqual([1])
    expect(filterUnassigned(null)).toEqual([])
  })

  it('counts by status', () => {
    expect(countByStatus(guests)).toEqual({ all: 3, attending: 1, pending: 1, 'not-attending': 1 })
  })

  it('maps rsvp to a tone', () => {
    expect(rsvpTone('attending')).toBe('success')
    expect(rsvpTone('not-attending')).toBe('danger')
    expect(rsvpTone('pending')).toBe('warning')
  })
})

describe('form validation and payload', () => {
  it('requires name and a positive integer capacity', () => {
    expect(validateTableForm(emptyTableForm())).toEqual({ name: 'required', capacity: 'invalid' })
    expect(validateTableForm({ ...emptyTableForm(), name: ' ', capacity: 4 }).name).toBe('required')
    expect(validateTableForm({ ...emptyTableForm(), name: 'A', capacity: 0 }).capacity).toBe('invalid')
    expect(validateTableForm({ ...emptyTableForm(), name: 'A', capacity: 2.5 }).capacity).toBe('invalid')
    expect(validateTableForm({ ...emptyTableForm(), name: 'A', capacity: '8' })).toEqual({})
  })

  it('builds the API payload with nulls for empty optionals', () => {
    const payload = formToPayload({ name: ' Mesa 1 ', capacity: '8', type: 'vip', priority: 7, reserved_for: ' ', location: NO_LOCATION })
    expect(payload).toEqual({ name: 'Mesa 1', capacity: 8, type: 'vip', priority: 7, reserved_for: null, location: null })
    expect(formToPayload({ ...emptyTableForm(), name: 'A', capacity: 2, location: 'front', reserved_for: 'familia' })).toMatchObject({
      location: 'front',
      reserved_for: 'familia'
    })
  })

  it('round-trips a table into form state', () => {
    const form = tableToForm({ name: 'A', capacity: 6, type: 'family', priority: 3, reserved_for: null, location: null })
    expect(form).toEqual({ name: 'A', capacity: 6, type: 'family', priority: 3, reserved_for: '', location: NO_LOCATION })
  })
})

describe('errorKind', () => {
  it('detects a full table answer', () => {
    expect(errorKind({ response: { status: 422, data: { errors: { table: ['full'] } } } })).toBe('full')
  })
  it('classifies other errors', () => {
    expect(errorKind({ response: { status: 422, data: { errors: { guest_id: ['x'] } } } })).toBe('validation')
    expect(errorKind({ response: { status: 500 } })).toBe('generic')
    expect(errorKind(new Error('x'))).toBe('generic')
  })
})
