import RosterService from './RosterService'

/**
 * In-memory stand-in for the WhatsApp endpoints, active when `VITE_WHATSAPP_MOCK` is set. It follows the
 * contract (docs/plans/communications-contract.md) so the screen can be built and photographed before the API
 * exists. Values of the variable:
 *   1            normal behaviour
 *   locked       every call answers 403 module_locked
 *   unavailable  send answers 409 whatsapp_unavailable
 *   unapproved   send answers 409 template_not_approved
 *   dailylimit   send and retry answer 429 whatsapp_daily_limit (the dry run, stale by then, still counts everybody in)
 *   partial      only 2 guests fit in today's quota: the rest come back as skipped daily_limit
 *   retrylimit   retry answers 409 retry_limit
 *   unknown      failed messages carry errorCode unknown_delivery (the outcome is not known)
 *   modlocked    the module shows as locked in the event's modules (no call is made)
 *   modoff       the module is missing from the event's modules
 *   demo         like 1, and families without a message show invented delivery states (screenshots)
 * The roster answers with `delivery` per family and `counts.delivery` (contract §4.8); in modlocked/modoff (manual
 * mode) every third family with a phone shows as `manual` (opened by hand).
 * A message moves queued -> sent -> delivered -> read with the clock (2 s, 6 s, 12 s); guests whose id ends in 5
 * fail with 131026. Guest id multiple of 7: opted out. Phones that are not E.164 are `invalid_phone`.
 */

const E164 = /^\+[1-9]\d{7,14}$/
const DAY = 24 * 60 * 60 * 1000
const messages = []
let nextId = 1

/** `localStorage['cwm.whatsappMock']` overrides the variable at runtime (handy for screenshots). */
function mode() {
  try {
    return localStorage.getItem('cwm.whatsappMock') || String(import.meta.env.VITE_WHATSAPP_MOCK)
  } catch {
    return String(import.meta.env.VITE_WHATSAPP_MOCK)
  }
}

/** With the mock on the event has no `whatsapp` module yet (the catalog is the API's): pretend it does. null = mock off. */
export function mockModuleState() {
  if (!import.meta.env.VITE_WHATSAPP_MOCK) return null
  return mode() === 'modlocked' ? 'locked' : mode() === 'modoff' ? 'off' : 'active'
}

function fail(status, data) {
  const error = new Error(`mock ${status}`)
  error.response = { status, data }
  return error
}

const QUOTA = 2
const dailyLimit = () => fail(429, { message: 'Daily limit.', code: 'whatsapp_daily_limit' })

function guard(kind) {
  if (mode() === 'locked') throw fail(403, { message: 'Module locked.', code: 'module_locked', module: 'whatsapp' })
  if (kind === 'send' && mode() === 'unavailable') throw fail(409, { message: 'WhatsApp is not configured.', code: 'whatsapp_unavailable' })
  if (kind === 'send' && mode() === 'unapproved') throw fail(409, { message: 'Template not approved.', code: 'template_not_approved' })
}

/** The message as the API would show it now, derived from when it was queued. */
function view(message) {
  const age = Date.now() - new Date(message.queuedAt).getTime()
  const at = ms => new Date(new Date(message.queuedAt).getTime() + ms).toISOString()
  const base = { ...message, sentAt: null, deliveredAt: null, readAt: null, failedAt: null, errorCode: null, errorMessage: null, status: 'queued' }
  if (age < 2000) return base
  if (message.guestId % 10 === 5 && !message.retried) {
    if (mode() === 'unknown') return { ...base, status: 'failed', failedAt: at(2000), errorCode: 'unknown_delivery', errorMessage: 'Timeout waiting for Meta' }
    return { ...base, status: 'failed', failedAt: at(2000), errorCode: '131026', errorMessage: 'Message undeliverable' }
  }
  const sent = { ...base, status: 'sent', sentAt: at(2000), waMessageId: `wamid.MOCK${message.id}` }
  if (age < 6000) return sent
  const delivered = { ...sent, status: 'delivered', deliveredAt: at(6000) }
  if (age < 12000 || message.guestId % 2 === 0) return delivered
  return { ...delivered, status: 'read', readAt: at(12000) }
}

