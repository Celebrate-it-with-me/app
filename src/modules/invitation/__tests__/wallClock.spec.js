import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { invitationHelpers } from '../composables/useInvitation'

describe('native formatDate', () => {
  const { formatDate } = invitationHelpers(ref({ locale: 'en' }))

  it('keeps the wall-clock time of the event whatever the browser zone says', () => {
    expect(formatDate('2026-03-08T02:30:00', { timeStyle: 'short' })).toMatch(/^2:30\sAM$/)
    expect(formatDate('2026-12-31T23:59:00', { day: 'numeric' })).toBe('31')
    expect(formatDate('2026-12-28T19:00:00', { dateStyle: 'long' })).toBe('December 28, 2026')
  })

  it('returns an empty string for empty or invalid dates', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate(null)).toBe('')
    expect(formatDate('nonsense')).toBe('')
  })
})
