import { CWM_API } from '@/services/axios'
import { getMock } from './mockLoader'
import { MAX_PAGES } from '../utils/sendWizard'

const base = eventId => `/event/${eventId}`

/**
 * Reads of the send wizard (contract 4.1, 4.2, 4.7). They hang from the `guests` module, so the manual mode works on
 * the free plan too.
 */
class SendWizardService {
  /** Counts, blocks, RSVP window and mode: `{ mode, event, rsvp, totalFamilies, categories, blocked, ... }`. */
  async audience(eventId, template = 'invitation') {
    const data = (await CWM_API.get(`${base(eventId)}/whatsapp/audience`, { params: { template } })).data.data
    const mock = await getMock()
    return mock ? mock.audience(data, template) : data
  }

  /** Every family with its reason and delivery, walked page by page: `[{ id, name, people, phone, status, reason, delivery }]`. */
  async allRecipients(eventId, template = 'invitation') {
    const rows = []
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { data, meta } = (await CWM_API.get(`${base(eventId)}/whatsapp/recipients`, { params: { template, category: 'all', page, per_page: 100 } })).data
      rows.push(...data)
      if (page * (meta?.perPage ?? 100) >= (meta?.total ?? 0)) break
    }
    const mock = await getMock()
    return mock ? mock.recipients(rows, template) : rows
  }

  /** The roster rows, walked page by page: the wa.me link of each family lives only there. */
  async allRoster(eventId) {
    const rows = []
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { data, meta } = (await CWM_API.get(`${base(eventId)}/roster`, { params: { page, perPage: 100 } })).data
      rows.push(...data)
      if (page >= (meta?.lastPage ?? 1)) break
    }
    return rows
  }

  /** Marks a family as opened by hand ("Abierto"). Answers the roster row, whose `delivery.sharedAt` is the moment. */
  async markShared(eventId, guestId) {
    return (await CWM_API.post(`${base(eventId)}/roster/${guestId}/shared`)).data.data
  }

  /** Undoes the mark. Idempotent. */
  async unmarkShared(eventId, guestId) {
    return (await CWM_API.delete(`${base(eventId)}/roster/${guestId}/shared`)).data.data
  }
}

export default new SendWizardService()
