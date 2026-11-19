// Development-only fake of PUT /app/event/{event}/padrinos/{padrino}/commitments (contract: docs/plans/padrino-commitment-paid-contract.md).
// Turn it on from the browser console:
//   localStorage.setItem('cwm.mockPadrinoCommitments', '1')                      // default scenario
//   localStorage.setItem('cwm.mockPadrinoCommitments', JSON.stringify({ conflicts: [...], warn: [7] }))
// Remove the key to talk to the real API again.

const DEFAULT = {
  conflicts: [
    {
      budgetItemId: 1,
      itemName: 'Banquete',
      cost: 5000,
      paid: 3000,
      remaining: 2000,
      unattributedPayments: [
        { id: 11, amount: 1500, paidOn: '2026-09-12', note: 'Anticipo' },
        { id: 12, amount: 1500, paidOn: '2026-10-20', note: null }
      ]
    }
  ],
  warn: []
}

export function scenario(raw = localStorage.getItem('cwm.mockPadrinoCommitments')) {
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? { ...DEFAULT, ...parsed } : DEFAULT
  } catch {
    return DEFAULT
  }
}

const reject = (status, data) => Promise.reject({ response: { status, data } })

export async function mockSetCommitments(commitments, config = scenario()) {
  const ids = new Set(commitments.map(c => c.budgetItemId))
  const open = config.conflicts.filter(c => ids.has(c.budgetItemId))
  const pending = open.filter(c => !commitments.find(x => x.budgetItemId === c.budgetItemId).resolution)
  if (pending.length) {
    return reject(409, { code: 'commitment_item_paid', message: 'These items already have payments.', conflicts: pending })
  }
  for (const conflict of open) {
    const { amount, resolution } = commitments.find(x => x.budgetItemId === conflict.budgetItemId)
    if (resolution === 'additional' && amount > conflict.remaining) {
      return reject(422, { code: 'commitment_exceeds_remaining', message: 'Too much.', budgetItemId: conflict.budgetItemId, remaining: conflict.remaining })
    }
  }
  return { data: { commitments }, warnings: config.warn.map(budgetItemId => ({ code: 'commitments_exceed_cost', budgetItemId })) }
}
