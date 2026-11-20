import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const api = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))

// ids 1..14: id 7 and 14 are opted out, 3 has no phone, 4 has a phone that is not E.164, ids ending in 5 fail.
const families = Array.from({ length: 14 }, (_, i) => {
  const id = i + 1
  const phone = id === 3 ? null : id === 4 ? '305' : `+1305555${String(1000 + id)}`
  return { id, name: `F${id}`, phone, email: null, status: id % 2 ? 'pending' : 'attending', effectiveLocale: id === 2 ? undefined : 'en', companions: [] }
})
function serve(_url, { params }) {
  const list = params.status ? families.filter(f => f.status === params.status) : families
  const perPage = params.perPage
  return Promise.resolve({ data: { data: list.slice((params.page - 1) * perPage, params.page * perPage), meta: { currentPage: params.page, lastPage: Math.max(1, Math.ceil(list.length / perPage)), total: list.length }, counts: { all: list.length } } })
}

let mock
let WhatsappService
async function load(value) {
  vi.stubEnv('VITE_WHATSAPP_MOCK', value)
  vi.resetModules()
  api.get.mockImplementation(serve)
  mock = await import('../services/whatsappMock')
  WhatsappService = (await import('../services/WhatsappService')).default
}
const rejects = (promise, status, code) => expect(promise).rejects.toMatchObject({ response: { status, data: expect.objectContaining(code ? { code } : {}) } })

beforeEach(() => localStorage.clear())
afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('whatsapp mock: module state and mode', () => {
  it('is off without the variable', async () => {
    await load('')
    expect(mock.mockModuleState()).toBeNull()
  })

  it('reads the module state from the mode, and localStorage overrides the variable', async () => {
    await load('1')
    expect(mock.mockModuleState()).toBe('active')
    localStorage.setItem('cwm.whatsappMock', 'modoff')
    expect(mock.mockModuleState()).toBe('off')
    localStorage.setItem('cwm.whatsappMock', 'modlocked')
    expect(mock.mockModuleState()).toBe('locked')
  })

  it('falls back to the variable when localStorage throws', async () => {
    await load('modoff')
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(mock.mockModuleState()).toBe('off')
    spy.mockRestore()
  })
})

describe('whatsapp mock: send', () => {
  it('queues the eligible families and skips the others with a reason', async () => {
    await load('1')
    const out = await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'all' })
    const reasons = Object.fromEntries(out.skipped.map(s => [s.guestId, s.reason]))
    expect(reasons).toEqual({ 3: 'no_phone', 4: 'invalid_phone', 7: 'opted_out', 14: 'opted_out' })
    expect(out.queued).toBe(10)
    expect(out.batchId).toMatch(/^mock-/)
  })

  it('a dry run counts without queueing anything', async () => {
    await load('1')
    const dry = await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'all', dry_run: true })
    expect(dry).toMatchObject({ queued: 10 })
    expect(dry.batchId).toBeUndefined()
    expect((await mock.mockWhatsapp.summary(1)).total).toBe(0)
  })

  it('the pending audience only reaches families that have not answered, and reminders skip the rest', async () => {
    await load('1')
    const pending = await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'pending', dry_run: true })
    expect(pending.queued).toBe(5) // ids 1,5,9,11,13 (3 and 7 skipped)
    const reminder = await mock.mockWhatsapp.send(1, { template: 'reminder_pending', audience: 'selected', guest_ids: [1, 2], dry_run: true })
    expect(reminder).toEqual({ queued: 1, skipped: [{ guestId: 2, guestName: 'F2', reason: 'already_responded' }] })
  })

  it('validates the selected audience: ids required, at most 500', async () => {
    await load('1')
    await rejects(mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [] }), 422)
    await rejects(mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected' }), 422)
    await rejects(mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: Array.from({ length: 501 }, (_, i) => i) }), 422)
  })

  it('answers 422 no_recipients when nobody can be queued', async () => {
    await load('1')
    await expect(mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [3] })).rejects.toMatchObject({ response: { status: 422, data: { errors: { audience: ['no_recipients'] } } } })
  })

  it('does not repeat the same template within a day unless forced', async () => {
    await load('1')
    const body = { template: 'invitation', audience: 'selected', guest_ids: [1] }
    await mock.mockWhatsapp.send(1, body)
    const again = await mock.mockWhatsapp.send(1, { ...body, dry_run: true })
    expect(again.skipped[0].reason).toBe('recently_sent')
    const forced = await mock.mockWhatsapp.send(1, { ...body, force: true })
    expect(forced.queued).toBe(1)
  })

  it('stops after the quota in partial mode and refuses a real send at the daily limit', async () => {
    await load('partial')
    const out = await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'all' })
    expect(out.queued).toBe(2)
    expect(out.skipped.filter(s => s.reason === 'daily_limit').length).toBeGreaterThan(0)
    await load('dailylimit')
    await rejects(mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'all' }), 429, 'whatsapp_daily_limit')
    expect((await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'all', dry_run: true })).queued).toBe(10)
  })

  it('refuses by mode: locked, unavailable, unapproved template', async () => {
    const body = { template: 'invitation', audience: 'all' }
    await load('locked')
    await rejects(mock.mockWhatsapp.send(1, body), 403, 'module_locked')
    await rejects(mock.mockWhatsapp.messages(1, {}), 403, 'module_locked')
    await load('unavailable')
    await rejects(mock.mockWhatsapp.send(1, body), 409, 'whatsapp_unavailable')
    await expect(mock.mockWhatsapp.summary(1)).resolves.toMatchObject({ total: 0 })
    await load('unapproved')
    await rejects(mock.mockWhatsapp.send(1, body), 409, 'template_not_approved')
  })
})

