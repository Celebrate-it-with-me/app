import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const get = vi.fn()
vi.mock('@/services/axios', () => ({ CWM_API: { get: (...a) => get(...a) } }))
const { useAuthStore } = await import('../useAuthStore')

describe('auth store ensureReady', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    get.mockReset()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('retries on 401 and asks the interceptor not to treat it as a lost session', async () => {
    get.mockRejectedValueOnce({ response: { status: 401 } }).mockResolvedValueOnce({ status: 200 })
    const store = useAuthStore()
    const done = store.ensureReady()
    await vi.runAllTimersAsync()
    await done
    expect(store.isReady).toBe(true)
    expect(get).toHaveBeenCalledTimes(2)
    for (const call of get.mock.calls) expect(call[1]).toMatchObject({ skipUnauthorizedHandler: true })
  })
})
