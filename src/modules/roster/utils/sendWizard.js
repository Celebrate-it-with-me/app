import { whatsappUrl } from './roster'

/**
 * Send wizard (docs/plans/guest-send-wizard-contract.md). This file holds the rules of steps 1 and 3 in manual mode
 * (wa.me links): who is in each card, what is blocked, which message goes out. No Vue here, so it is easy to test.
 */

/** Cards of step 1, in order. `selected` opens the picker. */
export const CATEGORIES = ['unsent', 'pending', 'all', 'selected']

/** Decision P7: an automatic batch of more families than this asks for an explicit "I understand" (not in manual mode). */
export const BIG_BATCH = 100

/**
 * F4 flips this when the wizard also drives the automatic (Meta) send. While it is false the wizard only handles the
 * manual mode, and RosterView keeps the previous dialog for events whose WhatsApp module is on.
 */
export const WIZARD_HANDLES_AUTOMATIC = false

/**
 * Number of steps the wizard shows. Step 2 (preview with the real cover and message) is F4: when it lands, the steps
 * become ['who', 'preview', 'confirm'] and this list is the only place to change.
 */
export const STEPS = ['who', 'confirm']

/** Send modes: `manual` (wa.me, the organizer opens each chat) and `automatic` (Meta API, F4). */
export const MODES = ['manual', 'automatic']

/** Mode the wizard runs in until F4 turns the automatic send on. */
export const MODE_DEFAULT = 'manual'

/** Delivery states that mean "this family already got it, or the organizer opened it". */
export const SENT_STATES = ['manual', 'queued', 'sent', 'delivered', 'read']

/** Most pages the lists are walked (100 rows each): the same 2000-guest ceiling the old messages list had. */
export const MAX_PAGES = 20

/**
 * Joins the wizard's two reads of the same families: `recipients` (reason and delivery, from the audience endpoints)
 * and the `roster` rows (the raw phone, and the link when the API does not send `recipient.link` yet: the recipient's
 * own link wins, the roster is the fallback).
 * Returns `[{ id, name, people, phone, status, reason, state, sharedAt, link, optedOut }]`.
 */
export function mergeFamilies(recipients, roster) {
  const byId = new Map((roster ?? []).map(row => [row.id, row]))
  return (recipients ?? []).map(r => {
    const row = byId.get(r.id)
    return {
      id: r.id,
      name: r.name,
      people: r.people ?? 1,
      phone: r.phone || row?.phone || '',
      status: r.status ?? row?.status ?? 'pending',
      reason: r.reason ?? null,
      state: r.delivery?.state ?? 'none',
      sharedAt: r.delivery?.sharedAt ?? row?.delivery?.sharedAt ?? null,
      link: r.link ?? row?.link ?? null,
      optedOut: !!row?.whatsappOptedOut || r.reason === 'opted_out'
    }
  })
}

/**
 * Why a family cannot be shared by hand, or null. A family without phone is NOT blocked in manual mode: wa.me opens
 * the contact picker for it. A malformed number is blocked. An opt-out is blocked only in automatic mode: in manual
 * mode the organizer can still share by hand (owner decision 2026-11-19), and the UI says the guest asked not to get messages.
 */
export function blockReason(family, template, mode = 'manual') {
  if (family.optedOut && mode === 'automatic') return 'opted_out'
  if (family.reason === 'invalid_phone') return 'invalid_phone'
  if (!family.link) return 'no_link'
  if (template === 'reminder_pending' && family.status !== 'pending') return 'already_responded'
  return null
}

const hasPhone = family => family.phone.trim() !== ''
const wasSent = family => SENT_STATES.includes(family.state) || family.sharedAt !== null

/** Decision P5: "pending" is the main guest only; and P6: a reminder goes to someone who got something already. */
const isUnsent = family => !wasSent(family)
const isPending = family => family.status === 'pending' && wasSent(family)

/** Families of a card. `selectedIds` only matters for `selected`. */
export function membersOf(families, category, { template = 'invitation', selectedIds = [], mode = 'manual' } = {}) {
  const usable = families.filter(f => blockReason(f, template, mode) === null)
  switch (category) {
    case 'unsent':
      return usable.filter(isUnsent)
    case 'pending':
      return usable.filter(isPending)
    case 'selected': {
      const ids = new Set(selectedIds)
      return usable.filter(f => ids.has(f.id))
    }
    default:
      return usable
  }
}

/** Counters shown on the cards. */
export function categoryCounts(families, options = {}) {
  return {
    unsent: membersOf(families, 'unsent', options).length,
    pending: membersOf(families, 'pending', { ...options, template: 'reminder_pending' }).length,
    all: membersOf(families, 'all', options).length
  }
}

/** Families that cannot be shared, grouped by reason (`invalid_phone`, `opted_out`), in the order step 1 lists them. */
export function blockedGroups(families, template = 'invitation', mode = 'manual') {
  const groups = { invalid_phone: [], opted_out: [] }
  for (const family of families) {
    const reason = blockReason(family, template, mode)
    if (reason && groups[reason]) groups[reason].push(family)
  }
  return Object.entries(groups)
    .filter(([, list]) => list.length)
    .map(([reason, list]) => ({ reason, families: list }))
}

/** Families in the chosen set that have no phone: they are shared by picking the contact by hand. */
export const withoutPhone = families => families.filter(f => !hasPhone(f))

/**
 * Message template the card proposes (contract 3.3). With the RSVP window closed, an invitation or a reminder would
 * point to a form nobody can answer (P9): only `save_the_date` is left.
 */
export function templateFor(category, { rsvpOpen = true } = {}) {
  if (!rsvpOpen) return 'save_the_date'
  return category === 'pending' ? 'reminder_pending' : 'invitation'
}

/** Whether a card can be used: the reminder needs the RSVP window open. */
export const categoryAllowed = (category, { rsvpOpen = true } = {}) => !(category === 'pending' && !rsvpOpen)

/** Whether the chosen number of families asks for the explicit confirmation of P7: automatic mode only. */
export const needsBigBatchConfirm = (count, mode = 'manual') => mode === 'automatic' && count > BIG_BATCH

/** Families of a set that asked not to receive messages (shared by hand anyway in manual mode). */
export const optedOutIn = families => families.filter(f => f.optedOut)

/** Fills the `{name}`, `{event}` and `{link}` of a message. Plain replacement: the text is the organizer's own. */
export function renderMessage(text, vars) {
  return String(text ?? '').replace(/\{(name|event|link)\}/g, (_, key) => vars[key] ?? '')
}

/** Whether a message keeps the `{link}` the guest needs to open the invitation. */
export const keepsLink = text => String(text ?? '').includes('{link}')

/** The wa.me link of one family with its message. */
export function manualLink(family, text) {
  return whatsappUrl(family.phone, text)
}

/** Opened families of a chosen set: `{ done, total, left }`. */
export function manualProgress(families, sharedAtById) {
  const done = families.filter(f => (sharedAtById[f.id] ?? null) !== null).length
  return { done, total: families.length, left: families.length - done }
}

/** Maps a failed audience/recipients read to the key (under `app.whatsapp.wizard.errors`). */
export function loadErrorKey(error) {
  const status = error?.response?.status
  const code = error?.response?.data?.code
  if (status === 403) return 'forbidden'
  if (status === 409 && code === 'event_archived') return 'archived'
  return 'generic'
}
