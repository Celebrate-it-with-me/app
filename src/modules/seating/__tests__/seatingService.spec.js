import { describe, it, expect, vi, beforeEach } from 'vitest'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))

import SeatingService from '../services/SeatingService'

beforeEach(() => Object.values(api).forEach(fn => fn.mockReset().mockResolvedValue({ data: {} })))

describe('SeatingService', () => {
  it('talks to the table endpoints', async () => {
    await SeatingService.createTable({ eventId: 1, name: 'A', capacity: 2, type: 'vip', priority: 5, reserved_for: null, location: null })
    expect(api.post).toHaveBeenCalledWith('event/1/tables', expect.objectContaining({ name: 'A', capacity: 2 }))
    await SeatingService.loadTables({ eventId: 1 })
    expect(api.get).toHaveBeenCalledWith('event/1/tables')
    await SeatingService.updateTable({ eventId: 1, tableId: 3, name: 'B', capacity: 4 })
    expect(api.put).toHaveBeenCalledWith('event/1/tables/3', expect.objectContaining({ name: 'B' }))
    await SeatingService.deleteTable({ eventId: 1, tableId: 3 })
    expect(api.delete).toHaveBeenCalledWith('event/1/tables/3')
    await SeatingService.assignGuestToTable({ eventId: 1, tableId: 3, guestId: 9 })
    expect(api.post).toHaveBeenCalledWith('event/1/tables/3/assign', { guest_id: 9 })
    await SeatingService.removeGuestFromTable({ eventId: 1, tableId: 3, guestId: 9 })
    expect(api.delete).toHaveBeenCalledWith('event/1/tables/3/guest/9')
  })

  it('passes search params to the unassigned list', async () => {
    await SeatingService.getUnassignedGuests(1)
    expect(api.get).toHaveBeenCalledWith('event/1/seating/unassigned', { params: {} })
    await SeatingService.getUnassignedGuests(1, { search: 'ana', page: 2 })
    expect(api.get).toHaveBeenLastCalledWith('event/1/seating/unassigned', { params: { search: 'ana', page: 2 } })
  })

  it('bulk assigns and clears', async () => {
    await SeatingService.bulkAssign({ eventId: 1, assignments: [{ table_id: 2, guest_ids: [1, 2] }] })
    expect(api.post).toHaveBeenCalledWith('event/1/seating/bulk-assign', { assignments: [{ table_id: 2, guest_ids: [1, 2] }] })
    await SeatingService.clearAll({ eventId: 1 })
    expect(api.delete).toHaveBeenCalledWith('event/1/seating/clear-all')
  })

  it('moves with the atomic endpoint', async () => {
    await SeatingService.moveGuest({ eventId: 1, guestId: 9, toTableId: 4 })
    expect(api.post).toHaveBeenCalledWith('event/1/seating/move', { guest_id: 9, to_table_id: 4 })
    expect(api.delete).not.toHaveBeenCalled()
  })
})
