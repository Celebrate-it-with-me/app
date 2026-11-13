import { CWM_API } from '@/services/axios'

const base = eventId => `/event/${eventId}/padrinos`

class PadrinosService {
  /** `{ data: [padrino], totals, currency }`; money comes already computed from the budget. */
  async list(eventId) {
    return (await CWM_API.get(base(eventId))).data
  }

  async create(eventId, padrino) {
    return (await CWM_API.post(base(eventId), padrino)).data.data
  }

  async update(eventId, id, padrino) {
    return (await CWM_API.put(`${base(eventId)}/${id}`, padrino)).data.data
  }

  async remove(eventId, id) {
    await CWM_API.delete(`${base(eventId)}/${id}`)
  }

  /** The full set of budget items the padrino covers, each with an amount. */
  async setCommitments(eventId, id, commitments) {
    return (await CWM_API.put(`${base(eventId)}/${id}/commitments`, { commitments })).data.data
  }
}

export default new PadrinosService()
