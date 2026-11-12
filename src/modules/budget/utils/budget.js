export const STATUSES = ['unpaid', 'partial', 'paid', 'overdue']
export const STATUS_TONE = { unpaid: 'neutral', partial: 'warning', paid: 'success', overdue: 'danger' }

/** Tabs of the item list, with the statuses each one gathers. */
export const FILTERS = [
  { value: 'all', statuses: STATUSES },
  { value: 'due', statuses: ['unpaid', 'partial'] },
  { value: 'overdue', statuses: ['overdue'] },
  { value: 'paid', statuses: ['paid'] }
]

export function formatMoney(value, currency = 'USD', locale = 'es') {
  return new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2
  }).format(Number(value) || 0)
}

/** 0–100, rounded; 0 when there is nothing owed. */
export const percent = (part, whole) => (whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0)

export const emptyItem = () => ({
  title: '',
  categoryId: '',
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
    categoryId: item.categoryId ?? '',
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
    categoryId: form.categoryId === '' ? null : Number(form.categoryId),
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

export const emptyPayment = () => ({ amount: '', paidOn: today(), note: '' })

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
  padrinoId: form.padrinoId ?? null
})

/** Items filtered by tab and search text (title or vendor). */
export function filterItems(items, filter, search) {
  const statuses = FILTERS.find(f => f.value === filter)?.statuses ?? STATUSES
  const term = String(search ?? '').trim().toLowerCase()
  return items.filter(item => statuses.includes(item.status) && (!term || `${item.title} ${item.vendorName ?? ''}`.toLowerCase().includes(term)))
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
  Object.fromEntries(FILTERS.map(f => [f.value, items.filter(item => f.statuses.includes(item.status)).length]))
