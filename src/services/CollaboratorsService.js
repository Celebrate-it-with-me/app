import { CWM_API } from './axios'

class CollaboratorsService {

  async loadCollaborators({ eventId }) {
    return CWM_API.get(`event/${eventId}/collaborators`)
  }

  async inviteCollaborator({ eventId, email, role }) {
    return CWM_API.post(`event/${eventId}/collaborators`, {
      email,
      role
    })
  }

  async checkInviteToken({ token, eventId }) {
    return CWM_API.get(`event/${eventId}/collaborators/invite/${token}`)
  }

  async declineInvite({ token, eventId }) {
    return CWM_API.post(`event/${eventId}/collaborators/invite/${token}/decline`)
  }

  async checkToken({ tokens }) {
    return CWM_API.get(`collaborators/check-tokens`, {
      params: {
        tokens: tokens
      }
    })
  }

}

export default new CollaboratorsService()
