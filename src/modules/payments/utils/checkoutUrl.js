const CHECKOUT_HOST = 'checkout.stripe.com'

/**
 * The URL to send the browser to after creating a checkout, or `null` when it is not safe to follow.
 * Only an https Stripe Checkout page qualifies; a same-origin URL is also allowed because a free (amount 0)
 * purchase answers with the app's own success URL. Anything else (javascript:, http:, other hosts, junk) is rejected.
 */
export function safeCheckoutUrl(url, ownOrigin = window.location.origin) {
  if (typeof url !== 'string' || !url.trim()) return null
  let parsed
  try {
    parsed = new URL(url, ownOrigin)
  } catch {
    return null
  }
  if (parsed.origin === ownOrigin) return parsed.href
  if (parsed.protocol === 'https:' && parsed.hostname === CHECKOUT_HOST && !parsed.username && !parsed.password) return parsed.href
  return null
}