async function allFamilies(eventId, status) {
  const families = []
  for (let page = 1; page <= 20; page++) {
    const result = await RosterService.listRaw(eventId, { ...(status && status !== 'all' ? { status } : {}), page, perPage: 100 })
    families.push(...result.data)
    if (page >= (result.meta?.lastPage ?? 1)) break
  }
  return families
}

export const mockWhatsapp = {
  async send(eventId, body) {
    guard('send')
    let pool
    if (body.audience === 'selected') {
      if (!body.guest_ids?.length) throw fail(422, { message: 'Invalid.', errors: { guest_ids: ['required'] } })
      if (body.guest_ids.length > 500) throw fail(422, { message: 'Invalid.', errors: { guest_ids: ['too_many'] } })
      const all = await allFamilies(eventId)
      pool = all.filter(f => body.guest_ids.includes(f.id))
    } else {
      pool = await allFamilies(eventId, body.audience === 'pending' ? 'pending' : undefined)
    }
    const skipped = []
    let queued = 0
    let dry = 0
    const now = Date.now()
    let room = mode() === 'partial' ? QUOTA : Infinity
    if (mode() === 'dailylimit' && !body.dry_run) throw dailyLimit()
    for (const family of pool) {
      let skip = reasonFor(family, body, now, eventId)
      if (!skip && room <= 0) skip = 'daily_limit'
      if (!skip) room--
      if (skip) {
        skipped.push({ guestId: family.id, guestName: family.name, reason: skip })
        continue
      }
      if (body.dry_run) {
        dry++
        continue
      }
      messages.push({
        id: nextId++, eventId, eventName: 'Mock', guestId: family.id, guestName: family.name, templateKey: body.template,
        locale: family.effectiveLocale ?? 'es', to: family.phone, status: 'queued', errorCode: null, errorMessage: null,
        waMessageId: null, queuedAt: new Date(now).toISOString(), sentAt: null, deliveredAt: null, readAt: null, failedAt: null
      })
      queued++
    }
    if (body.dry_run) return { queued: dry, skipped }
    if (!queued) throw fail(422, { message: 'Invalid.', errors: { audience: ['no_recipients'] } })
    return { batchId: `mock-${Date.now()}`, queued, skipped }
  },

  async messages(eventId, params) {
    guard('read')
    let list = messages.filter(m => m.eventId === eventId).map(view)
    if (params.guest_id) list = list.filter(m => m.guestId === Number(params.guest_id))
    if (params.status) list = list.filter(m => m.status === params.status)
    if (params.latest_per_guest) {
      const latest = new Map()
      for (const m of list) if (!latest.has(m.guestId) || m.id > latest.get(m.guestId).id) latest.set(m.guestId, m)
      list = [...latest.values()]
    }
    list.sort((a, b) => b.id - a.id)
    const perPage = Math.min(Number(params.per_page) || 15, 100)
    const page = Number(params.page) || 1
    return { data: list.slice((page - 1) * perPage, page * perPage), meta: { page, perPage, total: list.length } }
  },

  async summary(eventId) {
    guard('read')
    const list = messages.filter(m => m.eventId === eventId).map(view)
    const count = status => list.filter(m => m.status === status).length
    return { total: list.length, queued: count('queued'), sent: count('sent'), delivered: count('delivered'), read: count('read'), failed: count('failed') }
  },

  async retry(eventId, messageId) {
    guard('read')
    const message = messages.find(m => m.id === Number(messageId) && m.eventId === eventId)
    if (!message) throw fail(404, { message: 'Not found.', code: 'not_found' })
    if (view(message).status !== 'failed') throw fail(409, { message: 'Not failed.', code: 'not_failed' })
    if (mode() === 'dailylimit') throw dailyLimit()
    if (mode() === 'retrylimit') throw fail(409, { message: 'Retry limit.', code: 'retry_limit' })
    // A retry always succeeds in the mock: it goes through the queue again.
    message.queuedAt = new Date().toISOString()
    message.retried = true
    return view(message)
  }
}

