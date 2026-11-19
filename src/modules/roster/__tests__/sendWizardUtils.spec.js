import { describe, it, expect } from 'vitest'
import {
  BIG_BATCH, MODE_DEFAULT, STEPS, blockReason, blockedGroups, categoryAllowed, categoryCounts, keepsLink, loadErrorKey, manualLink, manualProgress,
  BATCH_COUNTERS, allowedTemplates, batchProgress, chunk, localeCounts, mergeBatches, pollDelay, retryable, withoutTemplate, wizardSendErrorKey,
  membersOf, mergeFamilies, needsBigBatchConfirm, optedOutIn, renderMessage, templateFor, withoutPhone
} from '../utils/sendWizard'

const rec = (id, extra = {}) => ({ id, name: `G${id}`, people: 2, phone: '+13055550101', status: 'pending', reason: null, delivery: { state: 'none' }, ...extra })
const roster = (id, extra = {}) => ({ id, phone: '+13055550101', link: `https://q.test/i/xv/${id}`, ...extra })
const families = () =>
  mergeFamilies(
    [
      rec(1),
      rec(2, { delivery: { state: 'manual', sharedAt: '2026-11-19T10:00:00Z' } }),
      rec(3, { phone: '', reason: 'no_phone' }),
      rec(4, { reason: 'invalid_phone' }),
      rec(5, { reason: 'opted_out' }),
      rec(6, { status: 'attending', delivery: { state: 'read' } }),
      rec(7),
      { id: 8, name: 'G8' }
    ],
    [roster(1), roster(2), roster(3, { phone: '' }), roster(4), roster(5), roster(6), roster(8, { phone: '', whatsappOptedOut: true })]
  )

describe('mergeFamilies', () => {
  it('joins recipients with their roster row and fills the gaps', () => {
    const list = families()
    expect(list[0]).toMatchObject({ id: 1, link: 'https://q.test/i/xv/1', state: 'none', sharedAt: null, optedOut: false })
    expect(list[1].sharedAt).toBe('2026-11-19T10:00:00Z')
    expect(list[6].link).toBeNull()
    expect(list[7]).toMatchObject({ people: 1, phone: '', status: 'pending', state: 'none', optedOut: true })
    expect(mergeFamilies(null, null)).toEqual([])
    // the recipient's own link wins; the roster row is only the fallback
    const both = mergeFamilies([rec(1, { link: 'https://q.test/api/1' }), rec(2)], [roster(1), roster(2)])
    expect(both.map(f => f.link)).toEqual(['https://q.test/api/1', 'https://q.test/i/xv/2'])
    expect(mergeFamilies([rec(1, { link: 'https://q.test/api/1' })], [])[0].link).toBe('https://q.test/api/1')
    expect(mergeFamilies([rec(1, { phone: '' })], [roster(1, { delivery: { sharedAt: 'x' } })])[0]).toMatchObject({ phone: '+13055550101', sharedAt: 'x' })
  })
})

describe('blockReason', () => {
  it('blocks bad numbers, missing links and answered reminders, but not a missing phone', () => {
    const [a, , noPhone, invalid, optedOut, answered, noLink] = families()
    expect(blockReason(a, 'invitation')).toBeNull()
    expect(blockReason(noPhone, 'invitation')).toBeNull()
    expect(blockReason(noPhone, 'invitation', 'automatic')).toBe('no_phone')
    expect(blockReason(noLink, 'invitation', 'automatic')).toBeNull()
    expect(blockReason(invalid, 'invitation')).toBe('invalid_phone')
    expect(blockReason(optedOut, 'invitation', 'automatic')).toBe('opted_out')
    // manual mode: an opt-out can still be shared by hand (owner decision 2026-11-19)
    expect(blockReason(optedOut, 'invitation')).toBeNull()
    expect(blockReason(optedOut, 'invitation', 'manual')).toBeNull()
    expect(MODE_DEFAULT).toBe('manual')
    expect(blockReason(noLink, 'invitation')).toBe('no_link')
    expect(blockReason(answered, 'reminder_pending')).toBe('already_responded')
    expect(blockReason(answered, 'invitation')).toBeNull()
  })
})

