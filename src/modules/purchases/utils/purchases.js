import { formatEventDate } from '@/utils/eventDateTime'

/** Badge tone and i18n key of a purchase row. */
export function purchaseState(purchase) {
  return purchase.status === 'refunded'
    ? { tone: 'neutral', key: 'refunded' }
    : { tone: 'success', key: 'paid' }
}

/** Date in the interface language: "13 nov 2026" / "Nov 13, 2026". `paidAt` is an instant (ISO with offset): shown in the browser's zone. */
export function shortDate(iso, locale = 'es') {
  return formatEventDate(iso, 'dateShort', locale)
}
