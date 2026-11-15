import { CircleAlert, Clock, Check, CheckCheck, PhoneOff, BellOff, Eye } from 'lucide-vue-next'
import { whatsappUrl } from './roster'

/** Templates an organizer can send, in the order of the selector (keys of the contract). */
export const TEMPLATES = ['invitation', 'reminder_pending', 'save_the_date']
export const AUDIENCES = ['all', 'pending', 'selected']
/** Most guests the API takes in one request. */
export const MAX_BATCH = 500
/** Reasons a guest was left out (`skipped[].reason`). */
export const SKIP_REASONS = ['no_phone', 'invalid_phone', 'opted_out', 'recently_sent', 'already_responded', 'daily_limit']

/**
 * How each message status is drawn: icon + text (never colour alone). `offline` states are not API statuses:
 * they describe a guest that has no message because she cannot receive one.
 */
export const MESSAGE_VIEW = {
  queued: { tone: 'neutral', icon: Clock },
  sent: { tone: 'info', icon: Check },
  delivered: { tone: 'info', icon: CheckCheck },
  read: { tone: 'success', icon: Eye },
  failed: { tone: 'danger', icon: CircleAlert },
  no_phone: { tone: 'warning', icon: PhoneOff },
  opted_out: { tone: 'warning', icon: BellOff }
}

/** Module state of WhatsApp in the event: 'active', 'locked', or 'off' (the admin removed it from the catalog). null = unknown. */
export function whatsappModuleState(event) {
  if (!Array.isArray(event?.modules)) return null
  const module = event.modules.find(m => m.key === 'whatsapp')
  if (!module) return 'off'
  return module.state === 'locked' ? 'locked' : 'active'
}

/** The 422 code of the first field with errors, e.g. `no_recipients`. */
export function validationCode(error, field) {
  return error?.response?.data?.errors?.[field]?.[0] ?? null
}

/** Maps a failed `send` to the key (under `app.whatsapp.errors`) of the message to show. */
export function sendErrorKey(error) {
  const status = error?.response?.status
  const code = error?.response?.data?.code
  if (status === 403 && code === 'module_locked') return 'locked'
  if (status === 429) return code === 'whatsapp_daily_limit' ? 'dailyLimit' : 'tooManyRequests'
  if (status === 409 && code === 'whatsapp_unavailable') return 'unavailable'
  if (status === 409 && code === 'template_not_approved') return 'templateNotApproved'
  if (status === 422) {
    if (validationCode(error, 'audience') === 'no_recipients') return 'noRecipients'
    if (validationCode(error, 'guest_ids') === 'too_many') return 'tooMany'
    if (validationCode(error, 'guest_ids') === 'required') return 'selectSome'
  }
  return 'generic'
}

/** Maps a failed `retry` to the key (under `app.whatsapp.errors`) of the message to show. */
export function retryErrorKey(error) {
  const status = error?.response?.status
  const code = error?.response?.data?.code
  if (status === 409 && code === 'not_failed') return 'notFailed'
  if (status === 409 && code === 'retry_limit') return 'retryLimit'
  if (status === 429) return code === 'whatsapp_daily_limit' ? 'dailyLimit' : 'tooManyRequests'
  return 'generic'
}

/** A failed message whose outcome is unknown: Meta never confirmed, so it may have reached the guest. */
export const isUnknownDelivery = message => message?.status === 'failed' && message?.errorCode === 'unknown_delivery'

/** Groups the skipped list by reason, keeping SKIP_REASONS order: `[{ reason, guests: [name] }]`. */
export function groupSkipped(skipped) {
  return SKIP_REASONS.map(reason => ({ reason, guests: skipped.filter(s => s.reason === reason).map(s => s.guestName) })).filter(g => g.guests.length)
}

/**
 * What to show for a family: opted out (`whatsappOptedOut` of the roster), its last message status, or no phone.
 */
export function guestWhatsappState(family, message) {
  if (family.whatsappOptedOut) return { key: 'opted_out', message: null }
  if (message) return { key: message.status, message }
  if (!family.phone) return { key: 'no_phone', message: null }
  return null
}

/** The manual wa.me link of a family (free plan, or a number the automatic send cannot use). */
export function manualShareUrl(family, text) {
  return whatsappUrl(family.phone, text)
}
