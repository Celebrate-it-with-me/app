import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

const hydrate = vi.hoisted(() => vi.fn())
vi.mock('@/services/HydrationService', () => ({ default: { hydrate } }))
vi.mock('@/services/axios', () => ({ CWM_API: { get: vi.fn() } }))

const { useHydrationStore } = await import('../useHydrationStore')
const { useUserStore } = await import('../useUserStore')
const { useEventsStore } = await import('@/modules/events/stores/useEventsStore')
const { useAuthStore } = await import('../useAuthStore')
const { authGuard } = await import('@/router/authGuard')

const payload = (extra = {}) => ({
  status: 200,
  data: { events: [], userPermissions: [], menus: [], menuGuests: [], comments: [], eventTypes: [], eventPlans: [], activeEvent: null, ...extra }
})

beforeEach(() => {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  localStorage.clear()
  useAuthStore().isReady = true
  hydrate.mockReset()
})

describe('hydration keeps the active event id and object in step', () => {
  it('fills userStore.activeEvent (id) from the hydrated event object', async () => {
    const user = useUserStore()
    expect(user.activeEvent).toBeNull()
    hydrate.mockResolvedValue(payload({ activeEvent: { id: 7, guestsCount: 5 } }))

    await useHydrationStore().hydrateAll()

    expect(useEventsStore().activeEvent).toEqual({ id: 7, guestsCount: 5 })
    expect(user.activeEvent).toBe(7)
  })

  it('stays null when there is no active event', async () => {
    hydrate.mockResolvedValue(payload({ events: [{ id: 3 }], activeEvent: null }))

    await useHydrationStore().hydrateAll()

    expect(useEventsStore().activeEvent).toBeNull()
    expect(useUserStore().activeEvent).toBeNull()
  })

  it('clears a stale persisted id when the server has no active event', async () => {
    const user = useUserStore()
    user.activeEvent = 99
    hydrate.mockResolvedValue(payload())

    await useHydrationStore().hydrateAll()

    expect(user.activeEvent).toBeNull()
  })

  it('treats an undefined event as no event', () => {
    const events = useEventsStore()
    events.initActiveEvent(undefined)
    expect(events.activeEvent).toBeNull()
    expect(useUserStore().activeEvent).toBeNull()
  })

  it('lets the layout pick the first event when there are events but no last active one', async () => {
    hydrate.mockResolvedValue(payload({ events: [{ id: 3 }, { id: 4 }], activeEvent: null }))
    await useHydrationStore().hydrateAll()

    const events = useEventsStore()
    const user = useUserStore()
    // Same decision as InternalLayout.determinePostLoginRoute
    expect(user.activeEvent).toBeNull()
    expect(events.hasEvents).toBe(true)
    events.updateActiveEvent = vi.fn()
    await events.setActiveEvent(events.events[0])
    expect(user.activeEvent).toBe(3)
  })

  it('authGuard on a deep link (internal route) leaves both ready after hydrating', async () => {
    const user = useUserStore()
    user.userId = 1
    user.name = 'Ana'
    user.email = 'a@b.co'
    hydrate.mockResolvedValue(payload({ activeEvent: { id: 7 } }))

    const result = await authGuard({ meta: { requiresAuth: true }, fullPath: '/dashboard/dress-code' })

    expect(result).toBeUndefined()
    expect(useEventsStore().activeEvent.id).toBe(7)
    expect(user.activeEvent).toBe(7)
  })
})
