import { describe, it, expect } from 'vitest'
import { normalizePhone } from '../phone'

describe('normalizePhone', () => {
  it('keeps a valid E.164 number', () => expect(normalizePhone('+13055550123')).toBe('+13055550123'))
  it('cleans spaces, dashes and parentheses', () => {
    expect(normalizePhone('+1 (305) 555-0123')).toBe('+13055550123')
    expect(normalizePhone('+52 55 1234 5678')).toBe('+525512345678')
  })
  it('reads a bare 10-digit number as US', () => expect(normalizePhone('305 555 0123')).toBe('+13055550123'))
  it('reads 1 + 10 digits as US', () => expect(normalizePhone('1-305-555-0123')).toBe('+13055550123'))
  it('is empty for blank input', () => {
    expect(normalizePhone('')).toBe('')
    expect(normalizePhone('   ')).toBe('')
    expect(normalizePhone(null)).toBe('')
  })
  it('is null when it cannot be a phone', () => {
    expect(normalizePhone('abc')).toBeNull()
    expect(normalizePhone('12345')).toBeNull()
    expect(normalizePhone('+0123456789')).toBeNull()
    expect(normalizePhone('+1234567890123456')).toBeNull()
  })
})
