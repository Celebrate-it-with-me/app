import { describe, it, expect, vi, beforeEach } from 'vitest'
import { whatsappModuleState, sendErrorKey, retryErrorKey, isUnknownDelivery, groupSkipped, guestWhatsappState, MESSAGE_VIEW, SKIP_REASONS } from '../utils/whatsapp'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: { get, post } }))
import WhatsappService from '../services/WhatsappService'

const err = (status, data) => ({ response: { status, data } })

describe('whatsapp helpers', () => {
  it('reads the module state of the event', () => {
    expect(whatsappModuleState({})).toBeNull()
    expect(whatsappModuleState({ modules: [] })).toBe('off')
    expect(whatsappModuleState({ modules: [{ key: 'whatsapp', state: 'locked' }] })).toBe('locked')
    expect(whatsappModuleState({ modules: [{ key: 'whatsapp', state: 'active' }] })).toBe('active')
  })

  it('maps every contract error to a message key', () => {
    expect(sendErrorKey(err(403, { code: 'module_locked' }))).toBe('locked')
    expect(sendErrorKey(err(409, { code: 'whatsapp_unavailable' }))).toBe('unavailable')
    expect(sendErrorKey(err(409, { code: 'template_not_approved' }))).toBe('templateNotApproved')
    expect(sendErrorKey(err(422, { errors: { audience: ['no_recipients'] } }))).toBe('noRecipients')
    expect(sendErrorKey(err(422, { errors: { guest_ids: ['too_many'] } }))).toBe('tooMany')
    expect(sendErrorKey(err(422, { errors: { guest_ids: ['required'] } }))).toBe('selectSome')
    expect(sendErrorKey(err(500, {}))).toBe('generic')
  })

  it('maps the audit errors: daily limit, throttling, retry limit', () => {
    expect(sendErrorKey(err(429, { code: 'whatsapp_daily_limit' }))).toBe('dailyLimit')
    expect(sendErrorKey(err(429, {}))).toBe('tooManyRequests')
    expect(retryErrorKey(err(429, { code: 'whatsapp_daily_limit' }))).toBe('dailyLimit')
    expect(retryErrorKey(err(409, { code: 'retry_limit' }))).toBe('retryLimit')
    expect(retryErrorKey(err(409, { code: 'not_failed' }))).toBe('notFailed')
    expect(retryErrorKey(err(500, {}))).toBe('generic')
    expect(SKIP_REASONS).toContain('daily_limit')
    expect(groupSkipped([{ guestId: 1, guestName: 'Ana', reason: 'daily_limit' }])).toEqual([{ reason: 'daily_limit', guests: ['Ana'] }])
  })

  it('recognises a failed message whose outcome is unknown', () => {
    expect(isUnknownDelivery({ status: 'failed', errorCode: 'unknown_delivery' })).toBe(true)
    expect(isUnknownDelivery({ status: 'failed', errorCode: '131026' })).toBe(false)
    expect(isUnknownDelivery(null)).toBe(false)
  })

  it('groups the skipped guests by reason in a fixed order', () => {
    const groups = groupSkipped([
      { guestId: 1, guestName: 'Ana', reason: 'opted_out' },
      { guestId: 2, guestName: 'Luis', reason: 'no_phone' },
      { guestId: 3, guestName: 'Eva', reason: 'opted_out' }
    ])
    expect(groups).toEqual([
      { reason: 'no_phone', guests: ['Luis'] },
      { reason: 'opted_out', guests: ['Ana', 'Eva'] }
    ])
  })

  it('draws every status with an icon', () => {
    for (const key of ['queued', 'sent', 'delivered', 'read', 'failed', 'no_phone', 'opted_out']) expect(MESSAGE_VIEW[key].icon).toBeTruthy()
    expect(SKIP_REASONS).toHaveLength(6)
  })

  it('shows the last message, or why a guest cannot get one', () => {
    const message = { status: 'read' }
    expect(guestWhatsappState({ phone: '+1' }, message)).toEqual({ key: 'read', message })
    expect(guestWhatsappState({ phone: null }, undefined)).toEqual({ key: 'no_phone', message: null })
    expect(guestWhatsappState({ phone: '+1', whatsappOptedOut: true }, message).key).toBe('opted_out')
    expect(guestWhatsappState({ phone: '+1' }, undefined)).toBeNull()
  })
})

