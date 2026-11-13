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
