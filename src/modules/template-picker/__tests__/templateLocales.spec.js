import { describe, it, expect } from 'vitest'
import es from '@/locales/es'
import en from '@/locales/en'

const keys = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, child]) => (child && typeof child === 'object' && !Array.isArray(child) ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`]))

describe('templatePicker texts', () => {
  it('has the same keys in Spanish and English', () => {
    const spanish = keys(es.templatePicker).sort()
    const english = keys(en.templatePicker).sort()
    expect(english).toEqual(spanish)
    expect(spanish.length).toBeGreaterThan(100)
  })

  it('has no empty text', () => {
    for (const locale of [es, en]) {
      const flat = (value, out = []) => {
        for (const child of Object.values(value)) typeof child === 'object' && child ? flat(child, out) : out.push(child)
        return out
      }
      expect(flat(locale.templatePicker).every(text => typeof text === 'string' && text.trim() !== '')).toBe(true)
    }
  })
})
