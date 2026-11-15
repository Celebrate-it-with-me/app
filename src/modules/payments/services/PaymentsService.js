import { CWM_API } from '@/services/axios'

const base = eventId => `/event/${eventId}/purchase`

// Identical quotes asked while one is still in flight (the panel mounting twice) share a single request.
const quotesInFlight = new Map()

class PaymentsService {
  /** Price (with an optional code) and whether the event is already unlocked. Rejects with 422 `code` for a bad code. */
  quote(eventId, code) {
    const key = `${eventId}|${code ?? ''}`
    if (!quotesInFlight.has(key)) {
      const request = CWM_API.get(`${base(eventId)}/quote`, { params: code ? { code } : {} })
        .then(response => response.data.data)
        .finally(() => quotesInFlight.delete(key))
      quotesInFlight.set(key, request)
    }
    return quotesInFlight.get(key)
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
