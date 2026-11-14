/** Badge tone and i18n key of a purchase row. */
export function purchaseState(purchase) {
  return purchase.status === 'refunded'
    ? { tone: 'neutral', key: 'refunded' }
    : { tone: 'success', key: 'paid' }
}

/** Date in the interface language: "13 nov 2026" / "Nov 13, 2026". */
export function shortDate(iso, locale = 'es') {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale === 'es' ? 'es-US' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}
