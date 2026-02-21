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

  async getUnassignedGuests(eventId) {
    return CWM_API.get(`event/${eventId}/seating/unassigned`)
  }

  async assignGuestToTable({ eventId, guestId, tableId }) {
    return CWM_API.post(`event/${eventId}/tables/${tableId}/assign`, {
      guest_id: guestId
    })
  }

  async removeGuestFromTable({ eventId, tableId, guestId }) {
    return CWM_API.delete(`event/${eventId}/tables/${tableId}/guest/${guestId}`)
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
