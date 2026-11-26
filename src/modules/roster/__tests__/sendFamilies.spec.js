import { describe, it, expect, vi, beforeEach } from 'vitest'

const svc = vi.hoisted(() => ({ audience: vi.fn(), allRecipients: vi.fn(), allRoster: vi.fn() }))
vi.mock('../services/SendWizardService', () => ({ default: svc }))
import { effectiveModeOf, loadSendFamilies, sendCounts, wizardModeOf } from '../services/sendFamilies'

const rec = (id, extra = {}) => ({ id, name: `Familia ${id}`, people: 2, phone: '+13055550101', status: 'pending', reason: null, delivery: { state: 'none' }, ...extra })
const row = (id, extra = {}) => ({ id, phone: '+13055550101', link: `https://q.test/i/xv/${id}`, ...extra })
const info = (extra = {}) => ({ event: { published: true, archived: false }, rsvp: { isOpen: true }, mode: { automatic: true, reason: null }, blocked: {}, ...extra })

function serve({ recipients, audience = info(), reminderAudience = null, reminders = [] }) {
  svc.audience.mockImplementation(async (_id, template) => (template === 'reminder_pending' ? (reminderAudience ?? audience) : audience))
  svc.allRecipients.mockImplementation(async (_id, template) => (template === 'reminder_pending' ? reminders : recipients))
  svc.allRoster.mockResolvedValue(recipients.map(r => row(r.id, { phone: r.phone })))
}

beforeEach(() => Object.values(svc).forEach(fn => fn.mockReset()))

describe('wizardModeOf / effectiveModeOf', () => {
  it('opens automatic unless the WhatsApp module is off or locked (no module list means automatic, as the roster does)', () => {
    expect(wizardModeOf('active')).toBe('automatic')
    expect(wizardModeOf(null)).toBe('automatic')
    expect(wizardModeOf('off')).toBe('manual')
    expect(wizardModeOf('locked')).toBe('manual')
  })
  it('falls back to manual only when the API says the automatic send is not available', () => {
    expect(effectiveModeOf('automatic', { mode: { automatic: false } })).toBe('manual')
    expect(effectiveModeOf('automatic', { mode: { automatic: true } })).toBe('automatic')
    expect(effectiveModeOf('automatic', null)).toBe('automatic')
    expect(effectiveModeOf('manual', { mode: { automatic: true } })).toBe('manual')
  })
})

describe('loadSendFamilies', () => {
  it('reads the audience, recipients and roster of the event and merges them', async () => {
    serve({ recipients: [rec(1), rec(2, { phone: '' })] })
    const { info: read, families } = await loadSendFamilies(7, 'manual')
    expect(read.rsvp.isOpen).toBe(true)
    expect(families.map(f => [f.id, f.phone, f.link])).toEqual([[1, '+13055550101', 'https://q.test/i/xv/1'], [2, '', 'https://q.test/i/xv/2']])
    expect(svc.audience).toHaveBeenCalledWith(7, 'invitation')
    expect(svc.audience).toHaveBeenCalledWith(7, 'reminder_pending')
    expect(svc.allRecipients).toHaveBeenCalledTimes(1)
  })
  it('in automatic mode reads the reminders too when the API holds some back, and keeps going if that read fails', async () => {
    const recipients = [rec(1, { delivery: { state: 'delivered' } })]
    serve({ recipients, reminderAudience: info({ blocked: { reminder_limit: 1 } }), reminders: [{ id: 1, reason: 'reminder_limit' }] })
    expect((await loadSendFamilies(7, 'automatic')).families[0].reminderReason).toBe('reminder_limit')
    expect(svc.allRecipients).toHaveBeenCalledWith(7, 'reminder_pending')

    svc.allRecipients.mockImplementation(async (_id, template) => (template === 'reminder_pending' ? Promise.reject(new Error('x')) : recipients))
    expect((await loadSendFamilies(7, 'automatic')).families[0].reminderReason).toBeNull()
  })
  it('never reads the reminders in manual mode, and survives a failed reminders audience', async () => {
    serve({ recipients: [rec(1)], reminderAudience: info({ blocked: { recently_sent: 2 } }) })
    await loadSendFamilies(7, 'manual')
    expect(svc.allRecipients).toHaveBeenCalledTimes(1)
    svc.audience.mockImplementation(async (_id, template) => (template === 'reminder_pending' ? Promise.reject(new Error('x')) : info()))
    expect((await loadSendFamilies(7, 'automatic')).families).toHaveLength(1)
  })
  it('fails when one of the main reads fails (the caller hides its button)', async () => {
    serve({ recipients: [rec(1)] })
    svc.allRoster.mockRejectedValue(new Error('500'))
    await expect(loadSendFamilies(7, 'manual')).rejects.toThrow('500')
  })
})

describe('sendCounts', () => {
  it('nobody got the invitation yet: no reminders, every pending family is on the first-send card', async () => {
    serve({ recipients: [rec(1), rec(2), rec(3, { status: 'attending' })] })
    expect(await sendCounts(7, 'automatic')).toEqual({ unsent: 3, pending: 0, all: 3, pendingUnsent: 2, rsvpOpen: true, archived: false })
  })
  it('counts as pending only families that got something and can get a reminder', async () => {
    serve({
      recipients: [
        rec(1, { delivery: { state: 'delivered' } }),
        rec(2, { delivery: { state: 'read' } }),
        rec(3, { delivery: { state: 'failed' } }),
        rec(4, { delivery: { state: 'sent' }, status: 'attending' }),
        rec(5, { delivery: { state: 'sent' }, reason: 'opted_out' })
      ]
    })
    const counts = await sendCounts(7, 'automatic')
    expect(counts.pending).toBe(2)
    expect(counts.pendingUnsent).toBe(1)
  })
  it('follows the mode the wizard really opens in (a manual share counts as sent; an automatic send that is off falls back to manual)', async () => {
    const recipients = [rec(1, { delivery: { state: 'none', sharedAt: '2026-11-20T10:00:00Z' } }), rec(2, { phone: '' })]
    serve({ recipients, audience: info({ mode: { automatic: false, reason: 'module_off' } }) })
    // Manual: family 2 has no phone but wa.me still works, so it is on the first-send card.
    expect(await sendCounts(7, 'automatic')).toMatchObject({ pending: 1, pendingUnsent: 1 })
    serve({ recipients })
    // Automatic: family 2 is blocked (no phone).
    expect(await sendCounts(7, 'automatic')).toMatchObject({ pending: 1, pendingUnsent: 0 })
  })
  it('says when the answers are closed or the event is archived', async () => {
    serve({ recipients: [rec(1)], audience: info({ rsvp: { isOpen: false }, event: { archived: true } }) })
    expect(await sendCounts(7, 'manual')).toMatchObject({ rsvpOpen: false, archived: true })
  })
})
