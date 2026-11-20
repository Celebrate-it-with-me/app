import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useBatchPolling } from '../composables/useBatchPolling'

const batch = (queued, extra = {}) => ({ total: 10, queued, done: queued === 0, ...extra })
let scope

function watch(fetcher, options) {
  scope = effectScope()
  return scope.run(() => useBatchPolling(fetcher, options))
}
const hidden = value => Object.defineProperty(document, 'hidden', { configurable: true, get: () => value })

beforeEach(() => {
  vi.useFakeTimers()
  hidden(false)
})
afterEach(() => {
  scope?.stop()
  vi.useRealTimers()
  hidden(false)
})

describe('useBatchPolling', () => {
  it('reads at once, every 2 s while queued, every 5 s for a minute afterwards and then stops', async () => {
    const answers = [batch(5), batch(2), batch(0)]
    const fetcher = vi.fn(async () => answers[Math.min(fetcher.mock.calls.length - 1, answers.length - 1)])
    const { batch: current, polling, start } = watch(fetcher)
    await start()
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(current.value.queued).toBe(5)
    expect(polling.value).toBe(true)
    await vi.advanceTimersByTimeAsync(1999)
    expect(fetcher).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(fetcher).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(2000)
    expect(fetcher).toHaveBeenCalledTimes(3) // queue is empty now
    expect(current.value.done).toBe(true)
    await vi.advanceTimersByTimeAsync(5000)
    expect(fetcher).toHaveBeenCalledTimes(4)
    await vi.advanceTimersByTimeAsync(60000)
    const calls = fetcher.mock.calls.length
    expect(polling.value).toBe(false)
    await vi.advanceTimersByTimeAsync(20000)
    expect(fetcher).toHaveBeenCalledTimes(calls)
  })

  it('gives up with the error after three failed reads in a row, and recovers if one succeeds', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce(batch(3)).mockRejectedValue(new Error('down'))
    const { error, polling, start } = watch(fetcher)
    await start()
    expect(error.value).toBeNull()
    await vi.advanceTimersByTimeAsync(5000) // second read works
    await vi.advanceTimersByTimeAsync(2000)
    await vi.advanceTimersByTimeAsync(5000)
    await vi.advanceTimersByTimeAsync(5000)
    expect(error.value).toBeInstanceOf(Error)
    expect(polling.value).toBe(false)
  })

  it('pauses while the tab is hidden and looks again when it comes back', async () => {
    const fetcher = vi.fn(async () => batch(4))
    const { start } = watch(fetcher)
    await start()
    hidden(true)
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(10000)
    expect(fetcher).toHaveBeenCalledTimes(1)
    hidden(false)
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(0)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('does not schedule a read when the answer arrives while hidden', async () => {
    hidden(true)
    const fetcher = vi.fn(async () => batch(4))
    const { start } = watch(fetcher)
    await start()
    await vi.advanceTimersByTimeAsync(10000)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('stop() ends the watch, ignores a late answer and a restart begins again', async () => {
    let release
    const fetcher = vi.fn().mockImplementationOnce(() => new Promise(resolve => (release = resolve))).mockResolvedValue(batch(1))
    const { batch: current, polling, start, stop } = watch(fetcher)
    const first = start()
    stop()
    release(batch(9))
    await first
    expect(current.value).toBeNull()
    expect(polling.value).toBe(false)
    await start()
    expect(current.value.queued).toBe(1)
    scope.stop()
    await vi.advanceTimersByTimeAsync(10000)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('works outside a component scope too', async () => {
    const { start, stop } = useBatchPolling(async () => batch(0))
    await start()
    stop()
  })
})
