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
   * Access screen of a link without a guest code. Always 200 `{ data: { organizer_name: string|null } }`
   * (null for an unknown slug or an unpublished event: the API does not say which).
   * @param {string} slug
   */
  async getAccess(slug) {
    return PUBLIC_API.get(`invitation/${encodeURIComponent(slug)}/access`)
  }

  /**
   * 200 `{ data: { valid: true, code } }`; 422 `invalid_code` for any wrong, unknown or unpublished case; 429 too many attempts.
   * @param {string} slug
   * @param {string} code
   */
  async verifyAccess(slug, code) {
    return PUBLIC_API.post(`invitation/${encodeURIComponent(slug)}/access/verify`, { code })
  }

  /**
   * @param {{ slug: string, code: string, guest: string, companions: Record<number, string>,
   *   names?: Record<number, string>, note?: string }} params
   *   guest: 'attending' | 'not-attending'; companions: { [id]: status }; names: { [id]: name }
   *   (only the ones that changed); note: the guest's message ('' clears it, undefined leaves it).
   */
  async saveRsvp({ slug, code, guest, companions, names = {}, note, menu }) {
    const body = {
      guest: { rsvpStatus: guest },
      companions: Object.entries(companions).map(([id, rsvpStatus]) => ({
        id: Number(id),
        rsvpStatus,
        ...(id in names ? { name: names[id] } : {}),
        ...(menu?.companions && id in menu.companions ? { menuItemIds: menu.companions[id] } : {})
      }))
    }
    if (note !== undefined) body.note = note
    if (menu?.guest) body.guest.menuItemIds = menu.guest
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

  /**
   * One page of the event's suggested songs. No ids or names of other guests: only `votedByMe` / `suggestedByMe`.
   * @param {{ slug: string, code: string, orderBy?: 'popular'|'recent', page?: number }} params
   * 200 { data: [{ id, title, artist, thumbnailUrl, previewUrl, votes, votedByMe, suggestedByMe }], meta }
   */
  async listSongs({ slug, code, orderBy = 'popular', page = 1 }) {
    return PUBLIC_API.get(`${path(slug, code)}/songs`, { params: { orderBy, page } })
  }

  /** Spotify search for guests (`q` <= 100, `limit` 1-10). 503 spotify_unavailable when Spotify is down. */
  async searchSongs({ slug, code, q, limit = 8 }) {
    return PUBLIC_API.get(`${path(slug, code)}/songs/search`, { params: { q, limit } })
  }

  /** @param {{ slug: string, code: string, song: { platformId: string, title: string, artist: string, album?: string, thumbnailUrl?: string, previewUrl?: string } }} params  201 { data: item } */
  async suggestSong({ slug, code, song }) {
    return PUBLIC_API.post(`${path(slug, code)}/songs`, song)
  }

  /** Only the guest's own suggestion (404 otherwise). 204. */
  async removeSong({ slug, code, id }) {
    return PUBLIC_API.delete(`${path(slug, code)}/songs/${encodeURIComponent(id)}`)
  }

  /** @param {{ slug: string, code: string, id: number|string, vote: boolean }} params  200 { data: item } (vote: true adds, false removes) */
  async voteSong({ slug, code, id, vote }) {
    return PUBLIC_API.post(`${path(slug, code)}/songs/${encodeURIComponent(id)}/vote`, { vote })
  }
}

export default new InvitationService()
