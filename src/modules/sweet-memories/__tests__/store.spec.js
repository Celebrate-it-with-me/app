import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const loadImages = vi.hoisted(() => vi.fn())
const eventsStore = vi.hoisted(() => ({ activeEvent: null }))

vi.mock('@/modules/sweet-memories/services/SweetMemoriesService', () => ({ default: { loadImages } }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => eventsStore }))

import { useSweetMemoriesStore } from '../stores/useSweetMemoriesStore'

describe('sweet memories store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    loadImages.mockReset()
    eventsStore.activeEvent = null
  })

  it('does not call the API without an active event (no event/0 404)', async () => {
    const store = useSweetMemoriesStore()
    await store.loadMemories()
    expect(loadImages).not.toHaveBeenCalled()
    expect(store.memories).toEqual([])
  })

  it('loads the images of the active event', async () => {
    eventsStore.activeEvent = { id: 7 }
    loadImages.mockResolvedValue({ data: { data: [{ id: 1 }] } })
    const store = useSweetMemoriesStore()
    await store.loadMemories()
    expect(loadImages).toHaveBeenCalledWith({ eventId: 7 })
    expect(store.memories).toEqual([{ id: 1 }])
  })
})
