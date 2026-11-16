/**
 * DEV only. Stands in for the purchase endpoints so the return screen can be seen in every state without Stripe.
 * UnlockReturnView loads it with a dynamic import behind `import.meta.env.DEV`, so it never reaches the production bundle.
 * Use `/dashboard/events/:id/unlock?purchase=1&mock=<scenario>` (add `&cancelled=1` for the cancel flow).
 */
const base = { purchaseId: 1, amountCents: 7900, currency: 'USD', failureCode: null, invoiceId: null }

export const SCENARIOS = {
  paid: { ...base, unlocked: true, status: 'paid', invoiceId: 7 },
  pending: { ...base, unlocked: false, status: 'pending' },
  expired: { ...base, unlocked: false, status: 'failed', failureCode: 'expired' },
  declined: { ...base, unlocked: false, status: 'failed', failureCode: 'payment_failed' },
  gateway: { ...base, unlocked: false, status: 'failed', failureCode: 'gateway_error' },
  refunded: { ...base, unlocked: false, status: 'refunded' },
  chargeback: { ...base, unlocked: false, status: 'chargeback' }
}

export function mockPayments(scenario = 'paid') {
  return {
    status: async () => SCENARIOS[scenario] ?? SCENARIOS.paid,
    cancel: async () => {
      if (scenario === 'paid') throw { response: { status: 409, data: { code: 'not_pending' } } }
      return { status: 'failed', failureCode: 'cancelled' }
    }
  }
}
