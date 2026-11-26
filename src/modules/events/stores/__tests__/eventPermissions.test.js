import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'

const m = vi.hoisted(() => ({ permissions: vi.fn(), updateActive: vi.fn() }))
vi.mock('../../services/EventsService', () => ({ default: { getEventPermissions: m.permissions, updateActiveEvent: m.updateActive } }))

import { useEventsStore } from '../useEventsStore'

beforeEach(() => {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  Object.values(m).forEach(fn => fn.mockReset())
  m.updateActive.mockResolvedValue({})
})

describe('event permissions', () => {
  it('reads the names the API sends (and the old `{ name }` shape)', () => {
    const store = useEventsStore()
    store.initActiveEvent({ id: 1 })
    store.initEventPermissions(['view_event', 'view_budget'])
    expect(store.hasPermission('view_budget')).toBe(true)
    expect(store.hasPermission('edit_event')).toBe(false)
    expect(store.hasAnyPermission(['edit_event', 'view_event'])).toBe(true)
    expect(store.permissionsEventId).toBe(1)
    store.initEventPermissions([{ name: 'edit_event' }])
    expect(store.hasPermission('edit_event')).toBe(true)
  })

  it('a switch of event drops the previous event\'s permissions and reads the new ones (owner of A, viewer of B)', async () => {
    let resolve
    m.permissions.mockReturnValue(new Promise(r => (resolve = r)))
    const store = useEventsStore()
    store.initActiveEvent({ id: 1, userRole: 'owner' })
    store.initEventPermissions(['view_event', 'view_budget'])
    await store.setActiveEvent({ id: 2, userRole: 'viewer' })
    expect(store.hasPermission('view_budget')).toBe(false)
    expect(store.permissionsEventId).toBeNull()
    expect(m.permissions).toHaveBeenCalledWith(2)
    resolve({ status: 200, data: { data: { permissions: ['view_event', 'view_guests'] } } })
    await new Promise(r => setTimeout(r))
    expect(store.permissionsEventId).toBe(2)
    expect(store.hasPermission('view_guests')).toBe(true)
    expect(store.hasPermission('view_budget')).toBe(false)
  })

  it('keeps the list when the same event is set again', async () => {
    const store = useEventsStore()
    store.initActiveEvent({ id: 1 })
    store.initEventPermissions(['view_event'])
    await store.setActiveEvent({ id: 1 })
    expect(m.permissions).not.toHaveBeenCalled()
    expect(store.hasPermission('view_event')).toBe(true)
  })
})
