/** Cents to a price: whole dollars without decimals ($99), otherwise with them ($79.50). */
export function formatMoney(cents, currency = 'USD', locale = 'es') {
  const amount = (Number(cents) || 0) / 100
  // `es` alone writes "79 US$"; the audience is Hispanic US, who write $79.
  return new Intl.NumberFormat(locale === 'es' ? 'es-US' : locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2
  }).format(amount)
}

/** Wait for the payment confirmation: true as soon as `check()` says unlocked, false after `tries`. */
export async function waitForUnlock(check, { tries = 15, delay = 2000, sleep = ms => new Promise(r => setTimeout(r, ms)) } = {}) {
  for (let i = 0; i < tries; i++) {
    if ((await check())?.unlocked) return true
    if (i < tries - 1) await sleep(delay)
  }
  return false
}

/** The API answers 422 with `errors.code` when a code is unknown, expired or used up. */
export function isInvalidCode(error) {
  return error?.response?.status === 422 && Boolean(error.response.data?.errors?.code)
}
