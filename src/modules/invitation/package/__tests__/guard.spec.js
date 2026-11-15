import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'

const check = vi.hoisted(() => vi.fn())
vi.mock('../integrity', () => ({ BLOCK_SELECTOR: '[data-q]', checkIntegrity: check }))

import { GUARD_DELAYS, useIntegrityGuard } from '../useIntegrityGuard'
import { usePackageTheme } from '../usePackageTheme'

const mounted = []
function setup(options = {}) {
  const root = ref(document.createElement('div'))
  const active = ref(options.active ?? true)
  const onViolation = vi.fn()
  let api
  const app = createApp({
    setup() {
      api = useIntegrityGuard({ root, active, onViolation })
      return () => h('div')
    }
  })
  app.mount(document.createElement('div'))
  mounted.push(app)
  return { active, onViolation, app, api }
}

beforeEach(() => {
  vi.useFakeTimers()
  check.mockReset()
  vi.stubGlobal('requestAnimationFrame', cb => setTimeout(cb, 0))
})
afterEach(() => {
  mounted.splice(0).forEach(app => app.unmount())
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useIntegrityGuard', () => {
  it('checks once the page settles and again after the entrance animations', async () => {
    check.mockReturnValue({ ok: true, problems: [] })
    const { onViolation } = setup()
    await nextTick()
    await vi.advanceTimersByTimeAsync(10)
    expect(check).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(GUARD_DELAYS[0])
    expect(check.mock.calls.length).toBeGreaterThanOrEqual(2)
    await vi.advanceTimersByTimeAsync(GUARD_DELAYS[1])
    expect(onViolation).not.toHaveBeenCalled()
  })

  it('reports a violation once and stops checking', async () => {
    check.mockReturnValue({ ok: false, problems: [{ block: 'rsvp', reason: 'covered' }] })
    const { onViolation } = setup()
    await nextTick()
    await vi.advanceTimersByTimeAsync(10)
    await vi.advanceTimersByTimeAsync(10000)
    expect(onViolation).toHaveBeenCalledTimes(1)
    expect(onViolation).toHaveBeenCalledWith([{ block: 'rsvp', reason: 'covered' }])
    expect(check).toHaveBeenCalledTimes(1)
  })

  it('does nothing while the package is not ready', async () => {
    setup({ active: false })
    await nextTick()
    await vi.advanceTimersByTimeAsync(10000)
    expect(check).not.toHaveBeenCalled()
  })

  it('re-checks when the window is resized (a media query can hide a block only at some widths)', async () => {
    check.mockReturnValue({ ok: true, problems: [] })
    setup()
    await nextTick()
    await vi.advanceTimersByTimeAsync(10)
    check.mockClear()
    window.dispatchEvent(new Event('resize'))
    await vi.advanceTimersByTimeAsync(300)
    expect(check).toHaveBeenCalledTimes(1)
  })
})

describe('usePackageTheme.reject', () => {
  it('removes the package nodes and falls back to the plain theme', async () => {
    let theme
    const app = createApp({
      setup() {
        theme = usePackageTheme(() => ({ slug: 'bad', cssUrl: `${window.location.origin}/p/1.0.0/theme.css`, templates: {} }))
        return () => h('div')
      }
    })
    app.mount(document.createElement('div'))
    expect(document.head.querySelector('link[href$="/p/1.0.0/theme.css"]')).not.toBeNull()
    expect(theme.usable.value).toBe(true)
    theme.reject([{ block: 'rsvp', reason: 'covered' }])
    expect(document.head.querySelector('link[href$="/p/1.0.0/theme.css"]')).toBeNull()
    expect(theme.state.value).toBe('failed')
    expect(theme.usable.value).toBe(false)
    expect(theme.slug.value).toBeUndefined()
    app.unmount()
  })
})