/** Invented but stable states for the families that have no message (mode `demo`). */
function demoState(family) {
  const states = ['read', 'delivered', 'sent', null, 'failed', null, 'delivered']
  const state = states[family.id % states.length]
  return state === 'failed' && !family.phone ? null : state
}

/** The `delivery` object of a family (contract §4.8) from its last mock message. */
function deliveryOf(family, manual, latest) {
  const base = { state: 'none', lastMessageId: null, lastAt: null, errorCode: null, errorMessage: null, retryCount: 0, sharedAt: null }
  if (manual) return family.phone && family.id % 3 === 0 ? { ...base, state: 'manual', sharedAt: new Date(Date.now() - DAY).toISOString() } : base
  const message = latest.get(family.id)
  if (message) {
    return { ...base, state: message.status, lastMessageId: message.id, lastAt: message.sentAt ?? message.queuedAt, errorCode: message.errorCode, errorMessage: message.errorMessage }
  }
  const state = mode() === 'demo' ? demoState(family) : null
  if (!state) return base
  const at = new Date(Date.now() - 3600 * 1000).toISOString()
  return state === 'failed' ? { ...base, state, lastMessageId: 900 + family.id, lastAt: at, errorCode: '131026', errorMessage: 'Message undeliverable' } : { ...base, state, lastAt: at }
}

function deliveryMatches(family, filter) {
  const state = family.delivery.state
  if (filter === 'unsent') return state === 'none'
  if (filter === 'problem') return state === 'failed'
  return !['none', 'failed', 'opted_out', 'no_phone'].includes(state)
}

mockWhatsapp.roster = async function roster(eventId, params, raw) {
  const manual = mockModuleState() !== 'active'
  const latest = new Map()
  for (const m of messages.filter(x => x.eventId === eventId).map(view)) if (!latest.has(m.guestId) || m.id > latest.get(m.guestId).id) latest.set(m.guestId, m)
  const decorate = family => ({ ...family, whatsappOptedOut: family.id % 7 === 0, delivery: deliveryOf(family, manual, latest) })
  const everyone = (await allFamilies(eventId)).map(decorate)
  const counts = { unsent: 0, queued: 0, sent: 0, delivered: 0, read: 0, failed: 0, noPhone: 0, shared: 0 }
  for (const f of everyone) {
    const s = f.delivery.state
    if (s === 'none') {
      counts.unsent++
      if (!f.phone) counts.noPhone++
    }
    else if (s === 'manual') counts.shared++
    else counts[s]++
  }
  const base = await raw(eventId, { page: 1, perPage: 1, ...(params.status ? { status: params.status } : {}) })
  let list = (await allFamilies(eventId, params.status)).map(decorate)
  if (params.search) list = list.filter(f => `${f.name} ${f.phone ?? ''} ${f.email ?? ''}`.toLowerCase().includes(String(params.search).toLowerCase()))
  if (params.delivery) list = list.filter(f => deliveryMatches(f, params.delivery))
  const perPage = Number(params.perPage) || 15
  const page = Number(params.page) || 1
  return {
    ...base,
    data: list.slice((page - 1) * perPage, page * perPage),
    meta: { ...base.meta, currentPage: page, lastPage: Math.max(1, Math.ceil(list.length / perPage)), total: list.length },
    counts: { ...base.counts, delivery: counts }
  }
}

function reasonFor(family, body, now, eventId) {
  if (!family.phone) return 'no_phone'
  if (!E164.test(family.phone.replace(/[\s().-]/g, ''))) return 'invalid_phone'
  if (family.id % 7 === 0) return 'opted_out'
  if (body.template === 'reminder_pending' && family.status !== 'pending') return 'already_responded'
  const recent = messages.some(m => m.eventId === eventId && m.guestId === family.id && m.templateKey === body.template && now - new Date(m.queuedAt).getTime() < DAY)
  if (recent && !body.force) return 'recently_sent'
  return null
}