describe('categories', () => {
  it('splits the families into the cards (P5, P6)', () => {
    const list = families()
    expect(membersOf(list, 'unsent').map(f => f.id)).toEqual([1, 3, 5, 8])
    expect(membersOf(list, 'unsent', { mode: 'automatic' }).map(f => f.id)).toEqual([1, 7])
    expect(membersOf(list, 'pending', { template: 'reminder_pending' }).map(f => f.id)).toEqual([2])
    expect(membersOf(list, 'all').map(f => f.id)).toEqual([1, 2, 3, 5, 6, 8])
    expect(membersOf(list, 'selected', { selectedIds: [1, 5, 99] }).map(f => f.id)).toEqual([1, 5])
    expect(membersOf(list, 'selected', { selectedIds: [1, 5, 99], mode: 'automatic' }).map(f => f.id)).toEqual([1])
    expect(categoryCounts(list)).toEqual({ unsent: 4, pending: 1, all: 6 })
    expect(categoryCounts(list, { mode: 'automatic' })).toEqual({ unsent: 2, pending: 1, all: 4 })
  })

  it('lists what cannot be shared and who has no phone', () => {
    const list = families()
    expect(blockedGroups(list).map(g => [g.reason, g.families.map(f => f.id)])).toEqual([['invalid_phone', [4]]])
    expect(blockedGroups(list, 'invitation', 'automatic').map(g => [g.reason, g.families.map(f => f.id)])).toEqual([['no_phone', [3]], ['invalid_phone', [4]], ['opted_out', [5, 8]]])
    expect(optedOutIn(list).map(f => f.id)).toEqual([5, 8])
    expect(blockedGroups([])).toEqual([])
    expect(withoutPhone(membersOf(list, 'all')).map(f => f.id)).toEqual([3, 8])
  })

  it('closes invitation and reminder when RSVP is closed (P9)', () => {
    expect(templateFor('unsent')).toBe('invitation')
    expect(templateFor('pending')).toBe('reminder_pending')
    expect(templateFor('all', { rsvpOpen: false })).toBe('save_the_date')
    expect(categoryAllowed('pending', { rsvpOpen: false })).toBe(false)
    expect(categoryAllowed('all', { rsvpOpen: false })).toBe(true)
    expect(categoryAllowed('pending')).toBe(true)
  })

  it('asks for confirmation above 100 families only in automatic mode (P7)', () => {
    expect(needsBigBatchConfirm(BIG_BATCH, 'automatic')).toBe(false)
    expect(needsBigBatchConfirm(BIG_BATCH + 1, 'automatic')).toBe(true)
    expect(needsBigBatchConfirm(BIG_BATCH + 1)).toBe(false)
    expect(needsBigBatchConfirm(BIG_BATCH + 1, 'manual')).toBe(false)
    expect(STEPS).toEqual(['who', 'preview', 'confirm'])
  })
})

describe('message and progress', () => {
  it('fills the tokens and builds the wa.me link', () => {
    const text = renderMessage('Hola {name}, {event}: {link}', { name: 'Ana', event: 'XV', link: 'https://q.test' })
    expect(text).toBe('Hola Ana, XV: https://q.test')
    expect(renderMessage(null, {})).toBe('')
    expect(renderMessage('{link}', {})).toBe('')
    expect(keepsLink('x {link}')).toBe(true)
    expect(keepsLink('x')).toBe(false)
    expect(manualLink({ phone: '+1 (305) 555-0101' }, 'Hi there')).toBe('https://wa.me/13055550101?text=Hi%20there')
  })

  it('counts the opened families', () => {
    expect(manualProgress([{ id: 1 }, { id: 2 }, { id: 3 }], { 1: 'x', 2: null })).toEqual({ done: 1, total: 3, left: 2 })
  })

  it('maps load errors', () => {
    expect(loadErrorKey({ response: { status: 403 } })).toBe('forbidden')
    expect(loadErrorKey({ response: { status: 409, data: { code: 'event_archived' } } })).toBe('archived')
    expect(loadErrorKey(new Error('x'))).toBe('generic')
  })
})


