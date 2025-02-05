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
}

export default new SongsService()
