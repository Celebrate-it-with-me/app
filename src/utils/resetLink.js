export const RESET_LINK_PATH = '/api/v1/app/check-password-link'

/**
 * True only when `link` is the API's own signed reset-check URL: exactly the configured API origin, the
 * check-password-link path, no embedded credentials and no fragment. Anything else (another host, a lookalike
 * subdomain, a relative or scheme-relative URL, `javascript:`/`data:`, a different path) is rejected so the SPA
 * never POSTs the session cookie or the XSRF token to a host the link chose. The query is left untouched.
 */
export function isTrustedResetLink(link, apiUrl = import.meta.env.VITE_API_URL) {
  if (typeof link !== 'string' || !link || typeof apiUrl !== 'string' || !apiUrl) return false
  try {
    const url = new URL(link)
    const api = new URL(apiUrl)
    return (
      (api.protocol === 'https:' || api.protocol === 'http:') &&
      url.origin === api.origin &&
      url.username === '' &&
      url.password === '' &&
      url.hash === '' &&
      url.pathname === RESET_LINK_PATH
    )
  } catch {
    return false
  }
}
