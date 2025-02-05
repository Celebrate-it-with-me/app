import { CWM_API } from './axios'

class SongsService {
  async create({ eventId, spotifyId, title, artist, album, thumbnailUrl }) {
    return CWM_API.post(`event/${eventId}/suggest-music`, {
      spotifyId,
      title,
      artist,
      album,
      thumbnailUrl,
    })
  }
}

export default new SongsService()
