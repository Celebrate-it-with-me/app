// src/modules/comments/composables/useCommentFormatters.js
// All comments in code are in English, as requested.

export function useCommentFormatters() {
  const getInitials = name => {
    if (!name) return '?'
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = dateStr => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDateTime = dateStr => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date)
  }

  const getStatusVariant = status => {
    switch ((status || '').toLowerCase()) {
      case 'visible':
        return 'success'
      case 'pending':
        return 'warning'
      case 'hidden':
        return 'error'
      default:
        return 'gray'
    }
  }

  const getStatusLabel = status => {
    const s = (status || '').trim()
    if (!s) return 'Unknown'
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  return {
    getInitials,
    formatTime,
    formatDateTime,
    getStatusVariant,
    getStatusLabel
  }
}
