import { describe, it, expect } from 'vitest'
import { commentError, filterComments, formatDateTime, formatTime, statusKey, statusTone } from '../utils/comments'

const c = (id, extra = {}) => ({ id, authorName: `Ana ${id}`, comment: `Hola ${id}`, status: 'visible', is_pinned: false, created_at: `2026-01-0${id}T10:00:00Z`, ...extra })

describe('filterComments', () => {
  const list = [c(1), c(2, { status: 'hidden' }), c(3, { is_pinned: true, comment: 'Felicidades' })]

  it('sorts newest first by default and oldest on demand', () => {
    expect(filterComments(list).map(x => x.id)).toEqual([3, 2, 1])
    expect(filterComments(list, { sort: 'oldest' }).map(x => x.id)).toEqual([1, 2, 3])
  })

  it('puts pinned first', () => {
    expect(filterComments([c(1, { is_pinned: true }), c(2), c(3)], { sort: 'pinned' }).map(x => x.id)).toEqual([1, 3, 2])
  })

  it('searches author and text, case-insensitive', () => {
    expect(filterComments(list, { search: 'FELIC' }).map(x => x.id)).toEqual([3])
    expect(filterComments(list, { search: 'ana 2' }).map(x => x.id)).toEqual([2])
  })

  it('filters by status', () => {
    expect(filterComments(list, { status: 'hidden' }).map(x => x.id)).toEqual([2])
  })

  it('does not mutate the input', () => {
    const copy = [...list]
    filterComments(list, { sort: 'oldest' })
    expect(list).toEqual(copy)
  })
})

describe('status and formatting', () => {
  it('maps statuses to tones', () => {
    expect(statusTone('Visible')).toBe('success')
    expect(statusTone('pending')).toBe('warning')
    expect(statusTone('hidden')).toBe('danger')
    expect(statusTone('x')).toBe('neutral')
    expect(statusKey(null)).toBe('unknown')
  })

  it('formats dates and tolerates bad input', () => {
    expect(formatDateTime('2026-01-01T10:00:00Z', 'en')).toContain('2026')
    expect(formatTime('nope')).toBe('')
    expect(formatTime(null)).toBe('')
  })
})

describe('commentError', () => {
  it('validates the text', () => {
    expect(commentError('  ')).toBe('app.comments.errors.empty')
    expect(commentError('a'.repeat(2001))).toBe('app.comments.errors.tooLong')
    expect(commentError('Hola')).toBe('')
  })
})
