import { describe, it, expect } from 'vitest'
import {
  fileProblem, previewErrorCode, errorKey, phoneCheck, editableRows, withEdit, filterRows, summarize, groupFamilies, hasFamilies, importPayload, MAX_BYTES
} from '../utils/guestImport'

const api = [
  { line: 2, name: 'Ana Pérez', phone: '+13055550111', phoneRaw: '+13055550111', phoneNote: null, email: 'ana@x.com', family: 'Pérez', problems: [], duplicate: false },
  { line: 3, name: 'Luis Pérez', phone: '+13055550112', phoneRaw: '305 555 0112', phoneNote: 'assumed_us', email: null, family: 'Pérez', problems: [], duplicate: false },
  { line: 4, name: 'Bad Phone', phone: null, phoneRaw: '12ab', phoneNote: 'invalid', email: null, family: null, problems: ['phone_invalid'], duplicate: false },
  { line: 5, name: 'Demo', phone: '+13055550101', phoneRaw: '+13055550101', phoneNote: null, email: null, family: null, problems: [], duplicate: true },
  { line: 6, name: '', phone: null, phoneRaw: null, phoneNote: null, email: null, family: null, problems: ['name_missing'], duplicate: false }
]

describe('file checks', () => {
  it('accepts csv/xlsx/xls under 2 MB', () => {
    expect(fileProblem({ name: 'a.CSV', size: 10 })).toBeNull()
    expect(fileProblem({ name: 'a.xlsx', size: 10 })).toBeNull()
    expect(fileProblem({ name: 'a.pdf', size: 10 })).toBe('fileType')
    expect(fileProblem({ name: 'a.csv', size: MAX_BYTES + 1 })).toBe('fileSize')
    expect(fileProblem(null)).toBe('generic')
  })
})

describe('error codes', () => {
  const err = (status, file) => ({ response: { status, data: { errors: { file } } } })
  it('maps the 422 file codes', () => {
    for (const code of ['missing_name_column', 'empty_file', 'too_many_rows', 'unreadable_file']) {
      expect(previewErrorCode(err(422, [code]))).toBe(code)
      expect(errorKey(code)).toBe(`app.guestImport.errors.${code}`)
    }
  })
  it('falls back to generic', () => {
    expect(previewErrorCode(err(422, ['weird']))).toBe('generic')
    expect(previewErrorCode(new Error('network'))).toBe('generic')
    expect(previewErrorCode({ response: { status: 413 } })).toBe('fileSize')
  })
})

describe('phoneCheck', () => {
  it('mirrors the server rules', () => {
    expect(phoneCheck('')).toEqual({ valid: true, note: null })
    expect(phoneCheck('+52 55 1234 5678')).toEqual({ valid: true, note: null })
    expect(phoneCheck('305 555 0112')).toEqual({ valid: true, note: 'assumed_us' })
    expect(phoneCheck('1 305 555 0112')).toEqual({ valid: true, note: null })
    expect(phoneCheck('12ab').valid).toBe(false)
    expect(phoneCheck('555-0112').valid).toBe(false)
  })
})

describe('preview rows', () => {
  const rows = editableRows(api)

  it('selects only clean, new rows by default', () => {
    expect(rows.map(r => r.include)).toEqual([true, true, false, false, false])
  })

  it('counts chips', () => {
    expect(summarize(rows)).toEqual({ all: 5, ready: 2, problems: 2, duplicates: 1, assumedUs: 1, selected: 2 })
  })

  it('filters', () => {
    expect(filterRows(rows, 'problems').map(r => r.line)).toEqual([4, 6])
    expect(filterRows(rows, 'duplicates').map(r => r.line)).toEqual([5])
    expect(filterRows(rows, 'ready').map(r => r.line)).toEqual([2, 3])
    expect(filterRows(rows, 'all')).toHaveLength(5)
  })

  it('groups by family, ignoring case and empty values', () => {
    const groups = groupFamilies(rows)
    expect(groups).toHaveLength(1)
    expect(groups[0].map(r => r.line)).toEqual([2, 3])
    expect(hasFamilies(rows)).toBe(true)
    expect(hasFamilies(rows.slice(2))).toBe(false)
  })

  it('fixing a phone clears the problem and selects the row', () => {
    const fixed = withEdit(rows[2], { phoneInput: '305 555 0199' })
    expect(fixed.problems).toEqual([])
    expect(fixed.phoneNote).toBe('assumed_us')
    expect(fixed.include).toBe(true)
  })

  it('breaking a row unselects it; an emptied name is a problem', () => {
    const broken = withEdit(rows[0], { name: ' ' })
    expect(broken.problems).toEqual(['name_missing'])
    expect(broken.include).toBe(false)
  })

  it('fixing a duplicate does not select it', () => {
    expect(withEdit(rows[3], { name: 'Demo 2' }).include).toBe(false)
  })
})

describe('import payload', () => {
  it('sends only kept rows, without empty fields', () => {
    const rows = editableRows(api)
    rows[3].include = true
    expect(importPayload(rows)).toEqual({
      rows: [
        { name: 'Ana Pérez', phone: '+13055550111', email: 'ana@x.com', family: 'Pérez' },
        { name: 'Luis Pérez', phone: '+13055550112', family: 'Pérez' },
        { name: 'Demo', phone: '+13055550101' }
      ]
    })
  })

  it('sends the edited phone', () => {
    const rows = editableRows(api)
    rows[2] = withEdit(rows[2], { phoneInput: '305 555 0199' })
    expect(importPayload(rows).rows.find(r => r.name === 'Bad Phone').phone).toBe('305 555 0199')
  })
})
