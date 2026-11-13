export const STATUS_TONE = { visible: 'success', pending: 'warning', hidden: 'danger' }
export const STATUS_FILTERS = ['all', 'visible', 'pending', 'hidden']
export const SORTS = ['newest', 'oldest', 'pinned']
export const MAX_LENGTH = 2000

export const statusKey = status => {
  const s = (status || '').toLowerCase()
  return s in STATUS_TONE ? s : 'unknown'
}

export const statusTone = status => STATUS_TONE[statusKey(status)] || 'neutral'

const format = (value, locale, options) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, options).format(date)
}

export const formatTime = (value, locale = 'es') => format(value, locale, { hour: '2-digit', minute: '2-digit' })

export const formatDateTime = (value, locale = 'es') => format(value, locale, { dateStyle: 'medium', timeStyle: 'short' })

/** Client-side search, status filter and sort over normalized comments. */
export function filterComments(list, { search = '', status = 'all', sort = 'newest' } = {}) {
  let result = [...(list || [])]

  const q = search.trim().toLowerCase()
  if (q) {
    result = result.filter(c => (c.authorName || '').toLowerCase().includes(q) || (c.comment || '').toLowerCase().includes(q))
  }

  if (status !== 'all') {
    result = result.filter(c => (c.status || '').toLowerCase() === status)
  }

  result.sort((a, b) => {
    if (sort === 'pinned') {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
    }
    const diff = new Date(b.created_at) - new Date(a.created_at)
    return sort === 'oldest' ? -diff : diff
  })

  return result
}

/** Validation for the new-comment form. Returns an i18n key or ''. */
export function commentError(text) {
  const value = (text || '').trim()
  if (!value) return 'app.comments.errors.empty'
  if (value.length > MAX_LENGTH) return 'app.comments.errors.tooLong'
  return ''
}
