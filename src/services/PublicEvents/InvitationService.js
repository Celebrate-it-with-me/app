import axios from 'axios'

/**
 * Public invitation API. The event slug and the guest code are the only credentials, so this
 * client carries no cookies, tokens or login redirects (unlike CWM_API).
 */
const PUBLIC_API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + 'api/v1/app',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
})

const path = (slug, code) => `invitation/${encodeURIComponent(slug)}/${encodeURIComponent(code)}`

class InvitationService {
  /** @param {{ slug: string, code: string, lang?: string }} params */
  async get({ slug, code, lang }) {
    return PUBLIC_API.get(path(slug, code), { params: lang ? { lang } : {} })
  }

  /**
   * @param {{ slug: string, code: string, guest: string, companions: Record<number, string>,
   *   names?: Record<number, string>, note?: string }} params
   *   guest: 'attending' | 'not-attending'; companions: { [id]: status }; names: { [id]: name }
   *   (only the ones that changed); note: the guest's message ('' clears it, undefined leaves it).
   */
  async saveRsvp({ slug, code, guest, companions, names = {}, note }) {
    const body = {
      guest: { rsvpStatus: guest },
      companions: Object.entries(companions).map(([id, rsvpStatus]) => ({
        id: Number(id),
        rsvpStatus,
        ...(id in names ? { name: names[id] } : {})
      }))
    }
    if (note !== undefined) body.note = note
    return PUBLIC_API.post(`${path(slug, code)}/rsvp`, body)
  }
}

export default new InvitationService()
