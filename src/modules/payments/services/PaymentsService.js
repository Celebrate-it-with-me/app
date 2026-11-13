import { CWM_API } from '@/services/axios'

const base = eventId => `/event/${eventId}/purchase`

class PaymentsService {
  /** Price (with an optional code) and whether the event is already unlocked. Rejects with 422 `code` for a bad code. */
  async quote(eventId, code) {
    return (await CWM_API.get(`${base(eventId)}/quote`, { params: code ? { code } : {} })).data.data
  }

  /** Creates the purchase and returns where to send the buyer: `{ purchaseId, url }`. */
  async checkout(eventId, code) {
    return (await CWM_API.post(`${base(eventId)}/checkout`, code ? { code } : {})).data.data
  }

  /** `{ unlocked, status }`: polled while the payment confirmation arrives. */
  async status(eventId) {
    return (await CWM_API.get(`${base(eventId)}/status`)).data.data
  }
}

export default new PaymentsService()
