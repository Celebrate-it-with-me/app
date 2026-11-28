import { describe, it, expect, afterEach, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { BAR_GAP_PX, floatingBarInline, floatingBarSpace, useFloatingBarSpace } from '../useFloatingBarSpace'

const scopes = []
function declare(height, options) {
  const el = ref(null)
  const scope = effectScope()
  scopes.push(scope)
  scope.run(() => useFloatingBarSpace(el, options))
  const node = { getBoundingClientRect: () => ({ height }) }
  return { el, node, scope }
}

afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  vi.unstubAllGlobals()
})

describe('useFloatingBarSpace', () => {
  it('is 0 while no bar is declared or the bar is not rendered', async () => {
    expect(floatingBarSpace.value).toBe(0)
    const { el } = declare(50)
    await nextTick()
    expect(floatingBarSpace.value).toBe(0)
    expect(el.value).toBeNull()
  })

  it('adds the gap to the bar height and rounds up', async () => {
    const { el, node } = declare(47.2)
    el.value = node
    await nextTick()
    expect(floatingBarSpace.value).toBe(48 + BAR_GAP_PX)
  })

  it('ignores a bar hidden by CSS (height 0)', async () => {
    const { el, node } = declare(0)
    el.value = node
    await nextTick()
    expect(floatingBarSpace.value).toBe(0)
  })

  it('follows the bar when it resizes (ResizeObserver) and stops observing on unmount', async () => {
    let callback
    const disconnect = vi.fn()
    vi.stubGlobal('ResizeObserver', class { constructor(cb) { callback = cb } observe() {} disconnect() { disconnect() } })
    let height = 40
    const el = ref(null)
    const scope = effectScope()
    scopes.push(scope)
    scope.run(() => useFloatingBarSpace(el))
    el.value = { getBoundingClientRect: () => ({ height }) }
    await nextTick()
    expect(floatingBarSpace.value).toBe(40 + BAR_GAP_PX)
    height = 80
    callback()
    expect(floatingBarSpace.value).toBe(80 + BAR_GAP_PX)
    scope.stop()
    expect(disconnect).toHaveBeenCalled()
    expect(floatingBarSpace.value).toBe(0)
  })

  it('works without ResizeObserver (single measure)', async () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const { el, node } = declare(30)
    el.value = node
    await nextTick()
    expect(floatingBarSpace.value).toBe(30 + BAR_GAP_PX)
  })

  it('an inline bar does not push the button up: it only centres the 48px button on the bar row', async () => {
    const { el, node, scope } = declare(44, { inline: true })
    el.value = node
    await nextTick()
    expect(floatingBarInline.value).toBe(44)
    expect(floatingBarSpace.value).toBe(-2)
    scope.stop()
    expect(floatingBarInline.value).toBe(0)
    expect(floatingBarSpace.value).toBe(0)
  })

  it('a regular bar wins over an inline one', async () => {
    const inline = declare(44, { inline: true })
    const bar = declare(60)
    inline.el.value = inline.node
    bar.el.value = bar.node
    await nextTick()
    expect(floatingBarSpace.value).toBe(60 + BAR_GAP_PX)
  })
})
