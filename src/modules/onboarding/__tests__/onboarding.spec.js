import { describe, it, expect } from 'vitest'
import { normalizeProgress, stepCards, allDone, shareState, firstName, emptyProgress } from '../utils/steps'
import { cleanType, storePendingType, readPendingType, clearPendingType, PENDING_TYPE_KEY } from '../utils/pendingType'

const memory = () => {
  const data = {}
  return {
    data,
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v) },
    removeItem: k => { delete data[k] }
  }
}
const broken = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') }, removeItem() { throw new Error('blocked') } }

describe('step state', () => {
  it('starts with the event done', () => {
    expect(stepCards(emptyProgress()).map(s => s.done)).toEqual([true, false, false, false])
  })

  it('maps the API summary and counts what is done', () => {
    const p = normalizeProgress({ steps: { event: true, guests: true, details: false, share: false }, guests: 12, details: { program: true }, status: 'draft', stage: 'invitation' })
    expect(p.done).toBe(2)
    expect(p.total).toBe(4)
    expect(p.guests).toBe(12)
    expect(p.details).toEqual({ program: true, places: false, dressCode: false })
    expect(allDone(p)).toBe(false)
  })

  it('survives an empty payload and always counts the event', () => {
    expect(normalizeProgress(null).done).toBe(1)
    expect(normalizeProgress({ steps: { event: false } }).steps.event).toBe(true)
  })

  it('knows when all four are done', () => {
    expect(allDone(normalizeProgress({ steps: { guests: true, details: true, share: true } }))).toBe(true)
  })

  it('tells what is live', () => {
    expect(shareState({ status: 'draft', stage: 'invitation' })).toBe('none')
    expect(shareState({ status: 'published', stage: 'save_the_date' })).toBe('saveTheDate')
    expect(shareState({ status: 'published', stage: 'invitation' })).toBe('invitation')
  })

  it('takes the first name', () => {
    expect(firstName('  Marisol Peña ')).toBe('Marisol')
    expect(firstName('')).toBe('')
    expect(firstName(null)).toBe('')
  })
})

describe('stored event type', () => {
  it('accepts only the two known types', () => {
    expect(cleanType('wedding')).toBe('wedding')
    expect(cleanType(['quinceanera', 'x'])).toBe('quinceanera')
    expect(cleanType('birthday')).toBeNull()
    expect(cleanType(undefined)).toBeNull()
  })

  it('stores, reads and clears', () => {
    const s = memory()
    expect(storePendingType('quinceanera', s)).toBe(true)
    expect(s.data[PENDING_TYPE_KEY]).toBe('quinceanera')
    expect(readPendingType(s)).toBe('quinceanera')
    clearPendingType(s)
    expect(readPendingType(s)).toBeNull()
  })

  it('does not store garbage and ignores a tampered value', () => {
    const s = memory()
    expect(storePendingType('birthday', s)).toBe(false)
    s.data[PENDING_TYPE_KEY] = '<script>'
    expect(readPendingType(s)).toBeNull()
  })

  it('never throws when storage is blocked', () => {
    expect(storePendingType('wedding', broken)).toBe(false)
    expect(readPendingType(broken)).toBeNull()
    expect(() => clearPendingType(broken)).not.toThrow()
  })
})
