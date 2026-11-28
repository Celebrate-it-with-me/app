/** The select cannot hold an empty value, so "none" stands for no category / paid by the family. */
export const NONE = 'none'

export const STATUSES = ['unpaid', 'partial', 'paid', 'overpaid', 'overdue']
export const STATUS_TONE = { unpaid: 'neutral', partial: 'warning', paid: 'success', overpaid: 'danger', overdue: 'danger' }

/** Tabs of the item list, with the statuses each one gathers. */
export const FILTERS = [
  { value: 'all', statuses: STATUSES },
  { value: 'due', statuses: ['unpaid', 'partial'] },
  { value: 'overdue', statuses: ['overdue'] },
  { value: 'paid', statuses: ['paid', 'overpaid'] }
]

export function formatMoney(value, currency = 'USD', locale = 'es') {
  return new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2
  }).format(Number(value) || 0)
}

const cents = value => Math.round((Number(value) || 0) * 100)

/**
 * The one way to read what is paid against what is owed, for an item, a category or the whole budget (the Dashboard uses
 * it too). `total` is what is owed and `paid` the sum of every payment (padrinos' included). `covered` never goes past the
 * total, `remaining` never goes below zero and `overpaid` is what went past it, so `covered + remaining === total` always.
 * Takes `{ owed, paid }` (item or `totals`); a `remaining` given by the API (the sum of each item's own balance) is
 * trusted for groups, where one overpaid item must not hide what another still owes.
 * @returns {{ total: number, paid: number, covered: number, remaining: number, overpaid: number, percent: number }}
 */
export function coverageOf(source) {
  const total = cents(source?.owed)
  const paid = cents(source?.paid)
  const remaining = source?.remaining === undefined || source?.remaining === null ? Math.max(0, total - paid) : Math.min(total, Math.max(0, cents(source.remaining)))
  const covered = total - remaining
  const overpaid = Math.max(0, paid - covered)
  return { total: total / 100, paid: paid / 100, covered: covered / 100, remaining: remaining / 100, overpaid: overpaid / 100, percent: total > 0 ? Math.round((covered / total) * 100) : 0 }
}

/** The status an item shows: the API's, except that paid past the cost is `overpaid`. */
export const statusOf = item => (item?.status !== 'overdue' && coverageOf(item).overpaid > 0 ? 'overpaid' : item?.status)

/** Items that were paid past their cost, with the sum of the excess. */
export function overpaidOf(items) {
  const list = (items ?? []).filter(item => coverageOf(item).overpaid > 0)
  return { items: list, count: list.length, amount: list.reduce((sum, item) => sum + cents(coverageOf(item).overpaid), 0) / 100 }
}

/** How full a bar is, 0–100 (what is paid over what is owed), and its tone: complete, partial or over. */
export function barOf(source) {
  const c = coverageOf(source)
  const fill = c.total > 0 ? Math.min(100, (c.paid / c.total) * 100) : 0
  const tone = c.overpaid > 0 ? 'over' : c.total > 0 && c.remaining === 0 ? 'complete' : 'partial'
  return { ...c, fill, tone }
}

/** 0–100, rounded; 0 when there is nothing owed. */
export const percent = (part, whole) => (whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0)

export const emptyItem = () => ({
  title: '',
  categoryId: NONE,
  estimatedCost: '',
  agreedCost: '',
  dueDate: '',
  vendorName: '',
  vendorPhone: '',
  description: ''
})

export function formFromItem(item) {
  return {
    title: item.title,
    categoryId: item.categoryId ?? NONE,
    estimatedCost: String(item.estimatedCost ?? ''),
    agreedCost: item.agreedCost === null || item.agreedCost === undefined ? '' : String(item.agreedCost),
    dueDate: item.dueDate ?? '',
    vendorName: item.vendorName ?? '',
    vendorPhone: item.vendorPhone ?? '',
    description: item.description ?? ''
  }
}

const num = value => (value === '' || value === null || value === undefined ? null : Number(value))

export function itemPayload(form) {
  const blank = value => (String(value ?? '').trim() ? String(value).trim() : null)
  return {
    title: form.title.trim(),
    categoryId: form.categoryId === NONE || form.categoryId === '' || form.categoryId == null ? null : Number(form.categoryId),
    estimatedCost: num(form.estimatedCost) ?? 0,
    agreedCost: num(form.agreedCost),
    dueDate: form.dueDate || null,
    vendorName: blank(form.vendorName),
    vendorPhone: blank(form.vendorPhone),
    description: blank(form.description)
  }
}

export function itemErrors(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'app.budget.errors.title'
  const estimated = num(form.estimatedCost)
  if (estimated === null || Number.isNaN(estimated) || estimated < 0) errors.estimatedCost = 'app.budget.errors.amount'
  const agreed = num(form.agreedCost)
  if (agreed !== null && (Number.isNaN(agreed) || agreed < 0)) errors.agreedCost = 'app.budget.errors.amount'
  return errors
}

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const emptyPayment = () => ({ amount: '', paidOn: today(), note: '', padrinoId: NONE })

export function paymentErrors(form) {
  const errors = {}
  const amount = num(form.amount)
  if (amount === null || Number.isNaN(amount) || amount <= 0) errors.amount = 'app.budget.errors.paymentAmount'
  if (!form.paidOn) errors.paidOn = 'app.budget.errors.paidOn'
  return errors
}

export const paymentPayload = form => ({
  amount: Number(form.amount),
  paidOn: form.paidOn,
  note: String(form.note ?? '').trim() || null,
  padrinoId: form.padrinoId === NONE || form.padrinoId === '' || form.padrinoId == null ? null : Number(form.padrinoId)
})

/** Items filtered by tab and search text (title or vendor). */
export function filterItems(items, filter, search) {
  const statuses = FILTERS.find(f => f.value === filter)?.statuses ?? STATUSES
  const term = String(search ?? '').trim().toLowerCase()
  return items.filter(item => statuses.includes(statusOf(item)) && (!term || `${item.title} ${item.vendorName ?? ''}`.toLowerCase().includes(term)))
}

/** `[{ category: {id,name}|null, items }]` in the order of the categories; items with none go last. */
export function groupByCategory(items, categories) {
  const groups = categories
    .map(category => ({ category, items: items.filter(item => item.categoryId === category.id) }))
    .filter(group => group.items.length)
  const loose = items.filter(item => !categories.some(category => category.id === item.categoryId))
  return loose.length ? [...groups, { category: null, items: loose }] : groups
}

/** Counts of each tab, from all items. */
export const filterCounts = items =>
  Object.fromEntries(FILTERS.map(f => [f.value, items.filter(item => f.statuses.includes(statusOf(item))).length]))
