import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'

const check = vi.hoisted(() => vi.fn())
vi.mock('../integrity', () => ({ BLOCK_SELECTOR: '[data-q]', checkIntegrity: check }))

import { CONFIRM_DELAY, GUARD_DELAYS, POINTER_DEBOUNCE, useIntegrityGuard } from '../useIntegrityGuard'
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

  it('keeps watching while the document has no size, and judges when a ResizeObserver reports one (I-3)', async () => {
    let notify
    vi.stubGlobal('ResizeObserver', class { constructor(cb) { notify = cb } observe() {} disconnect() {} })
    check.mockReturnValue({ ok: true, blocks: 0, problems: [], skipped: 'no-viewport' })
    const { onViolation } = setup()
    await nextTick()
    await vi.advanceTimersByTimeAsync(GUARD_DELAYS[1] + 100)
    expect(onViolation).not.toHaveBeenCalled()
    check.mockClear()
    check.mockReturnValue({ ok: false, problems: [{ block: 'rsvp', reason: 'covered' }] })
    notify()
    await vi.advanceTimersByTimeAsync(300)
    // The first measure after the page came back is confirmed once before it counts (layout may not have settled).
    expect(check).toHaveBeenCalledTimes(1)
    expect(onViolation).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(CONFIRM_DELAY + 10)
    expect(check).toHaveBeenCalledTimes(2)
    expect(onViolation).toHaveBeenCalledTimes(1)
  })

  it('drops a false alarm right after the page came back: the confirmation passes (I-3)', async () => {
    let notify
    vi.stubGlobal('ResizeObserver', class { constructor(cb) { notify = cb } observe() {} disconnect() {} })
    check.mockReturnValue({ ok: true, blocks: 0, problems: [], skipped: 'no-viewport' })
    const { onViolation } = setup()
    await nextTick()
    await vi.advanceTimersByTimeAsync(GUARD_DELAYS[1] + 100)
    check.mockReturnValueOnce({ ok: false, problems: [{ block: 'names', reason: 'covered' }] })
    check.mockReturnValue({ ok: true, blocks: 3, problems: [] })
    notify()
    await vi.advanceTimersByTimeAsync(300 + CONFIRM_DELAY + 10)
    expect(onViolation).not.toHaveBeenCalled()
  })

  it('reports a violation at once when the page was never hidden (no confirmation delay)', async () => {
    check.mockReturnValue({ ok: false, problems: [{ block: 'rsvp', reason: 'covered' }] })
    const { onViolation } = setup()
    await nextTick()
    await vi.advanceTimersByTimeAsync(10)
    expect(onViolation).toHaveBeenCalledTimes(1)
  })

  it('re-checks when the tab becomes visible again', async () => {
    check.mockReturnValue({ ok: true, problems: [] })
    setup()
    await nextTick()
    await vi.advanceTimersByTimeAsync(10)
    check.mockClear()
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(300)
    expect(check).toHaveBeenCalledTimes(1)
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

describe('useIntegrityGuard: pointer and focus (W7 N-4)', () => {
  const settle = async () => {
    await nextTick()
    await vi.advanceTimersByTimeAsync(10)
    check.mockClear()
  }

  it.each(['pointerover', 'pointerdown', 'focusin'])('re-measures after %s, captured at the document', async type => {
    check.mockReturnValue({ ok: true, problems: [] })
    setup()
    await settle()
    const target = document.createElement('button')
    // A listener on the target that stops propagation must not hide the event from the guard (capture phase).
    target.addEventListener(type, event => event.stopPropagation())
    document.body.appendChild(target)
    target.dispatchEvent(new Event(type, { bubbles: true }))
    expect(check).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(POINTER_DEBOUNCE + 5)
    expect(check).toHaveBeenCalledTimes(1)
    target.remove()
  })

  it('measures at most once per window while the pointer sweeps over many elements', async () => {
    check.mockReturnValue({ ok: true, problems: [] })
    setup()
    await settle()
    for (let i = 0; i < 40; i++) document.dispatchEvent(new Event('pointerover'))
    await vi.advanceTimersByTimeAsync(POINTER_DEBOUNCE + 5)
    expect(check).toHaveBeenCalledTimes(1)
    document.dispatchEvent(new Event('pointerover'))
    await vi.advanceTimersByTimeAsync(POINTER_DEBOUNCE + 5)
    expect(check).toHaveBeenCalledTimes(2)
  })

  it('catches an overlay that exists only while the pointer is over it and drops the package', async () => {
    check.mockReturnValue({ ok: true, problems: [] })
    const { onViolation } = setup()
    await settle()
    check.mockReturnValue({ ok: false, problems: [{ block: 'rsvp', reason: 'control-covered' }] })
    document.dispatchEvent(new Event('pointerover'))
    await vi.advanceTimersByTimeAsync(POINTER_DEBOUNCE + 5)
    expect(onViolation).toHaveBeenCalledWith([{ block: 'rsvp', reason: 'control-covered' }])
  })

  it('stops listening when the guard stops', async () => {
    check.mockReturnValue({ ok: true, problems: [] })
    const { active } = setup()
    await settle()
    active.value = false
    await nextTick()
    document.dispatchEvent(new Event('pointerover'))
    await vi.advanceTimersByTimeAsync(POINTER_DEBOUNCE + 50)
    expect(check).not.toHaveBeenCalled()
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
