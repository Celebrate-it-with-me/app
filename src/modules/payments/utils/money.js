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

const FINAL = ['failed', 'refunded', 'chargeback']

/**
 * Failure codes the API sets when the money side looks wrong (amount or reference mismatch, a second payment of an
 * unlocked event). The purchase is flagged for a manual review: it is not a failed payment from the buyer's side.
 */
export const REVIEW_CODES = ['amount_mismatch', 'duplicate_payment', 'reference_mismatch']

/**
 * Wait for the outcome of a purchase: resolves with the last answer as soon as it is unlocked or ended badly
 * (failed, refunded, chargeback, or flagged for review); with `null` after `tries` when it is still pending.
 */
export async function waitForOutcome(check, { tries = 15, delay = 2000, sleep = ms => new Promise(r => setTimeout(r, ms)) } = {}) {
  for (let i = 0; i < tries; i++) {
    const res = await check()
    // A flagged purchase can still say `pending` (amount mismatch): waiting longer will not change it.
    if (res && (res.unlocked || FINAL.includes(res.status) || REVIEW_CODES.includes(res.failureCode))) return res
    if (i < tries - 1) await sleep(delay)
  }
  return null
}

/** 422 `errors.event: ['already_unlocked']`: the event was paid for in the meantime. */
export function isAlreadyUnlocked(error) {
  return error?.response?.status === 422 && Boolean(error.response.data?.errors?.event?.includes('already_unlocked'))
}

/** 409 `checkout_in_progress` / `payment_in_progress`: another checkout or payment of this event is still running. */
export function isPaymentInProgress(error) {
  return error?.response?.status === 409 && ['checkout_in_progress', 'payment_in_progress'].includes(error.response.data?.code)
}

/** The API answers 422 with `errors.code` when a code is unknown, expired or used up. */
export function isInvalidCode(error) {
  return error?.response?.status === 422 && Boolean(error.response.data?.errors?.code)
}