describe('WhatsappService', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
  })

  it('posts snake_case bodies and unwraps data', async () => {
    post.mockResolvedValue({ data: { data: { batchId: 'b', queued: 2, skipped: [] } } })
    const result = await WhatsappService.send(7, { template: 'invitation', audience: 'selected', guestIds: [1, 2] })
    expect(post).toHaveBeenCalledWith('/event/7/whatsapp/send', { template: 'invitation', audience: 'selected', force: false, guest_ids: [1, 2] })
    expect(result.queued).toBe(2)
  })

  it('asks for a dry run to preview the recipients', async () => {
    post.mockResolvedValue({ data: { data: { queued: 5, skipped: [] } } })
    const result = await WhatsappService.send(7, { template: 'invitation', audience: 'all', dryRun: true })
    expect(post.mock.calls[0][1]).toEqual({ template: 'invitation', audience: 'all', force: false, dry_run: true })
    expect(result.queued).toBe(5)
  })

  it('does not send guest_ids for other audiences', async () => {
    post.mockResolvedValue({ data: { data: {} } })
    await WhatsappService.send(7, { template: 'reminder_pending', audience: 'pending', guestIds: [1] })
    expect(post.mock.calls[0][1]).toEqual({ template: 'reminder_pending', audience: 'pending', force: false })
  })

  it('asks for the latest message per guest and pages through all of them', async () => {
    get.mockResolvedValueOnce({ data: { data: [{ guestId: 1, status: 'sent' }], meta: { page: 1, perPage: 1, total: 2 } } })
    get.mockResolvedValueOnce({ data: { data: [{ guestId: 2, status: 'read' }], meta: { page: 2, perPage: 1, total: 2 } } })
    const byGuest = await WhatsappService.latestByGuest(7)
    expect(get.mock.calls[0][1].params).toMatchObject({ latest_per_guest: 1, page: 1 })
    expect(Object.keys(byGuest)).toEqual(['1', '2'])
  })

  it('reads the summary and retries a message', async () => {
    get.mockResolvedValue({ data: { data: { total: 3, queued: 0, sent: 1, delivered: 1, read: 1, failed: 0 } } })
    expect((await WhatsappService.summary(7)).total).toBe(3)
    post.mockResolvedValue({ data: { data: { id: 9, status: 'queued' } } })
    await WhatsappService.retry(7, 9)
    expect(post).toHaveBeenCalledWith('/event/7/whatsapp/messages/9/retry')
  })

  it('asks for the real message of a template (preview, contract 4.3)', async () => {
    post.mockResolvedValue({ data: { data: { body: 'Hola', buttons: [] } } })
    expect((await WhatsappService.preview(7, { template: 'invitation', guestId: 3, locale: 'en' })).body).toBe('Hola')
    expect(post).toHaveBeenCalledWith('/event/7/whatsapp/preview', { template: 'invitation', guest_id: 3, locale: 'en' })
    await WhatsappService.preview(7, { template: 'save_the_date' })
    expect(post).toHaveBeenLastCalledWith('/event/7/whatsapp/preview', { template: 'save_the_date' })
  })

  it('reads a batch with its page of messages, and the active batch (contract 4.4)', async () => {
    get.mockResolvedValue({ data: { data: { batchId: 'b1', total: 2 } } })
    expect((await WhatsappService.batch(7, 'b1')).total).toBe(2)
    expect(get).toHaveBeenCalledWith('/event/7/whatsapp/batches/b1', { params: { page: 1, per_page: 100 } })
    await WhatsappService.batch(7, 'b1', { page: 2, perPage: 50 })
    expect(get).toHaveBeenLastCalledWith('/event/7/whatsapp/batches/b1', { params: { page: 2, per_page: 50 } })
    expect((await WhatsappService.activeBatch(7)).batchId).toBe('b1')
    expect(get).toHaveBeenLastCalledWith('/event/7/whatsapp/batches/active')
    get.mockResolvedValue({ data: { data: null } })
    expect(await WhatsappService.activeBatch(7)).toBeNull()
  })
})
