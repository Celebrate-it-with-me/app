import { CWM_API } from '@/services/axios'

/**
 * Search songs on Spotify through our API (the API holds the Spotify credentials).
 * GET /event/{eventId}/suggest-music/spotify-search?q=&limit=
 * Resolves with the `data` body: { tracks: { items: [...] } } (same shape Spotify returns).
 * @param {string} query - Search query
 * @param {number} limit - Number of results (default: 5)
 * @param {number|string} eventId - Active event id
 */
async function searchSongs(query, limit = 5, eventId) {
  const response = await CWM_API.get(`event/${eventId}/suggest-music/spotify-search`, {
    params: { q: query, limit }
  })

  return response?.data?.data
}

export default {
  searchSongs
}
