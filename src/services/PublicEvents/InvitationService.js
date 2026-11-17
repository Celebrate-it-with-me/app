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

/** Requests started before the view exists (see `prefetch`), keyed by what is asked. One use each, short-lived. */
const early = new Map()
const EARLY_TTL_MS = 15_000
const keyOf = ({ slug, code, lang }) => `${slug}/${code}/${lang ?? ''}`

class InvitationService {
  /**
   * Starts the invitation request without waiting for the view's chunk, so both download at the same time. The view's
   * own `get` for the same slug, code and language takes this request over (once); anything else makes its own.
   * @param {{ slug: string, code: string, lang?: string }} params
   */
  prefetch(params) {
    const key = keyOf(params)
    if (early.has(key)) return
    const request = PUBLIC_API.get(path(params.slug, params.code), { params: params.lang ? { lang: params.lang } : {} })
    request.catch(() => {}) // a failure surfaces where it is consumed; never as an unhandled rejection
    early.set(key, request)
    setTimeout(() => early.delete(key), EARLY_TTL_MS)
  }

  /** @param {{ slug: string, code: string, lang?: string }} params */
  async get({ slug, code, lang }) {
    const key = keyOf({ slug, code, lang })
    const started = early.get(key)
    if (started) {
      early.delete(key)
      return started
    }
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
  /**
   * One page (10) of the visible comments, pinned first. The authors are first names only.
   * @param {{ slug: string, code: string, page?: number }} params
   */
  async listComments({ slug, code, page = 1 }) {
    return PUBLIC_API.get(`${path(slug, code)}/comments`, { params: { page } })
  }

  /** @param {{ slug: string, code: string, comment: string }} params  201 { data: item } */
  async postComment({ slug, code, comment }) {
    return PUBLIC_API.post(`${path(slug, code)}/comments`, { comment })
  }
}

export default new InvitationService()
