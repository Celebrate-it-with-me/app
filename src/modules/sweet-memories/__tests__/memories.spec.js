import { describe, it, expect } from 'vitest'
import {
  ALL_YEARS,
  availableYears,
  buildMemoryFormData,
  emptyMemoryForm,
  errorInfo,
  filterMemories,
  formToPayload,
  formatSize,
  memoryStats,
  memoryToForm,
  sortMemories,
  validateFile,
  validateMemoryForm
} from '../utils/memories'

const file = (type, size) => ({ type, size, name: 'a.png' })
const list = [
  { id: 1, title: 'Boat', description: 'Summer', year: 2010, visible: 1 },
  { id: 2, title: 'Cake', description: '', year: 2020, visible: 0 },
  { id: 3, title: 'Mystery', description: 'no year', year: null, visible: 1 },
  { id: 4, title: 'Beach', description: 'boat trip', year: 2020, visible: 1 }
]

describe('validateFile', () => {
  it('accepts allowed images up to 5 MB', () => {
    expect(validateFile(file('image/png', 5 * 1024 * 1024))).toBeNull()
    expect(validateFile(file('image/webp', 10))).toBeNull()
  })
  it('rejects other types and oversize files', () => {
    expect(validateFile(file('application/pdf', 10))).toBe('type')
    expect(validateFile(file('image/png', 5 * 1024 * 1024 + 1))).toBe('size')
    expect(validateFile(null)).toBe('type')
  })
})

describe('formatSize', () => {
  it('formats bytes, KB and MB', () => {
    expect(formatSize(500)).toBe('500 B')
    expect(formatSize(2048)).toBe('2 KB')
    expect(formatSize(3 * 1024 * 1024)).toBe('3.0 MB')
  })
})

describe('form', () => {
  it('maps a memory to a form and defaults visible', () => {
    expect(memoryToForm({ title: 'A', year: 2001, visible: 0 })).toEqual({ title: 'A', description: '', year: '2001', visible: false })
    expect(memoryToForm(null).visible).toBe(true)
  })
  it('validates title, year, description and image', () => {
    expect(validateMemoryForm(emptyMemoryForm(), { hasImage: false })).toEqual({ title: 'required', image: 'required' })
    const ok = { title: 'x', description: '', year: '2024', visible: true }
    expect(validateMemoryForm(ok, { hasImage: true })).toEqual({})
    expect(validateMemoryForm({ ...ok, year: '1800' }, { hasImage: true }).year).toBe('range')
    expect(validateMemoryForm({ ...ok, year: 'abc' }, { hasImage: true }).year).toBe('range')
    expect(validateMemoryForm({ ...ok, title: 'x'.repeat(101) }, { hasImage: true }).title).toBe('max')
    expect(validateMemoryForm({ ...ok, description: 'x'.repeat(501) }, { hasImage: true }).description).toBe('max')
  })
})

describe('payload', () => {
  it('builds a details-only payload without file or order', () => {
    const p = formToPayload({ title: ' Hi ', description: '', year: '', visible: false })
    expect(p).toEqual({ title: 'Hi', description: '', year: '', visible: 0 })
    const fd = buildMemoryFormData(p)
    expect(fd.has('files[0]')).toBe(false)
    expect(fd.has('order')).toBe(false)
    expect(fd.get('visible')).toBe('0')
  })
  it('adds file, metadata and order when given', () => {
    const f = new File(['x'], 'p.png', { type: 'image/png' })
    const fd = buildMemoryFormData(formToPayload({ title: 'A', description: '', year: '2020', visible: true }, f, 0))
    expect(fd.get('files[0]')).toBeInstanceOf(File)
    expect(fd.get('metadata[0][name]')).toBe('p.png')
    expect(fd.get('order')).toBe('0')
    expect(fd.get('year')).toBe('2020')
  })
})

describe('filter, sort, stats', () => {
  it('lists years descending without duplicates', () => {
    expect(availableYears(list)).toEqual([2020, 2010])
  })
  it('filters by search and year', () => {
    expect(filterMemories(list, { search: 'boat' }).map(m => m.id)).toEqual([1, 4])
    expect(filterMemories(list, { year: '2020' }).map(m => m.id)).toEqual([2, 4])
    expect(filterMemories(list, { search: '', year: ALL_YEARS })).toHaveLength(4)
  })
  it('sorts by year keeping ties stable and undated last', () => {
    expect(sortMemories(list, 'newest').map(m => m.id)).toEqual([2, 4, 1, 3])
    expect(sortMemories(list, 'oldest').map(m => m.id)).toEqual([1, 2, 4, 3])
  })
  it('counts visible and hidden', () => {
    expect(memoryStats(list)).toEqual({ total: 4, visible: 3, hidden: 1 })
  })
})

describe('errorInfo', () => {
  it('detects file errors in 422 responses', () => {
    const e = { response: { status: 422, data: { errors: { 'files.0': ['bad'] } } } }
    expect(errorInfo(e)).toMatchObject({ kind: 'validation', hasFileError: true })
    expect(errorInfo({ response: { status: 500 } }).kind).toBe('generic')
  })
})
