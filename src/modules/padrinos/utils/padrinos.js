import { formatEventDate } from '@/utils/eventDateTime'
import { coverageOf } from '@/modules/budget/utils/budget'

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

/** `2026-09-12` -> "12 sep 2026"; a plain day, so the timezone never moves it. */
export function formatPaidOn(value, locale = 'es') {
  return formatEventDate(String(value ?? '').slice(0, 10), 'dateShort', locale)
}

const cents = value => Math.round((Number(value) || 0) * 100)
const sum = payments => payments.reduce((total, p) => total + cents(p.amount), 0) / 100

/** What the family itself paid on an item (payments with no padrino). */
export const paidSelfOf = item => sum((item?.payments ?? []).filter(p => p.padrinoId == null))

/**
 * One commitment of a padrino against its budget item: what the padrino paid (`paidPadrino`), what is still to come
 * (`pendingPadrino`) and the family's own payments (`paidSelf`). `conflict` is set when what is still to come no longer
 * fits in what the item has left, so the contribution would leave it paid over its cost.
 * @returns {{ budgetItemId: number, title: string, amount: number, paidPadrino: number, pendingPadrino: number, paidSelf: number, status: 'paid'|'pending', conflict: null|{ paid: number, total: number, pending: number } }}
 */
export function sponsorLine(padrino, commitment, items) {
  const item = (items ?? []).find(i => i.id === commitment.budgetItemId)
  const paidPadrino = sum((item?.payments ?? []).filter(p => p.padrinoId === padrino.id))
  const pendingPadrino = Math.max(0, (cents(commitment.amount) - cents(paidPadrino)) / 100)
  const coverage = item ? coverageOf(item) : null
  const conflict = coverage && pendingPadrino > 0 && cents(pendingPadrino) > cents(coverage.remaining) ? { paid: coverage.paid, total: coverage.total, pending: pendingPadrino } : null
  return {
    budgetItemId: commitment.budgetItemId,
    title: item?.title ?? commitment.itemTitle ?? '',
    amount: Number(commitment.amount) || 0,
    paidPadrino,
    pendingPadrino,
    paidSelf: paidSelfOf(item),
    status: pendingPadrino > 0 ? 'pending' : 'paid',
    conflict
  }
}

export const sponsorLines = (padrino, items) => (padrino.commitments ?? []).map(c => sponsorLine(padrino, c, items))

/** Every contribution that collides with an expense already paid: `[{ padrinoId, padrinoName, ...line }]`. */
export const conflictsOf = (padrinos, items) =>
  (padrinos ?? []).flatMap(p => sponsorLines(p, items).filter(l => l.conflict).map(l => ({ padrinoId: p.id, padrinoName: p.name, ...l })))

export const conflictAnchor = c => `padrino-conflict-${c.padrinoId}-${c.budgetItemId}`

/**
 * Warning for a payment of the family on an item with padrinos still to contribute: they would push it past its cost.
 * `amount` is the payment typed and `editing` the payment being edited (so it is not counted twice).
 * Nothing when the payer is a padrino (that lowers what is pending) or when the payment alone already overpays.
 * @returns {null|{ names: string, pending: number, excess: number }}
 */
export function sponsorOverpay(item, amount, { padrinoId = null, editing = null } = {}) {
  if (!item || padrinoId != null) return null
  const pending = (item.padrinos ?? []).filter(p => cents(p.committed) > cents(p.paid))
  const pendingCents = pending.reduce((total, p) => total + cents(p.committed) - cents(p.paid), 0)
  if (pendingCents <= 0) return null
  const paidAfter = cents(item.paid) - (editing ? cents(editing.amount) : 0) + cents(amount)
  const total = cents(item.owed)
  if (paidAfter > total) return null
  const excess = paidAfter + pendingCents - total
  return excess > 0 ? { names: pending.map(p => p.name).join(', '), pending: pendingCents / 100, excess: excess / 100 } : null
}

const TITLES = /^(t[ií]o|t[ií]a|do[ñn]a|don)\s+/i

/** Initials of the avatar: the prefix Tío/Tía/Doña/Don is ignored and "Familia X" is "F" plus X's initial. */
export function initialsOf(name) {
  const words = String(name ?? '').trim().replace(TITLES, '').split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const upper = w => w.charAt(0).toLocaleUpperCase()
  if (/^familia$/i.test(words[0]) && words[1]) return 'F' + upper(words[1])
  return (words.length > 1 ? [words[0], words[words.length - 1]] : words).map(upper).join('')
}

/** Rotating avatar colors, by position in the list. */
export const AVATAR_TONES = ['bg-gold-100 text-gold-700', 'bg-rose-100 text-rose-700', 'bg-info-50 text-info-700']
export const avatarTone = index => AVATAR_TONES[((index % AVATAR_TONES.length) + AVATAR_TONES.length) % AVATAR_TONES.length]
