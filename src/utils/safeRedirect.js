const MAX_LENGTH = 2048
const AUTH_PAGES = ['/sign-in', '/sign-up', '/forgot-password', '/confirm-reset', '/password-updated']

/**
 * The path to come back to after signing in, or `undefined` when there is nothing worth returning to.
 * It never points at a sign-in page (that is how `?redirect=` used to nest on every bounce): a sign-in
 * path is unwrapped to the `redirect` it carries, and anything that is not a same-origin path is dropped.
 */
export function safeRedirect(path, depth = 0) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || depth > 5) return undefined
  // A backslash (`/\\evil.com` is read as `//evil.com` by browsers) or a control character (tab/newline are stripped
  // by URL parsers, which can turn `/\t/evil.com` into `//evil.com`) never belongs to an internal path.
  if (path.length > MAX_LENGTH || path.includes('\\') || [...path].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return undefined
  const at = path.indexOf('?')
  const pathname = at === -1 ? path : path.slice(0, at)
  const search = at === -1 ? '' : path.slice(at + 1)
  if (!AUTH_PAGES.includes(pathname)) return path
  if (pathname !== '/sign-in') return undefined
  return safeRedirect(new URLSearchParams(search).get('redirect'), depth + 1)
}
