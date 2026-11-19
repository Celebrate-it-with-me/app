import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({ preview: vi.fn() }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))

import { createMiniatureSession } from '../composables/useMiniatureSession'

const err429 = () => Object.assign(new Error('x'), { response: { status: 429 } })

beforeEach(() => {
  vi.useFakeTimers()
  mocks.preview.mockReset()
  mocks.preview.mockImplementation(async (eventId, { templateId }) => ({ templateId }))
})
afterEach(() => vi.useRealTimers())

describe('createMiniatureSession', () => {
  it('asks the API once per event, template and language and serves the rest from the cache', async () => {
    const s = createMiniatureSession({ spacing: 0 })
    const a = s.fetch(5, 1, 'es')
    const b = s.fetch(5, 1, 'es') // in flight: same promise
    await vi.runAllTimersAsync()
    expect(await a).toEqual({ templateId: 1 })
    expect(await b).toEqual({ templateId: 1 })
    expect(await s.fetch(5, 1, 'es')).toEqual({ templateId: 1 })
    expect(mocks.preview).toHaveBeenCalledTimes(1)
    expect(s.has(5, 1, 'es')).toBe(true)
    await s.fetch(5, 1, 'en')
    await s.fetch(5, null, 'es')
    await vi.runAllTimersAsync()
    expect(mocks.preview).toHaveBeenCalledTimes(3)
    expect(mocks.preview).toHaveBeenCalledWith(5, { templateId: 1, locale: 'en' })
  })

  it('spaces the calls out in the order they were asked', async () => {
    const s = createMiniatureSession({ spacing: 500 })
    const times = []
    mocks.preview.mockImplementation(async (e, { templateId }) => {
      times.push([templateId, Date.now()])
      return {}
    })
    ;[1, 2, 3].forEach(id => s.fetch(5, id, 'es'))
    await vi.runAllTimersAsync()
    expect(times.map(t => t[0])).toEqual([1, 2, 3])
    expect(times[1][1] - times[0][1]).toBeGreaterThanOrEqual(500)
    expect(times[2][1] - times[1][1]).toBeGreaterThanOrEqual(500)
  })

  it('does not cache failures and pauses the queue after a 429', async () => {
    const s = createMiniatureSession({ spacing: 0, cooldown: 6000 })
    mocks.preview.mockRejectedValueOnce(err429())
    const first = s.fetch(5, 1, 'es').catch(e => e)
    await vi.runAllTimersAsync()
    expect((await first).response.status).toBe(429)
    expect(s.has(5, 1, 'es')).toBe(false)
    const start = Date.now()
    let at = 0
    mocks.preview.mockImplementation(async () => ((at = Date.now()), {}))
    s.fetch(5, 2, 'es')
    await vi.runAllTimersAsync()
    expect(at - start).toBeGreaterThanOrEqual(5900)
    mocks.preview.mockRejectedValueOnce(new Error('boom'))
    await expect(Promise.all([s.fetch(5, 3, 'es'), vi.runAllTimersAsync()])).rejects.toThrow('boom')
  })

  it('asks again once an entry is older than the ttl', async () => {
    let clock = 0
    const s = createMiniatureSession({ spacing: 0, ttl: 1000, now: () => clock })
    await s.fetch(5, 1, 'es')
    clock = 999
    await s.fetch(5, 1, 'es')
    expect(mocks.preview).toHaveBeenCalledTimes(1)
    clock = 1001
    await s.fetch(5, 1, 'es')
    expect(mocks.preview).toHaveBeenCalledTimes(2)
  })

  it('dispose drops what still waits in the queue but keeps the cache', async () => {
    const s = createMiniatureSession({ spacing: 500 })
    const first = s.fetch(5, 1, 'es')
    const second = s.fetch(5, 2, 'es').catch(e => e)
    const third = s.fetch(5, 3, 'es').catch(e => e)
    await vi.advanceTimersByTimeAsync(0)
    await first
    s.dispose()
    await vi.runAllTimersAsync()
    expect(await second).toEqual({ disposed: true })
    expect(await third).toEqual({ disposed: true })
    expect(mocks.preview).toHaveBeenCalledTimes(1)
    expect(await s.fetch(5, 1, 'es')).toEqual({ templateId: 1 })
    expect(s.fetch(5, 4, 'es')).toBeInstanceOf(Promise)
    await vi.runAllTimersAsync()
    expect(mocks.preview).toHaveBeenCalledTimes(2)
  })

  it('stops a request that was waiting for its turn when it is disposed during the wait', async () => {
    const s = createMiniatureSession({ spacing: 500 })
    await s.fetch(5, 1, 'es')
    const late = s.fetch(5, 2, 'es').catch(e => e)
    await vi.advanceTimersByTimeAsync(100)
    s.dispose()
    await vi.runAllTimersAsync()
    expect(await late).toEqual({ disposed: true })
    expect(mocks.preview).toHaveBeenCalledTimes(1)
  })

  it('owns a pool of 2 iframe slots by default', () => {
    expect(createMiniatureSession().slots.stats().max).toBe(2)
  })
})
