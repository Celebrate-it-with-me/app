import { describe, it, expect } from 'vitest'
import { isAssistantMockEnabled } from '../services/mockFlag'

describe('isAssistantMockEnabled', () => {
  it.each(['1', 'true'])('turns the mock on for %s', value => {
    expect(isAssistantMockEnabled(value)).toBe(true)
  })

  it.each(['false', '0', '', 'no', 'TRUE', 'compressed', undefined, null])('keeps it off for %s', value => {
    expect(isAssistantMockEnabled(value)).toBe(false)
  })
})
