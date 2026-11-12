import { describe, it, expect } from 'vitest'
import es from '../es'
import en from '../en'

/** Flattens nested keys: { a: { b: 1 } } -> ['a.b'] */
function keysOf(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (Array.isArray(value)) return [`${path}[${value.length}]`]
    if (value && typeof value === 'object') return keysOf(value, path)
    return [path]
  })
}

describe('locale files', () => {
  it('have exactly the same keys (and array lengths) in es and en', () => {
    const esKeys = keysOf(es).sort()
    const enKeys = keysOf(en).sort()
    expect(esKeys).toEqual(enKeys)
  })

  it('have no empty strings', () => {
    for (const messages of [es, en]) {
      const empty = keysOf(messages).filter(k => {
        const value = k.split('.').reduce((o, part) => o?.[part.replace(/\[\d+\]$/, '')], messages)
        return value === ''
      })
      expect(empty).toEqual([])
    }
  })

  it('name the product Quinvite in both languages', () => {
    expect(es.common.brand).toBe('Quinvite')
    expect(en.common.brand).toBe('Quinvite')
  })
})
