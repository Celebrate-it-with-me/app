import { CWM_API } from '../axios'

class SuggestedMusicPublicService {
  async getAvailableVotes(eventId, accessCode) {
    return CWM_API.get(`template/event/${eventId}/suggest-music/votes/available`, {
      params: {
        accessCode
      }
    })
  }

  async getUserVote(eventId, songId, accessCode) {
    return CWM_API.get(`template/event/${eventId}/suggest-music/${songId}/vote`, {
      params: {
        accessCode
      }
    })
  }

  async vote(eventId, songId, accessCode, direction) {
    return CWM_API.post(`template/event/${eventId}/suggest-music/${songId}/vote`, {
      accessCode,
      direction
    })
  }
}

export default new SuggestedMusicPublicService()