describe('whatsapp mock: messages over time', () => {
  async function sendAll(now) {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'all' })
  }
  const at = ms => vi.setSystemTime(new Date(Date.UTC(2030, 0, 1) + ms))

  it('moves queued -> sent -> delivered -> read with the clock; ids ending in 5 fail', async () => {
    await load('1')
    await sendAll(new Date(Date.UTC(2030, 0, 1)))
    const byGuest = async () => Object.fromEntries((await mock.mockWhatsapp.messages(1, { per_page: 100 })).data.map(m => [m.guestId, m]))
    expect((await byGuest())[1].status).toBe('queued')
    at(3000)
    let m = await byGuest()
    expect(m[1]).toMatchObject({ status: 'sent', waMessageId: expect.stringContaining('wamid') })
    expect(m[5]).toMatchObject({ status: 'failed', errorCode: '131026' })
    at(7000)
    m = await byGuest()
    expect(m[1].status).toBe('delivered')
    at(13000)
    m = await byGuest()
    expect(m[1].status).toBe('read') // odd id
    expect(m[2].status).toBe('delivered') // even ids never get read
    const summary = await mock.mockWhatsapp.summary(1)
    expect(summary).toMatchObject({ total: 10, failed: 1, queued: 0 })
  })

  it('unknown mode makes failures carry an unknown outcome', async () => {
    await load('unknown')
    await sendAll(new Date(Date.UTC(2030, 0, 1)))
    at(3000)
    const failed = (await mock.mockWhatsapp.messages(1, { status: 'failed' })).data
    expect(failed).toHaveLength(1)
    expect(failed[0].errorCode).toBe('unknown_delivery')
  })

  it('filters by guest, keeps the latest per guest and pages', async () => {
    await load('1')
    await sendAll(new Date(Date.UTC(2030, 0, 1)))
    await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [1], force: true })
    expect((await mock.mockWhatsapp.messages(1, { guest_id: '1' })).data).toHaveLength(2)
    const latest = (await mock.mockWhatsapp.messages(1, { latest_per_guest: 1, per_page: 4 }))
    expect(latest.data).toHaveLength(4)
    expect(latest.meta).toEqual({ page: 1, perPage: 4, total: 10 })
    const second = await mock.mockWhatsapp.messages(1, { latest_per_guest: 1, per_page: 4, page: 2 })
    expect(second.data).toHaveLength(4)
    expect((await mock.mockWhatsapp.messages(1, { per_page: 1000 })).meta.perPage).toBe(100)
    expect((await mock.mockWhatsapp.messages(1, {})).meta.perPage).toBe(15)
    expect((await mock.mockWhatsapp.messages(2, {})).data).toEqual([])
  })

  it('latestByGuest through the service walks the pages and maps messages by guest', async () => {
    await load('1')
    await sendAll(new Date(Date.UTC(2030, 0, 1)))
    const byGuest = await WhatsappService.latestByGuest(1)
    expect(Object.keys(byGuest)).toHaveLength(10)
  })
})

