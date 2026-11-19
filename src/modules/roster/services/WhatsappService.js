import { CWM_API } from '@/services/axios'
import { getMock } from './mockLoader'

const base = eventId => `/event/${eventId}/whatsapp`

// `VITE_WHATSAPP_MOCK` swaps the API for an in-memory copy of the contract (see whatsappMock.js). Dev only.

/** Organizer side of the WhatsApp contract (docs/plans/communications-contract.md). */
class WhatsappService {
  /**
   * Queues a batch: `{ batchId, queued, skipped: [{ guestId, guestName, reason }] }`. With `dryRun` nothing is queued
   * and the answer is the real calculation `{ queued, skipped }` (for the recipients preview).
   */
  async send(eventId, { template, audience, guestIds = [], force = false, dryRun = false }) {
    const body = { template, audience, force }
    if (dryRun) body.dry_run = true
    if (audience === 'selected') body.guest_ids = guestIds
    const mock = await getMock()
    if (mock) return mock.send(eventId, body)
    return (await CWM_API.post(`${base(eventId)}/send`, body)).data.data
  }

  /** `{ data: Message[], meta: { page, perPage, total } }`. */
  async messages(eventId, { guestId, status, latestPerGuest = false, page = 1, perPage = 100 } = {}) {
    const params = { page, per_page: perPage }
    if (guestId) params.guest_id = guestId
    if (status) params.status = status
    if (latestPerGuest) params.latest_per_guest = 1
    const mock = await getMock()
    if (mock) return mock.messages(eventId, params)
    return (await CWM_API.get(`${base(eventId)}/messages`, { params })).data
  }

  /** The last message of every guest that has one, as `{ [guestId]: Message }`. */
  async latestByGuest(eventId) {
    const byGuest = {}
    for (let page = 1; page <= 20; page++) {
      const { data, meta } = await this.messages(eventId, { latestPerGuest: true, page, perPage: 100 })
      for (const message of data) if (message.guestId != null) byGuest[message.guestId] = message
      if (page * (meta?.perPage ?? 100) >= (meta?.total ?? 0)) break
    }
    return byGuest
  }

  /** `{ total, queued, sent, delivered, read, failed }`. */
  async summary(eventId) {
    const mock = await getMock()
    if (mock) return mock.summary(eventId)
    return (await CWM_API.get(`${base(eventId)}/summary`)).data.data
  }

  /**
   * ASSUMED FORMAT (contract 4.3, endpoint of atlas-f4, not in develop yet): the message exactly as it will go out.
   * `{ template, locale, category, guest: { id, name }, body, buttons: [{ id, text }], link, sendable }`. It queues
   * nothing and counts no quota. Adjust here (and in whatsappMock.preview) when Atlas reports the real shape.
   */
  async preview(eventId, { template, guestId = null, locale = null }) {
    const body = { template }
    if (guestId != null) body.guest_id = guestId
    if (locale) body.locale = locale
    const mock = await getMock()
    if (mock) return mock.preview(eventId, body)
    return (await CWM_API.post(`${base(eventId)}/preview`, body)).data.data
  }

  /**
   * ASSUMED FORMAT (contract 4.4): progress of one batch.
   * `{ batchId, template, startedAt, total, queued, sent, delivered, read, failed, cancelled, done, messages: [{ guestId,
   * guestName, status, errorCode, errorMessage, messageId }] }`, `messages` paged (`page`, `per_page` <= 100).
   * The counts are read as exclusive per status; "processed" is `total - queued`.
   */
  async batch(eventId, batchId, { page = 1, perPage = 100 } = {}) {
    const mock = await getMock()
    if (mock) return mock.batch(eventId, batchId, { page, per_page: perPage })
    return (await CWM_API.get(`${base(eventId)}/batches/${batchId}`, { params: { page, per_page: perPage } })).data.data
  }

  /** ASSUMED (contract 4.4): the latest batch of the event with `queued > 0` (same shape as `batch`), or `null`. */
  async activeBatch(eventId) {
    const mock = await getMock()
    if (mock) return mock.activeBatch(eventId)
    return (await CWM_API.get(`${base(eventId)}/batches/active`)).data.data ?? null
  }

  /** Re-queues a failed message; answers the Message. */
  async retry(eventId, messageId) {
    const mock = await getMock()
    if (mock) return mock.retry(eventId, messageId)
    return (await CWM_API.post(`${base(eventId)}/messages/${messageId}/retry`)).data.data
  }
}

export default new WhatsappService()
