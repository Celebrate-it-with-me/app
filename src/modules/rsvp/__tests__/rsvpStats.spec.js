import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { useToast } from '@/ui'
import { setLocale } from '@/locales/i18n'
import { useUserStore } from '@/stores/useUserStore'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: { get } }))
import RsvpService from '../services/RsvpService'
import { useRsvpStore } from '../stores/useRsvpStore'

const toasts = () => useToast().toasts.map(x => x.title)

function setup(activeEvent) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useUserStore().activeEvent = activeEvent
  return useRsvpStore()
}

beforeEach(() => {
  setLocale('es')
  get.mockReset()
  useToast().toasts.map(x => x.id).forEach(id => useToast().dismiss(id))
})

describe('RsvpService', () => {
  it('asks for the answers of the whole event', async () => {
    get.mockResolvedValue({ status: 200, data: { attending: 3 } })
    const response = await RsvpService.loadStats({ eventId: 12 })
    expect(get).toHaveBeenCalledWith('event/12/rsvp/stats')
    expect(response.data).toEqual({ attending: 3 })
  })

  it('lets the request error reach the caller', async () => {
    get.mockRejectedValue(new Error('network'))
    await expect(RsvpService.loadStats({ eventId: 1 })).rejects.toThrow('network')
  })
})

describe('useRsvpStore', () => {
  it('starts with no counters', () => {
    expect(setup(5).stats).toEqual({})
  })

  it('drops a late answer that belongs to an event no longer active', async () => {
    let resolve
    get.mockReturnValue(new Promise(r => (resolve = r)))
    const store = setup(9)
    const pending = store.fetchStats()
    useUserStore().activeEvent = 10
    resolve({ status: 200, data: { recent: [{ name: 'Ana' }] } })
    await pending
    expect(store.stats).toEqual({})
  })

  it('keeps the counters of the active event', async () => {
    get.mockResolvedValue({ status: 200, data: { attending: 4, pending: 2 } })
    const store = setup(9)
    await store.fetchStats()
    expect(get).toHaveBeenCalledWith('event/9/rsvp/stats')
    expect(store.stats).toEqual({ attending: 4, pending: 2 })
    expect(toasts()).toEqual([])
  })

  it('clears the counters and makes no call when there is no active event', async () => {
    const store = setup(null)
    store.stats = { attending: 1 }
    await store.fetchStats()
    expect(get).not.toHaveBeenCalled()
    expect(store.stats).toEqual({})
  })

  it('tells the user and keeps the old counters when the answer is not a 200', async () => {
    get.mockResolvedValue({ status: 204, data: {} })
    const store = setup(9)
    store.stats = { attending: 1 }
    await store.fetchStats()
    expect(store.stats).toEqual({ attending: 1 })
    expect(toasts()).toEqual(['No pudimos cargar las estadísticas del evento. Inténtalo de nuevo más tarde.'])
  })

  it('lets a network failure through (the caller decides)', async () => {
    get.mockRejectedValue(new Error('offline'))
    const store = setup(9)
    await expect(store.fetchStats()).rejects.toThrow('offline')
  })
})