describe('whatsapp mock: retry', () => {
  async function failedMessage() {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2030, 0, 1)))
    await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [5, 1] })
    vi.setSystemTime(new Date(Date.UTC(2030, 0, 1, 0, 0, 3)))
    return (await mock.mockWhatsapp.messages(1, { status: 'failed' })).data[0]
  }

  it('re-queues a failed message and it succeeds this time', async () => {
    await load('1')
    const failed = await failedMessage()
    const out = await mock.mockWhatsapp.retry(1, failed.id)
    expect(out.status).toBe('queued')
    vi.setSystemTime(new Date(Date.UTC(2030, 0, 1, 0, 0, 7)))
    expect((await mock.mockWhatsapp.messages(1, { guest_id: 5 })).data[0].status).toBe('sent')
  })

  it('answers 404 for a missing message and 409 when it did not fail', async () => {
    await load('1')
    const failed = await failedMessage()
    await rejects(mock.mockWhatsapp.retry(1, 999), 404, 'not_found')
    await rejects(mock.mockWhatsapp.retry(2, failed.id), 404, 'not_found')
    const ok = (await mock.mockWhatsapp.messages(1, { guest_id: 1 })).data[0]
    await rejects(mock.mockWhatsapp.retry(1, ok.id), 409, 'not_failed')
  })

  it('refuses at the retry limit and at the daily limit', async () => {
    await load('retrylimit')
    let failed = await failedMessage()
    await rejects(mock.mockWhatsapp.retry(1, failed.id), 409, 'retry_limit')
    vi.useRealTimers()
    await load('dailylimit')
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2030, 0, 1)))
    // The daily limit blocks real sends, so seed a failed message through the dry-run-free path of another mode.
    localStorage.setItem('cwm.whatsappMock', '1')
    failed = await failedMessage()
    localStorage.setItem('cwm.whatsappMock', 'dailylimit')
    await rejects(mock.mockWhatsapp.retry(1, failed.id), 429, 'whatsapp_daily_limit')
  })

  it('works through the service when the mock is on', async () => {
    await load('1')
    const failed = await failedMessage()
    expect((await WhatsappService.retry(1, failed.id)).status).toBe('queued')
    expect((await WhatsappService.summary(1)).total).toBe(2)
    expect((await WhatsappService.send(1, { template: 'invitation', audience: 'selected', guestIds: [2], dryRun: true })).queued).toBe(1)
  })
})

