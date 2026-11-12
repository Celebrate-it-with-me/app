import { CWM_API } from '@/services/axios'

const base = eventId => `/event/${eventId}/timeline`

class TimelineService {
  async list(eventId) {
    return (await CWM_API.get(base(eventId))).data.data
  }

  async create(eventId, moment) {
    return (await CWM_API.post(base(eventId), moment)).data.data
  }

  async update(eventId, id, moment) {
    return (await CWM_API.put(`${base(eventId)}/${id}`, moment)).data.data
  }

  async remove(eventId, id) {
    await CWM_API.delete(`${base(eventId)}/${id}`)
  }

  /** Fills an empty program with the typical one for the event type. */
  async typical(eventId) {
    return (await CWM_API.post(`${base(eventId)}/typical`)).data.data
  }
}

export default new TimelineService()
