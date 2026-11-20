import { safeRedirect } from '@/utils/safeRedirect'

/** Providers the API knows (`/oauth/{provider}/redirect`). Anything else in the env list is ignored. */
export const SOCIAL_PROVIDERS = ['google', 'facebook']
const DEFAULT_PROVIDERS = 'google,facebook'
const NAMES = { google: 'Google', facebook: 'Facebook' }

/** `VITE_SOCIAL_PROVIDERS` ("google,facebook") as an ordered, de-duplicated list of known providers. */
export function enabledProviders(raw = import.meta.env.VITE_SOCIAL_PROVIDERS) {
  const source = typeof raw === 'string' && raw.trim() !== '' ? raw : DEFAULT_PROVIDERS
  const list = source.split(',').map(item => item.trim().toLowerCase()).filter(item => SOCIAL_PROVIDERS.includes(item))
  return [...new Set(list)]
}

/** "facebook" -> "Facebook"; unknown values fall back to a capitalized word, empty to "". */
export function providerName(provider) {
  const key = String(provider ?? '').trim().toLowerCase()
  if (!key) return ''
  return NAMES[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}

/** The API URL that starts the OAuth round trip, carrying only an internal `redirect`. */
export function oauthRedirectUrl(provider, redirect, base = import.meta.env.VITE_API_URL) {
  const safe = safeRedirect(redirect)
  return `${base}oauth/${provider}/redirect${safe ? `?redirect=${encodeURIComponent(safe)}` : ''}`
}

/** `redirect` from the callback, only when it is an internal path (starts with "/", not "//", no scheme or host). */
export function internalRedirect(value) {
  return safeRedirect(value)
}
