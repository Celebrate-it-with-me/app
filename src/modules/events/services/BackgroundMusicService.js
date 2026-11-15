import { CWM_API } from '@/services/axios'

const base = eventId => `event/${eventId}/background-music`

class BackgroundMusicService {
  /** `{ id, eventId, songUrl, title, mimeType, sizeBytes }` or null when the event has no song. */
  async get(eventId) {
    return (await CWM_API.get(base(eventId))).data.data
  }

  /** Creates the song, or replaces the one the event has (the API answers 201 or 200). */
  async upload(eventId, file, title = '') {
    const body = new FormData()
    body.append('songFile', file)
    if (title.trim()) body.append('title', title.trim())
    return (await CWM_API.post(base(eventId), body, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data
  }

  async remove(eventId) {
    await CWM_API.delete(base(eventId))
  }
}

export default new BackgroundMusicService()
