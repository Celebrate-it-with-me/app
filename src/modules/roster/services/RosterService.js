import { CWM_API } from '@/services/axios'

const base = eventId => `/event/${eventId}`

/** The name the server gave the file (Content-Disposition), or a fallback. */
function fileOf(response, fallback) {
  const match = /filename="?([^";]+)"?/i.exec(response.headers?.['content-disposition'] ?? '')
  return { blob: response.data, filename: match ? match[1] : fallback }
}

class RosterService {
  /** `{ data, meta, counts }`: families of the page, and the people counters of the whole event. */
  async list(eventId, { status, search, page = 1, perPage = 15 } = {}) {
    const params = { page, perPage }
    if (status && status !== 'all') params.status = status
    if (search) params.search = search
    return (await CWM_API.get(`${base(eventId)}/roster`, { params })).data
  }

  async update(eventId, id, person) {
    return (await CWM_API.put(`${base(eventId)}/roster/${id}`, person)).data.data
  }

  async addCompanion(eventId, guestId, person) {
    return (await CWM_API.post(`${base(eventId)}/roster/${guestId}/companions`, person)).data.data
  }

  async remove(eventId, id) {
    return (await CWM_API.delete(`${base(eventId)}/roster/${id}`)).data.data
  }

  /** A new main guest, with named companions. */
  async create(eventId, { guest, companions }) {
    return (
      await CWM_API.post(`${base(eventId)}/guests`, {
        guest,
        namedCompanions: companions,
        unnamedCompanions: 0
      })
    ).data.data
  }

  /** The organizer answers for the family (a phone call, a message). */
  async confirm(eventId, guestId, { status, companions }) {
    return (
      await CWM_API.put(`${base(eventId)}/organizer/rsvp/${guestId}/confirm`, {
        guest: { rsvp_status: status },
        companions: companions.map(c => ({ id: c.id, rsvp_status: c.status }))
      })
    ).data
  }

  /** The CSV template, in the event's language (a Blob). */
  async importTemplate(eventId) {
    return (await CWM_API.get(`${base(eventId)}/roster/import/template`, { responseType: 'blob' })).data
  }

  /** Reads the file and answers `{ rows, summary, limit }` without saving anything. */
  async importPreview(eventId, file) {
    const body = new FormData()
    body.append('file', file)
    return (await CWM_API.post(`${base(eventId)}/roster/import/preview`, body, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data
  }

  /** Saves the kept rows: `{ created, families, skipped }`. */
  async importGuests(eventId, rows) {
    return (await CWM_API.post(`${base(eventId)}/roster/import`, { rows })).data.data
  }

  /** `{ status, search }` are the tab and search of the screen; the file comes back as `{ blob, filename }`. */
  async download(eventId, { status, search, locale } = {}) {
    const params = { locale }
    if (status && status !== 'all') params.status = status
    if (search) params.search = search
    return fileOf(await CWM_API.get(`${base(eventId)}/roster/export`, { params, responseType: 'blob' }), 'invitados.xlsx')
  }

  /** The list for the venue: confirmed people (or `scope: 'all'`), with table and menu when those modules are active. */
  async downloadVenue(eventId, { scope = 'attending', locale } = {}) {
    return fileOf(await CWM_API.get(`${base(eventId)}/roster/export/venue`, { params: { scope, locale }, responseType: 'blob' }), 'salon.xlsx')
  }

  /** `locale`: 'es', 'en', or null to follow the event. Answers the updated family. */
  async setLocale(eventId, id, locale) {
    return (await CWM_API.patch(`${base(eventId)}/roster/${id}/locale`, { locale })).data.data
  }

  async revert(eventId, guestId) {
    await CWM_API.post(`${base(eventId)}/rsvp/guests/${guestId}/revert-confirmation`)
  }
}

export default new RosterService()
