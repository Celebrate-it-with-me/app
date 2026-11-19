export const STATUSES = ['invited', 'accepted']
export const STATUS_TONE = { invited: 'neutral', accepted: 'success' }

/** Payment progress of a padrino, as the API computes it from the budget. */
export const PROGRESS_TONE = { none: 'neutral', unpaid: 'warning', partial: 'warning', paid: 'success' }

export const emptyPadrino = () => ({ name: '', phone: '', relationship: '', status: 'invited', publicThanks: false, thanksText: '' })

export const formFromPadrino = padrino => ({
  name: padrino.name,
  phone: padrino.phone ?? '',
  relationship: padrino.relationship ?? '',
  status: padrino.status,
  publicThanks: !!padrino.publicThanks,
  thanksText: padrino.thanksText ?? ''
})

export function padrinoErrors(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'app.padrinos.errors.name'
  if (form.phone && !/^\+?[0-9][0-9 ().-]{5,29}$/.test(form.phone.trim())) errors.phone = 'app.padrinos.errors.phone'
  return errors
}

export function padrinoPayload(form) {
  const blank = value => (String(value ?? '').trim() ? String(value).trim() : null)
  return {
    name: form.name.trim(),
    phone: blank(form.phone),
    relationship: blank(form.relationship),
    status: form.status,
    guestId: null,
    publicThanks: !!form.publicThanks,
    thanksText: form.publicThanks ? blank(form.thanksText) : null
  }
}

/** Commitments rows for the modal: every budget item, checked when the padrino covers it. */
export function commitmentRows(items, commitments) {
  const byItem = new Map(commitments.map(c => [c.budgetItemId, c.amount]))
  return items.map(item => ({
    budgetItemId: item.id,
    title: item.title,
    owed: item.owed,
    checked: byItem.has(item.id),
    amount: byItem.has(item.id) ? String(byItem.get(item.id)) : ''
  }))
}

/** Why the rows cannot be sent: a checked row needs an amount above zero. */
export const commitmentsValid = rows => rows.filter(r => r.checked).every(r => Number(r.amount) > 0)

export const commitmentsPayload = rows =>
  rows.filter(r => r.checked).map(r => ({ budgetItemId: r.budgetItemId, amount: Number(r.amount) }))

/** WhatsApp link to write to the padrino; with no phone it opens the contact picker. */
export function whatsappUrl(phone, text) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  return `https://wa.me/${digits.length >= 8 ? digits : ''}?text=${encodeURIComponent(text)}`
}

export const RESOLUTIONS = { attribute: 'attribute_payments', additional: 'additional' }

/** What the API said when it refused to save the commitments, as a small tagged object (or null for any other error). */
export function commitmentProblem(error) {
  const status = error?.response?.status
  const body = error?.response?.data ?? {}
  if (status === 409 && body.code === 'commitment_item_paid' && Array.isArray(body.conflicts) && body.conflicts.length) {
    return { type: 'conflict', conflicts: body.conflicts }
  }
  if (status === 422 && body.code === 'commitment_exceeds_remaining') {
    return { type: 'exceeds', budgetItemId: body.budgetItemId, remaining: Number(body.remaining) || 0 }
  }
  return null
}

/**
 * How much the "additional" outcome may add to an item: what is still unpaid, compared with the INCREASE of this
 * padrino's commitment (the API does the same), so lowering or keeping an amount is never blocked.
 */
export function additionalIncrease(conflict, commitments, previous) {
  const amount = commitments.find(c => c.budgetItemId === conflict.budgetItemId)?.amount ?? 0
  const before = previous.find(c => c.budgetItemId === conflict.budgetItemId)?.amount ?? 0
  return Math.max(0, amount - before)
}

export const additionalAllowed = (conflict, commitments, previous) =>
  Number(conflict.remaining) > 0 && additionalIncrease(conflict, commitments, previous) <= Number(conflict.remaining)

/** Retry payload: every commitment, with the chosen resolution only on the ones that were in conflict. */
export const withResolutions = (commitments, choices) =>
  commitments.map(c => (choices[c.budgetItemId] ? { ...c, resolution: choices[c.budgetItemId] } : c))

/** Titles of the items named by `commitments_exceed_cost` warnings. */
export const warningTitles = (warnings, items) =>
  (warnings ?? [])
    .filter(w => w.code === 'commitments_exceed_cost')
    .map(w => items.find(i => i.id === w.budgetItemId)?.title)
    .filter(Boolean)

/** Sum of the family payments (no padrino yet) the API listed for an item in conflict. */
export const unattributedTotal = conflict =>
  (conflict.unattributedPayments ?? []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

/** `2026-09-12` -> "12 sep 2026"; parsed by hand so the timezone never moves the day. */
export function formatPaidOn(value, locale = 'es') {
  const [y, m, d] = String(value ?? '').slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d))
}
