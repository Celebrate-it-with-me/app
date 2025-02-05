import { CWM_API } from './axios'

class SongsService {
  async create({ eventId, platformId, title, artist, album, thumbnailUrl }) {
    return CWM_API.post(`event/${eventId}/suggest-music`, {
      platformId,
      title,
      artist,
      album,
      thumbnailUrl,
    })
  }

  async getSuggestedSongs(eventId) {
    return CWM_API.get(`event/${eventId}/suggest-music`)
  }

  async deleteSong(eventId, songId) {
    return CWM_API.delete(`suggest-music/${songId}`)
  }

  async voteSong({ songId, direction }) {
    return CWM_API.post(`suggest-music/${songId}/vote`, {
      direction: direction
    })
  }
}

export default new SongsService()