describe('F4 helpers', () => {
  it('allows only save_the_date when the RSVP window is closed (P9)', () => {
    expect(allowedTemplates()).toEqual(['invitation', 'reminder_pending', 'save_the_date'])
    expect(allowedTemplates({ rsvpOpen: false })).toEqual(['save_the_date'])
  })

  it('counts languages and finds the families without an approved template', () => {
    const list = [{ locale: 'es' }, { locale: 'en' }, { locale: 'es' }, {}]
    expect(localeCounts(list)).toEqual([{ locale: 'es', n: 3 }, { locale: 'en', n: 1 }])
    expect(localeCounts([{ locale: 'fr' }, { locale: 'en' }]).map(l => l.locale)).toEqual(['en', 'fr'])
    expect(withoutTemplate(list, { en: { sendable: false }, es: { sendable: true } })).toEqual([{ locale: 'en' }])
    expect(withoutTemplate(list, undefined)).toEqual([])
  })

  it('cuts a list in chunks of 500 by default', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk(Array.from({ length: 501 }, (_, i) => i)).map(c => c.length)).toEqual([500, 1])
    expect(chunk([])).toEqual([])
  })

  it('merges chained batches into one progress', () => {
    expect(mergeBatches(null)).toBeNull()
    expect(mergeBatches([null])).toBeNull()
    const a = { batchId: 'a', startedAt: 't', total: 500, queued: 0, sent: 400, delivered: 50, read: 40, failed: 10, cancelled: 0, done: true, messages: [{ guestId: 1 }] }
    const b = { batchId: 'b', total: 3, queued: 2, sent: 1, done: false }
    const merged = mergeBatches([a, b])
    expect(merged).toMatchObject({ batchId: 'a', batchIds: ['a', 'b'], startedAt: 't', total: 503, queued: 2, sent: 401, delivered: 50, read: 40, failed: 10, done: false })
    expect(merged.messages).toEqual([{ guestId: 1 }])
    expect(mergeBatches([a]).done).toBe(true)
    expect(BATCH_COUNTERS).toEqual(['queued', 'sent', 'failed', 'delivered', 'read'])
  })

  it('computes the progress as everything that left the queue', () => {
    expect(batchProgress({ total: 38, queued: 14 })).toEqual({ processed: 24, total: 38, percent: 63 })
    expect(batchProgress({ total: 0, queued: 0 })).toEqual({ processed: 0, total: 0, percent: 0 })
    expect(batchProgress(null)).toEqual({ processed: 0, total: 0, percent: 0 })
  })

  it('lists the failed messages and how many have an unknown outcome', () => {
    const batch = { messages: [{ status: 'sent' }, { status: 'failed', errorCode: '131026' }, { status: 'failed', errorCode: 'unknown_delivery' }] }
    expect(retryable(batch).messages).toHaveLength(2)
    expect(retryable(batch).unknown).toBe(1)
    expect(retryable(null)).toEqual({ messages: [], unknown: 0 })
  })

  it('polls every 2 s while queued, every 5 s for a minute, then stops', () => {
    expect(pollDelay({ queued: 3 }, 0)).toBe(2000)
    expect(pollDelay({ queued: 0 }, 0)).toBe(5000)
    expect(pollDelay({ queued: 0 }, 59999)).toBe(5000)
    expect(pollDelay({ queued: 0 }, 60000)).toBeNull()
    expect(pollDelay(null)).toBe(5000)
  })

  it('maps the 409 codes of the wizard and delegates the rest', () => {
    const e = (status, code) => ({ response: { status, data: { code } } })
    const fallback = () => 'other'
    expect(wizardSendErrorKey(e(409, 'event_not_published'), fallback)).toBe('notPublished')
    expect(wizardSendErrorKey(e(409, 'rsvp_closed'), fallback)).toBe('rsvpClosed')
    expect(wizardSendErrorKey(e(409, 'event_archived'), fallback)).toBe('archived')
    expect(wizardSendErrorKey(e(409, 'confirmation_required'), fallback)).toBe('confirmationRequired')
    expect(batchProgress({ total: 10, queued: 9, processed: 4 }).processed).toBe(4)
    expect(mergeBatches([{ processed: 2 }, { processed: 3 }]).processed).toBe(5)
    expect(wizardSendErrorKey(e(500, 'x'), fallback)).toBe('other')
    expect(wizardSendErrorKey(null, fallback)).toBe('other')
  })
})
