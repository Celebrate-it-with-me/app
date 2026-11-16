import { CWM_API } from '@/services/axios'

const base = eventId => `/event/${eventId}/whatsapp`

/**
 * `VITE_WHATSAPP_MOCK` swaps the API for an in-memory copy of the contract (see whatsappMock.js). Dev only:
 * `import.meta.env.DEV` is a build-time constant, so production bundles drop the dynamic import and the mock chunk.
 */
const getMock = async () => (import.meta.env.DEV && import.meta.env.VITE_WHATSAPP_MOCK ? (await import('./whatsappMock')).mockWhatsapp : null)

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

  /** Re-queues a failed message; answers the Message. */
  async retry(eventId, messageId) {
    const mock = await getMock()
    if (mock) return mock.retry(eventId, messageId)
    return (await CWM_API.post(`${base(eventId)}/messages/${messageId}/retry`)).data.data
  }
}

export default new WhatsappService()