describe('whatsapp mock: batches, preview and audience (F4)', () => {
  it('stamps a batch id on a send and reads it back with exclusive counts', async () => {
    vi.useFakeTimers()
    await load('1')
    const sent = await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [1, 2, 6, 5] })
    const first = await mock.mockWhatsapp.batch(1, sent.batchId)
    expect(first).toMatchObject({ batchId: sent.batchId, template: 'invitation', total: 4, queued: 4, done: false })
    expect(first.messages.map(m => m.guestId)).toEqual([1, 2, 5, 6])
    vi.advanceTimersByTime(20000)
    const later = await mock.mockWhatsapp.batch(1, sent.batchId)
    expect(later).toMatchObject({ queued: 0, failed: 1, done: true })
    expect(later.sent + later.delivered + later.read + later.failed).toBe(4)
    const page = await mock.mockWhatsapp.batch(1, sent.batchId, { page: 2, per_page: 3 })
    expect(page.messages).toHaveLength(1)
  })

  it('answers 404 for an unknown batch and finds the active one', async () => {
    vi.useFakeTimers()
    await load('1')
    await rejects(mock.mockWhatsapp.batch(1, 'nope'), 404)
    expect(await mock.mockWhatsapp.activeBatch(1)).toBeNull()
    const sent = await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [1, 2] })
    expect((await mock.mockWhatsapp.activeBatch(1)).batchId).toBe(sent.batchId)
    vi.advanceTimersByTime(20000)
    expect(await mock.mockWhatsapp.activeBatch(1)).toBeNull()
  })

  it('rolls a batch out slowly in slow mode', async () => {
    vi.useFakeTimers()
    await load('slow')
    const sent = await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [1, 2, 6, 8] })
    vi.advanceTimersByTime(3500)
    const batch = await mock.mockWhatsapp.batch(1, sent.batchId)
    expect(batch.queued).toBeGreaterThan(0)
    expect(batch.queued).toBeLessThan(4)
  })

  it('renders a preview with the name of the guest, in her language, with buttons', async () => {
    await load('1')
    const es = await mock.mockWhatsapp.preview(1, { template: 'invitation', guest_id: 1, locale: 'es' })
    expect(es.body).toContain('F1')
    expect(es.buttons.map(b => b.id)).toEqual(['yes', 'no'])
    const en = await mock.mockWhatsapp.preview(1, { template: 'reminder_pending', guest_id: 1, locale: 'en' })
    expect(en.body).toMatch(/Will you join us/)
    expect(en.buttons[0].text).toMatch(/Yes/)
    const save = await mock.mockWhatsapp.preview(1, { template: 'save_the_date', guest_id: 1 })
    expect(save.buttons).toEqual([])
    expect(save.locale).toBe('en') // F1 prefers English in the fixture
    const first = await mock.mockWhatsapp.preview(1, { template: 'invitation' })
    expect(first.guest.id).toBe(1)
    expect(await mock.mockWhatsapp.preview(1, { template: 'invitation', guest_id: 2 })).toMatchObject({ locale: 'es', sendable: true })
  })

  it('previews fail like the contract: 404 unknown guest, 409 template not approved, 403 locked', async () => {
    await load('1')
    await rejects(mock.mockWhatsapp.preview(1, { template: 'invitation', guest_id: 999 }), 404)
    await load('noen')
    await rejects(mock.mockWhatsapp.preview(1, { template: 'invitation', guest_id: 1, locale: 'en' }), 409, 'template_not_approved')
    await load('unapproved')
    await rejects(mock.mockWhatsapp.preview(1, { template: 'invitation', guest_id: 2 }), 409, 'template_not_approved')
    await load('locked')
    await rejects(mock.mockWhatsapp.preview(1, { template: 'invitation' }), 403, 'module_locked')
  })

  it('patches the real audience: automatic on, dev scenarios applied', async () => {
    await load('1')
    const real = { mode: { automatic: false, reason: 'module_off' }, event: { published: true }, rsvp: { isOpen: true } }
    expect(mock.mockWhatsapp.audience(real)).toMatchObject({ mode: { automatic: true, reason: null }, event: { published: true }, rsvp: { isOpen: true }, templates: { es: { sendable: true }, en: { sendable: true } } })
    await load('unpublished')
    expect(mock.mockWhatsapp.audience(real).event.published).toBe(false)
    await load('rsvpclosed')
    expect(mock.mockWhatsapp.audience(real).rsvp.isOpen).toBe(false)
    await load('noen')
    expect(mock.mockWhatsapp.audience(real).templates.en.sendable).toBe(false)
    await load('modlocked')
    expect(mock.mockWhatsapp.audience(real).mode).toEqual({ automatic: false, reason: 'module_locked' })
    await load('modoff')
    expect(mock.mockWhatsapp.audience({ event: {}, rsvp: {} }).mode.reason).toBe('module_off')
    expect(mock.mockWhatsapp.audience({ event: {}, rsvp: {} }).event.published).toBe(true)
  })

  it('reaches the batch endpoints and the audience through the services when the mock is on', async () => {
    await load('1')
    const sent = await WhatsappService.send(1, { template: 'invitation', audience: 'selected', guestIds: [1] })
    expect((await WhatsappService.batch(1, sent.batchId)).total).toBe(1)
    expect((await WhatsappService.activeBatch(1)).batchId).toBe(sent.batchId)
    expect((await WhatsappService.preview(1, { template: 'invitation', guestId: 2 })).guest.id).toBe(2)
    const { default: wizardService } = await import('../services/SendWizardService')
    api.get.mockImplementation((url, options) => (url.endsWith('/audience') ? Promise.resolve({ data: { data: { mode: { automatic: false }, event: {}, rsvp: {} } } }) : serve(url, options)))
    expect((await wizardService.audience(1)).mode.automatic).toBe(true)
  })
})

