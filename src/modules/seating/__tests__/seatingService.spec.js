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

  it('moves by removing then assigning (the atomic endpoint is not live yet)', async () => {
    expect(SeatingService.nativeMove).toBe(false)
    await SeatingService.moveGuest({ eventId: 1, guestId: 9, fromTableId: 3, toTableId: 4 })
    expect(api.delete).toHaveBeenCalledWith('event/1/tables/3/guest/9')
    expect(api.post).toHaveBeenCalledWith('event/1/tables/4/assign', { guest_id: 9 })
  })

  it('uses the atomic endpoint once it is switched on', async () => {
    SeatingService.nativeMove = true
    try {
      await SeatingService.moveGuest({ eventId: 1, guestId: 9, fromTableId: 3, toTableId: 4 })
    } finally {
      SeatingService.nativeMove = false
    }
    expect(api.post).toHaveBeenCalledWith('event/1/seating/move', { guest_id: 9, from_table_id: 3, to_table_id: 4 })
    expect(api.delete).not.toHaveBeenCalled()
  })

  it('puts the guest back when the new table refuses', async () => {
    const boom = new Error('full')
    api.post.mockRejectedValueOnce(boom)
    await expect(SeatingService.moveGuest({ eventId: 1, guestId: 9, fromTableId: 3, toTableId: 4 })).rejects.toBe(boom)
    expect(api.post).toHaveBeenLastCalledWith('event/1/tables/3/assign', { guest_id: 9 })
  })

  it('still reports the original error when the rollback fails too', async () => {
    const boom = new Error('full')
    api.post.mockRejectedValueOnce(boom).mockRejectedValueOnce(new Error('rollback'))
    await expect(SeatingService.moveGuest({ eventId: 1, guestId: 9, fromTableId: 3, toTableId: 4 })).rejects.toBe(boom)
  })
})
