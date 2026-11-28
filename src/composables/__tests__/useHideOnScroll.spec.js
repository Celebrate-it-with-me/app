import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useHideOnScroll } from '../useHideOnScroll'

let scope
let scrollHeight

const scrollTo = async y => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  window.dispatchEvent(new Event('scroll'))
  await vi.advanceTimersByTimeAsync(20)
}
const setup = options => {
  scope = effectScope()
  return scope.run(() => useHideOnScroll(options))
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout'] })
  scrollHeight = 3000
  Object.defineProperty(document.documentElement, 'scrollHeight', { get: () => scrollHeight, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})
afterEach(() => {
  scope?.stop()
  vi.useRealTimers()
})

describe('useHideOnScroll', () => {
  it('hides when scrolling down and shows again when scrolling up', async () => {
    const hidden = setup()
    await scrollTo(400)
    expect(hidden.value).toBe(true)
    await scrollTo(300)
    expect(hidden.value).toBe(false)
  })

  it('does not come back just because the scroll stopped', async () => {
    const hidden = setup()
    await scrollTo(400)
    await vi.advanceTimersByTimeAsync(5000)
    expect(hidden.value).toBe(true)
  })

  it('ignores movements under the threshold and accumulates them', async () => {
    const hidden = setup()
    await scrollTo(100)
    await scrollTo(100)
    expect(hidden.value).toBe(true)
    await scrollTo(104)
    expect(hidden.value).toBe(true)
    await scrollTo(96)
    expect(hidden.value).toBe(true) // 100 -> 96 is a 4 px move, not enough to flip
    await scrollTo(90)
    expect(hidden.value).toBe(false)
  })

  it('shows near the top and at the end of the page', async () => {
    const hidden = setup()
    await scrollTo(400)
    expect(hidden.value).toBe(true)
    await scrollTo(2200) // 2200 + 800 >= 3000
    expect(hidden.value).toBe(false)
    await scrollTo(1000)
    expect(hidden.value).toBe(false) // up
    await scrollTo(1500)
    expect(hidden.value).toBe(true)
    await scrollTo(10)
    expect(hidden.value).toBe(false)
  })

  it('never hides when disabled (wide screens)', async () => {
    const enabled = ref(false)
    const hidden = setup({ enabled })
    await scrollTo(500)
    expect(hidden.value).toBe(false)
    enabled.value = true
    await nextTick()
    await scrollTo(800)
    expect(hidden.value).toBe(true)
    enabled.value = false
    await nextTick()
    expect(hidden.value).toBe(false)
  })

  it('stays visible while keepVisible is true and reappears forced visible when it turns on', async () => {
    const keep = ref(false)
    const hidden = setup({ keepVisible: keep })
    await scrollTo(400)
    expect(hidden.value).toBe(true)
    keep.value = true
    await nextTick()
    expect(hidden.value).toBe(false)
    await scrollTo(700)
    expect(hidden.value).toBe(false)
  })

  it('batches scroll events into one frame and removes its listener on dispose', async () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    const remove = vi.spyOn(window, 'removeEventListener')
    setup()
    Object.defineProperty(window, 'scrollY', { value: 300, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    expect(raf).toHaveBeenCalledTimes(1)
    scope.stop()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