describe('whatsapp mock: link card and holds', () => {
  it('fills linkPreview in both languages and by template', async () => {
    await load('1')
    const es = await mock.mockWhatsapp.preview(1, { template: 'invitation', guest_id: 2, locale: 'es' })
    expect(es.linkPreview).toMatchObject({ title: 'F2, estás invitado/a a Los XV de Valentina', imageWidth: null, imageHeight: null })
    expect(es.linkPreview.image).toMatch(/\/og-default\.png$/)
    expect(es.linkPreview.description).toMatch(/Abre tu invitación/)
    const en = await mock.mockWhatsapp.preview(1, { template: 'invitation', guest_id: 2, locale: 'en' })
    expect(en.linkPreview.title).toBe("F2, you are invited to Valentina's Quince")
    const std = await mock.mockWhatsapp.preview(1, { template: 'save_the_date', guest_id: 2, locale: 'es' })
    expect(std.linkPreview.title).toBe('Guarda la fecha: Los XV de Valentina')
    expect((await mock.mockWhatsapp.preview(1, { template: 'save_the_date', guest_id: 2, locale: 'en' })).linkPreview.title).toMatch(/Save the date/)
  })

  it('has the nolink and brokenimg scenarios', async () => {
    await load('nolink')
    expect((await mock.mockWhatsapp.preview(1, { template: 'invitation', guest_id: 2 })).linkPreview).toBeNull()
    await load('brokenimg')
    expect((await mock.mockWhatsapp.preview(1, { template: 'invitation', guest_id: 2 })).linkPreview.image).toMatch(/missing-cover/)
  })

  it('marks recently_sent and reminder_limit in the limits scenario only', async () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, reason: i === 0 ? 'opted_out' : null }))
    await load('1')
    expect(mock.mockWhatsapp.recipients(rows)).toBe(rows)
    await load('limits')
    expect(mock.mockWhatsapp.recipients(rows).map(r => r.reason).filter(Boolean)).toEqual(['opted_out', 'recently_sent'])
    expect(mock.mockWhatsapp.recipients(rows, 'reminder_pending').map(r => r.reason).filter(Boolean)).toEqual(['opted_out', 'reminder_limit', 'recently_sent'])
    expect(mock.mockWhatsapp.audience({ event: {}, rsvp: {}, blocked: { opted_out: 1 } }).blocked).toEqual({ opted_out: 1, recently_sent: 2 })
    expect(mock.mockWhatsapp.audience({ event: {}, rsvp: {}, blocked: {} }, 'reminder_pending').blocked).toEqual({ reminder_limit: 3, recently_sent: 1 })
    await load('1')
    expect(mock.mockWhatsapp.audience({ event: {}, rsvp: {}, blocked: { a: 1 } }).blocked).toEqual({ a: 1 })
  })

  it('applies the holds through the wizard service', async () => {
    await load('limits')
    const { default: wizardService } = await import('../services/SendWizardService')
    api.get.mockImplementation(() => Promise.resolve({ data: { data: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 })), meta: { perPage: 100, total: 12 } } }))
    const rows = await wizardService.allRecipients(1, 'reminder_pending')
    expect(rows.filter(r => r.reason === 'reminder_limit')).toHaveLength(1)
  })
})
