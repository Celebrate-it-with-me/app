import { whatsappUrl } from './roster'

/**
 * Send wizard (docs/plans/guest-send-wizard-contract.md). This file holds the rules of steps 1 and 3 in manual mode
 * (wa.me links): who is in each card, what is blocked, which message goes out. No Vue here, so it is easy to test.
 */

/** Cards of step 1, in order. `selected` opens the picker. */
export const CATEGORIES = ['unsent', 'pending', 'all', 'selected']

/** Decision P7: an automatic batch of more families than this asks for an explicit "I understand" (not in manual mode). */
export const BIG_BATCH = 100

/** The wizard drives both modes (F4): RosterView passes `automatic` when the WhatsApp module is on and unlocked. */
export const WIZARD_HANDLES_AUTOMATIC = true

/** The three steps: who gets it, how it looks (real cover + message), and confirm/send. */
export const STEPS = ['who', 'preview', 'confirm']

/** Templates the preview step offers, in order. */
export const TEMPLATES = ['invitation', 'reminder_pending', 'save_the_date']

/** Most families the API takes in one request; a bigger send is cut into chunks of this size. */
export const BATCH_MAX = 500

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
      locale: r.locale ?? row?.effectiveLocale ?? 'es',
      state: r.delivery?.state ?? 'none',
      sharedAt: r.delivery?.sharedAt ?? row?.delivery?.sharedAt ?? null,
      link: r.link ?? row?.link ?? null,
      optedOut: !!row?.whatsappOptedOut || r.reason === 'opted_out'
    }
  })
}

/**
 * Why a family cannot be sent to, or null. A family without phone is NOT blocked in manual mode: wa.me opens the
 * contact picker for it; in automatic mode it is (there is nobody to write to). A malformed number is blocked. An opt-out
 * is blocked only in automatic mode: in manual mode the organizer can still share by hand (owner decision 2026-11-19),
 * and the UI says the guest asked not to get messages. The automatic send builds the link in the API, so it needs none.
 */
export function blockReason(family, template, mode = 'manual') {
  const automatic = mode === 'automatic'
  if (family.optedOut && automatic) return 'opted_out'
  if (automatic && family.phone.trim() === '') return 'no_phone'
  if (family.reason === 'invalid_phone') return 'invalid_phone'
  if (!automatic && !family.link) return 'no_link'
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

/** Families that cannot be sent to, grouped by reason (`no_phone` in automatic mode only, `invalid_phone`, `opted_out`), in the order step 1 lists them. */
export function blockedGroups(families, template = 'invitation', mode = 'manual') {
  const groups = { no_phone: [], invalid_phone: [], opted_out: [] }
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

/** Templates a family set may use: with the RSVP window closed only `save_the_date` (P9). */
export const allowedTemplates = ({ rsvpOpen = true } = {}) => (rsvpOpen ? TEMPLATES : ['save_the_date'])

/** `[{ locale, n }]` of a set of families, biggest first (ties by locale). */
export function localeCounts(families) {
  const counts = new Map()
  for (const f of families) counts.set(f.locale ?? 'es', (counts.get(f.locale ?? 'es') ?? 0) + 1)
  return [...counts].map(([locale, n]) => ({ locale, n })).sort((a, b) => b.n - a.n || a.locale.localeCompare(b.locale))
}

/** Families whose language has no sendable template (`audience.templates[locale].sendable === false`): the send would fail whole. */
export const withoutTemplate = (families, templates) => families.filter(f => templates?.[f.locale ?? 'es']?.sendable === false)

/** Cuts a list in chunks of `size` (the API takes 500 at a time). */
export function chunk(list, size = BATCH_MAX) {
  const out = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

/** Statuses a batch message ends in or passes through, in the order the progress lists their counters. */
export const BATCH_COUNTERS = ['queued', 'sent', 'failed', 'delivered', 'read']

/**
 * Sums several batch answers (a send above 500 families is chained) into one: counts add up, `done` needs all of them,
 * `messages` are joined. A `null` or empty list gives `null`.
 */
export function mergeBatches(batches) {
  const list = (batches ?? []).filter(Boolean)
  if (!list.length) return null
  const sum = key => list.reduce((n, b) => n + (b[key] ?? 0), 0)
  return {
    batchId: list[0].batchId,
    batchIds: list.map(b => b.batchId),
    startedAt: list[0].startedAt ?? null,
    total: sum('total'),
    queued: sum('queued'),
    sent: sum('sent'),
    delivered: sum('delivered'),
    read: sum('read'),
    failed: sum('failed'),
    cancelled: sum('cancelled'),
    processed: list.reduce((n, b) => n + (b.processed ?? (b.total ?? 0) - (b.queued ?? 0)), 0),
    done: list.every(b => b.done === true),
    messages: list.flatMap(b => b.messages ?? [])
  }
}

/** `{ processed, total, percent }`: processed = everything that left the queue (`total - queued`); delivered/read do not hold it. */
export function batchProgress(batch) {
  const total = batch?.total ?? 0
  const processed = Math.max(0, batch?.processed ?? total - (batch?.queued ?? 0))
  return { processed, total, percent: total ? Math.round((processed / total) * 100) : 0 }
}

/** Failed messages of a batch that can be retried, and how many of them have an unknown outcome (they need a confirmation). */
export function retryable(batch) {
  const failed = (batch?.messages ?? []).filter(m => m.status === 'failed')
  return { messages: failed, unknown: failed.filter(m => m.errorCode === 'unknown_delivery').length }
}

/**
 * Polling cadence (contract 3.5): every 2 s while something is queued, then every 5 s for a minute to catch
 * delivered/read, then stop. Returns the next delay in ms, or `null` to stop. `quietFor` = ms since the queue emptied.
 */
export function pollDelay(batch, quietFor = 0, { fast = 2000, slow = 5000, tail = 60000 } = {}) {
  if ((batch?.queued ?? 0) > 0) return fast
  return quietFor < tail ? slow : null
}

/** Maps a failed `send`/`preview` to the key under `app.whatsapp.errors`; adds the wizard's 409 codes to `sendErrorKey`. */
export function wizardSendErrorKey(error, fallback) {
  const status = error?.response?.status
  const code = error?.response?.data?.code
  if (status === 409 && code === 'event_not_published') return 'notPublished'
  if (status === 409 && code === 'rsvp_closed') return 'rsvpClosed'
  if (status === 409 && code === 'event_archived') return 'archived'
  if (status === 409 && code === 'confirmation_required') return 'confirmationRequired'
  return fallback(error)
}
