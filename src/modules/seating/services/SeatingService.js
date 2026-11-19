import { CWM_API } from '@/services/axios'

class SeatingService {
  async createTable({
    eventId,
    name,
    capacity,
    assignedGuests,
    type,
    priority,
    reserved_for,
    location
  }) {
    return CWM_API.post(`event/${eventId}/tables`, {
      name,
      capacity,
      assignedGuests,
      type,
      priority,
      reserved_for,
      location
    })
  }

  async loadTables({ eventId }) {
    return CWM_API.get(`event/${eventId}/tables`)
  }

  async deleteTable({ eventId, tableId }) {
    return CWM_API.delete(`event/${eventId}/tables/${tableId}`)
  }

  /**
   * Unseated guests. `params` (search, status, page, per_page) are sent as they come: the API ignores the ones
   * it does not know yet, and the controller filters and pages in the browser until it honours them.
   */
  async getUnassignedGuests(eventId, params = {}) {
    return CWM_API.get(`event/${eventId}/seating/unassigned`, { params })
  }

  async assignGuestToTable({ eventId, guestId, tableId }) {
    return CWM_API.post(`event/${eventId}/tables/${tableId}/assign`, {
      guest_id: guestId
    })
  }

  async removeGuestFromTable({ eventId, tableId, guestId }) {
    return CWM_API.delete(`event/${eventId}/tables/${tableId}/guest/${guestId}`)
  }

  /** Seats several guests at once: `assignments` is `[{ table_id, guest_ids }]`. */
  async bulkAssign({ eventId, assignments }) {
    return CWM_API.post(`event/${eventId}/seating/bulk-assign`, { assignments })
  }

  /** Unseats everybody. */
  async clearAll({ eventId }) {
    return CWM_API.delete(`event/${eventId}/seating/clear-all`)
  }

  /** Atomic move: if it fails the guest stays at the old table. Answer: `data: { from, to }`. */
  async moveGuest({ eventId, guestId, toTableId }) {
    return CWM_API.post(`event/${eventId}/seating/move`, { guest_id: guestId, to_table_id: toTableId })
  }

  async updateTable({ eventId, tableId, name, capacity, type, priority, reserved_for, location }) {
    return CWM_API.put(`event/${eventId}/tables/${tableId}`, {
      name,
      capacity,
      type,
      priority,
      reserved_for,
      location
    })
  }
}

export default new SeatingService()
