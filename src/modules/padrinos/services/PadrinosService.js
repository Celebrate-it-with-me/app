import { CWM_API } from '@/services/axios'

/** Development switch: `localStorage['cwm.mockPadrinoCommitments']` (JSON scenario or `1`) fakes the commitments endpoint. Never in production. */
const mockEnabled = () => import.meta.env.DEV && typeof localStorage !== 'undefined' && !!localStorage.getItem('cwm.mockPadrinoCommitments')

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

  /**
   * The full set of budget items the padrino covers, each with an amount (and, once the API asked, a `resolution`).
   * Resolves `{ data, warnings }`; rejects with the axios error (409 `commitment_item_paid`, 422 `commitment_exceeds_remaining`).
   */
  async setCommitments(eventId, id, commitments) {
    if (mockEnabled()) return (await import('./commitmentsMock')).mockSetCommitments(commitments)
    const { data, warnings } = (await CWM_API.put(`${base(eventId)}/${id}/commitments`, { commitments })).data
    return { data, warnings: warnings ?? [] }
  }
}

export default new PadrinosService()
