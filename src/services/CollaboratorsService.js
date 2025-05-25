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

}

export default new CollaboratorsService()
