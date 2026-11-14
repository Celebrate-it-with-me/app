import { describe, it, expect, afterEach, vi } from 'vitest'

vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({}) }))
vi.mock('@/stores/useHydrationStore', () => ({ useHydrationStore: () => ({}) }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => ({}) }))

const { default: router } = await import('../index.js')
const scrollBehavior = router.options.scrollBehavior

const to = (path, hash = '') => ({ path, hash })

describe('router scrollBehavior', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('restores the saved position on back/forward', () => {
    const saved = { left: 0, top: 420 }
    expect(scrollBehavior(to('/a'), to('/b'), saved)).toBe(saved)
  })

  it('starts at the top when navigating to another page', () => {
    expect(scrollBehavior(to('/a'), to('/b'), null)).toEqual({ top: 0 })
  })

  it('does not move when only the query changes on the same path', () => {
    expect(scrollBehavior(to('/a'), to('/a'), null)).toBe(false)
  })

  it('scrolls smoothly to the hash target when it already exists', () => {
    document.body.innerHTML = '<section id="precios"></section>'
    expect(scrollBehavior(to('/', '#precios'), to('/help'), null)).toEqual({
      el: '#precios',
      top: 80,
      behavior: 'smooth'
    })
  })

  it('waits for a hash target that renders later', async () => {
    vi.useFakeTimers()
    const result = scrollBehavior(to('/', '#como-funciona'), to('/help'), null)
    setTimeout(() => {
      document.body.innerHTML = '<section id="como-funciona"></section>'
    }, 120)
    await vi.advanceTimersByTimeAsync(300)
    expect(await result).toEqual({ el: '#como-funciona', top: 80, behavior: 'smooth' })
  })

  it('gives up (no scroll) when the hash target never appears', async () => {
    vi.useFakeTimers()
    const result = scrollBehavior(to('/', '#missing'), to('/help'), null)
    await vi.advanceTimersByTimeAsync(2000)
    expect(await result).toBe(false)
  })
})
