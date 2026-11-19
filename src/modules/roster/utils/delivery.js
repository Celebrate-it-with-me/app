import { CircleDashed, ExternalLink } from 'lucide-vue-next'
import { MESSAGE_VIEW } from './whatsapp'

/**
 * Delivery of the invitation per family, as the roster answers it (`family.delivery`, contract §4.8):
 *   { state, lastMessageId, lastAt, errorCode, errorMessage, retryCount, sharedAt }
 * `state` is none | manual | queued | sent | delivered | read | failed | opted_out | no_phone.
 * `manual` means the organizer opened the wa.me link ("Abierto"): it says nothing about delivery.
 */
export const DELIVERY_VIEW = {
  none: { tone: 'neutral', icon: CircleDashed },
  manual: { tone: 'info', icon: ExternalLink },
  ...MESSAGE_VIEW
}

/** Values of the `delivery` filter the roster takes, in the order of the chips. */
export const DELIVERY_FILTERS = ['unsent', 'sent', 'problem']

export const noDeliveryCounts = () => ({ unsent: 0, queued: 0, sent: 0, delivered: 0, read: 0, failed: 0, noPhone: 0, optedOut: 0, shared: 0 })

/**
 * What a row shows: `{ key, tone, icon, at, message }`, or null when the roster did not say (older answer).
 * `message` has the shape the retry flow already takes (`{ id, status, errorCode, errorMessage }`).
 */
export function deliveryOf(family) {
  const delivery = family?.delivery
  if (!delivery?.state) return null
  let key = delivery.state
  if (family.whatsappOptedOut) key = 'opted_out'
  else if (key === 'none' && !family.phone) key = 'no_phone'
  const failed = key === 'failed'
  return {
    key,
    ...DELIVERY_VIEW[key],
    at: delivery.lastAt ?? delivery.sharedAt ?? null,
    message: failed
      ? { id: delivery.lastMessageId, status: 'failed', errorCode: delivery.errorCode ?? null, errorMessage: delivery.errorMessage ?? null }
      : null
  }
}

/**
 * The chips above the list: filters of the delivery axis with the counters of the whole event.
 * "Sent" gathers everything that left the organizer's hands (queued, sent, delivered, read, or opened by hand).
 * "Problem" = failed, opted out or without a phone (the API's `delivery=problem`). In manual mode it hides until
 * something is wrong.
 */
export function deliveryChips(delivery, { automatic }) {
  const counts = { ...noDeliveryCounts(), ...delivery }
  const sent = counts.queued + counts.sent + counts.delivered + counts.read + counts.shared
  const chips = [
    { value: 'unsent', key: 'unsent', count: counts.unsent },
    { value: 'sent', key: automatic ? 'sent' : 'opened', count: sent }
  ]
  const problem = counts.failed + counts.noPhone + counts.optedOut
  if (automatic || problem) chips.push({ value: 'problem', key: 'problem', count: problem })
  return chips
}
