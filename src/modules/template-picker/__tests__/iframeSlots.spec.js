import { describe, it, expect } from 'vitest'
import { createIframeSlots } from '../composables/useIframeSlots'

describe('createIframeSlots', () => {
  it('grants up to max slots and queues the rest in order', async () => {
    const slots = createIframeSlots(2)
    const a = slots.acquire()
    const b = slots.acquire()
    const c = slots.acquire()
    const d = slots.acquire()
    const releaseA = await a.promise
    await b.promise
    expect(slots.stats()).toEqual({ active: 2, waiting: 2, max: 2 })
    releaseA()
    await c.promise
    expect(slots.stats()).toEqual({ active: 2, waiting: 1, max: 2 })
    ;(await c.promise)()
    await d.promise
    expect(slots.stats().active).toBe(2)
  })

  it('cancel drops a waiting request and frees a granted one; releasing twice is harmless', async () => {
    const slots = createIframeSlots(1)
    const a = slots.acquire()
    const b = slots.acquire()
    await a.promise
    b.cancel()
    expect(slots.stats()).toEqual({ active: 1, waiting: 0, max: 1 })
    a.cancel()
    a.cancel()
    expect(slots.stats().active).toBe(0)
  })
})
