/** Minimum time between two queries to the API (entering the dashboard, coming back to the tab). */
export const MIN_REFRESH_MS = 5 * 60 * 1000

export const LEVELS = ['info', 'news', 'warning']

/**
 * Where a call-to-action may lead. Only an internal path (`/x`, never `//host` or with a backslash) or an `https://`
 * address is accepted; anything else (javascript:, data:, http:, relative text) yields null and the button is not shown.
 * Returns `{ kind: 'internal' | 'external', href }`.
 */
export function safeCta(url) {
  if (typeof url !== 'string') return null
  const value = url.trim()
  if (!value) return null
  if (value.startsWith('/')) {
    if (value.startsWith('//') || value.includes('\\') || [...value].some(c => c.charCodeAt(0) < 32)) return null
    return { kind: 'internal', href: value }
  }
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'https:' || !parsed.hostname) return null
    return { kind: 'external', href: parsed.href }
  } catch {
    return null
  }
}

/** Keeps only well-formed announcements from the API; a bad row is dropped, never thrown at. Max 3 per contract. */
export function normalizeAnnouncements(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(a => a && (typeof a.id === 'number' || typeof a.id === 'string') && typeof a.title === 'string' && typeof a.body === 'string')
    .map(a => ({
      id: a.id,
      level: LEVELS.includes(a.level) ? a.level : 'info',
      title: a.title,
      body: a.body,
      ctaLabel: typeof a.ctaLabel === 'string' && a.ctaLabel ? a.ctaLabel : null,
      ctaUrl: typeof a.ctaUrl === 'string' && a.ctaUrl ? a.ctaUrl : null,
      dismissible: a.dismissible !== false
    }))
    .slice(0, 3)
}
