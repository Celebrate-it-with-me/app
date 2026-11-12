import { CWM_API } from '@/services/axios'

const base = eventId => `/event/${eventId}/budget`

class BudgetService {
  /** Totals (owed, paid, remaining, cap) of the event, by category too. Created on first read. */
  async summary(eventId) {
    return (await CWM_API.get(base(eventId))).data.data
  }

  async setCap(eventId, cap) {
    return (await CWM_API.put(base(eventId), { cap })).data.data
  }

  async items(eventId) {
    return (await CWM_API.get(`${base(eventId)}/items`)).data.data
  }

  async createItem(eventId, item) {
    return (await CWM_API.post(`${base(eventId)}/items`, item)).data.data
  }

  async updateItem(eventId, id, item) {
    return (await CWM_API.put(`${base(eventId)}/items/${id}`, item)).data.data
  }

  async removeItem(eventId, id) {
    await CWM_API.delete(`${base(eventId)}/items/${id}`)
  }

  async addPayment(eventId, itemId, payment) {
    return (await CWM_API.post(`${base(eventId)}/items/${itemId}/payments`, payment)).data.data
  }

  async updatePayment(eventId, itemId, paymentId, payment) {
    return (await CWM_API.put(`${base(eventId)}/items/${itemId}/payments/${paymentId}`, payment)).data.data
  }

  async removePayment(eventId, itemId, paymentId) {
    return (await CWM_API.delete(`${base(eventId)}/items/${itemId}/payments/${paymentId}`)).data.data
  }

  async addCategory(eventId, name) {
    return (await CWM_API.post(`${base(eventId)}/categories`, { name })).data.data
  }

  async renameCategory(eventId, id, name) {
    return (await CWM_API.put(`${base(eventId)}/categories/${id}`, { name })).data.data
  }

  async removeCategory(eventId, id) {
    return (await CWM_API.delete(`${base(eventId)}/categories/${id}`)).data.data
  }

  /** The budget as CSV (a Blob), for the download button. */
  async exportCsv(eventId) {
    return (await CWM_API.get(`${base(eventId)}/export`, { responseType: 'blob' })).data
  }
}

export default new BudgetService()
