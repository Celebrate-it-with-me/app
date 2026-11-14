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

  /** Revoke someone's access (route exists in the API: `DELETE event/{event}/collaborators/{user}`). */
  async removeCollaborator({ eventId, userId }) {
    return CWM_API.delete(`event/${eventId}/collaborators/${userId}`)
  }

  // The three calls below are the contract the screen expects; the API does not implement them yet.
  async changeRole({ eventId, userId, role }) {
    return CWM_API.patch(`event/${eventId}/collaborators/${userId}`, { role })
  }

  async resendInvite({ eventId, id }) {
    return CWM_API.post(`event/${eventId}/collaborators/invite/${id}/resend`)
  }

  async cancelInvite({ eventId, id }) {
    return CWM_API.delete(`event/${eventId}/collaborators/invite/${id}`)
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

  async acceptInvitation({ id, eventId }) {
    return CWM_API.post(`event/${eventId}/collaborators/invite/${id}/accept`)
  }
}

export default new CollaboratorsService()
