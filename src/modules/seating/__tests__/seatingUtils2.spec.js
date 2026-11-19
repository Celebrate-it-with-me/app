import { describe, it, expect } from 'vitest'
import {
  LIMITS,
  companionOfName,
  emptyTableForm,
  errorKind,
  errorMessageKey,
  groupOf,
  indexGuests,
  namesPreview,
  tablesForSheet,
  validateTableForm
} from '../utils/seating'

const ok = { ...emptyTableForm(), name: 'Mesa', capacity: 8 }

describe('validateTableForm matches the API limits', () => {
  it('accepts the edges', () => {
    expect(validateTableForm({ ...ok, name: 'a'.repeat(LIMITS.nameMax), capacity: 50, priority: 10, reserved_for: 'r'.repeat(100) })).toEqual({})
    expect(validateTableForm({ ...ok, capacity: 1, priority: 1 })).toEqual({})
  })
  it('flags too long names, too many seats, bad priority and long reserved text', () => {
    expect(validateTableForm({ ...ok, name: 'a'.repeat(51) }).name).toBe('tooLong')
    expect(validateTableForm({ ...ok, capacity: 51 }).capacity).toBe('tooBig')
    expect(validateTableForm({ ...ok, capacity: 0 }).capacity).toBe('invalid')
    expect(validateTableForm({ ...ok, capacity: null }).capacity).toBe('invalid')
    expect(validateTableForm({ ...ok, priority: 0 }).priority).toBe('invalid')
    expect(validateTableForm({ ...ok, priority: 11 }).priority).toBe('invalid')
    expect(validateTableForm({ ...ok, priority: 2.5 }).priority).toBe('invalid')
    expect(validateTableForm({ ...ok, reserved_for: 'r'.repeat(101) }).reserved_for).toBe('tooLong')
    expect(validateTableForm({ ...ok, type: 'zzz' }).type).toBe('invalid')
    expect(validateTableForm(undefined).name).toBe('required')
  })
  it('maps codes to message keys', () => {
    expect(errorMessageKey('name', 'required')).toBe('name')
    expect(errorMessageKey('capacity', 'invalid')).toBe('capacity')
    expect(errorMessageKey('name', 'tooLong')).toBe('nameTooLong')
  })
})

describe('errorKind', () => {
  const e = (status, data) => ({ response: { status, data } })
  it('reads the stable codes', () => {
    expect(errorKind(e(422, { code: 'table_full' }))).toBe('full')
    expect(errorKind(e(422, { errors: { table: ['table_full'] } }))).toBe('full')
    expect(errorKind(e(422, { errors: { table: ['full'] } }))).toBe('full')
    expect(errorKind(e(422, { code: 'guest_already_seated' }))).toBe('already')
    expect(errorKind(e(422, { message: 'Guest ID 3 is already assigned.' }))).toBe('already')
    expect(errorKind(e(422, { code: 'same_table' }))).toBe('same')
    expect(errorKind(e(422, { code: 'guest_not_seated' }))).toBe('missing')
    expect(errorKind(e(404, { code: 'guest_not_at_table' }))).toBe('missing')
    expect(errorKind(e(422, {}))).toBe('validation')
    expect(errorKind(e(404, {}))).toBe('missing')
    expect(errorKind(e(500, {}))).toBe('generic')
    expect(errorKind(null)).toBe('generic')
  })
})

describe('guest helpers', () => {
  const pool = [
    { id: 1, name: 'Rosa' },
    { id: 2, name: 'Jorge', parentId: 1 },
    { id: 3, name: 'Hector', companionOf: { id: 1, name: 'Rosa' } },
    { id: 4, name: 'Solo' }
  ]
  it('indexes guests across lists, ignoring empty ones', () => {
    const index = indexGuests(pool, undefined, [{ id: 9, name: 'Z' }, null])
    expect(index.size).toBe(5)
    expect(index.get(9).name).toBe('Z')
  })
  it('names whose companion someone is', () => {
    const index = indexGuests(pool)
    expect(companionOfName(pool[1], index)).toBe('Rosa')
    expect(companionOfName(pool[2], new Map())).toBe('Rosa')
    expect(companionOfName(pool[0], index)).toBe('')
    expect(companionOfName({ parentId: 77 }, index)).toBe('')
    expect(companionOfName(null, index)).toBe('')
  })
  it('groups a host with companions, from any member', () => {
    expect(groupOf(pool[1], pool).map(g => g.id)).toEqual([1, 2, 3])
    expect(groupOf(pool[0], pool).map(g => g.id)).toEqual([1, 2, 3])
    expect(groupOf(pool[3], pool).map(g => g.id)).toEqual([4])
    expect(groupOf(null, pool)).toEqual([])
    expect(groupOf(pool[0], undefined)).toEqual([])
  })
  it('previews names', () => {
    expect(namesPreview(['A', 'B'])).toBe('A, B')
    expect(namesPreview(['A', 'B', 'C', 'D', 'E'])).toBe('A, B, C +2')
    expect(namesPreview(['A', 'B', 'C'], 1, n => `y ${n}`)).toBe('A y 2')
    expect(namesPreview(undefined)).toBe('')
  })
})

describe('tablesForSheet', () => {
  const t = (id, name, capacity, n, priority = 5) => ({ id, name, capacity, priority, assigned_guests: Array.from({ length: n }, (_, i) => ({ id: i })) })
  const tables = [t(1, 'A', 4, 4), t(2, 'B', 4, 2), t(3, 'C', 6, 0, 9)]
  it('puts tables with room first and the preferred one on top', () => {
    expect(tablesForSheet(tables).map(r => r.table.id)).toEqual([3, 2, 1])
    expect(tablesForSheet(tables, { preferredId: 2 }).map(r => r.table.id)).toEqual([2, 3, 1])
    expect(tablesForSheet(tables, { preferredId: 1 }).map(r => r.table.id)[0]).toBe(1)
  })
  it('marks which tables fit the party and leaves one out', () => {
    const rows = tablesForSheet(tables, { need: 3, excludeId: 3 })
    expect(rows.map(r => [r.table.id, r.fits, r.left])).toEqual([[1, false, 0], [2, false, 2]])
    expect(rows.every(r => !r.fits)).toBe(true)
    expect(tablesForSheet(undefined)).toEqual([])
  })
})
