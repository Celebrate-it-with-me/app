import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useMinWidth } from '../useMinWidth'

const original = window.matchMedia
afterEach(() => {
  window.matchMedia = original
})
const host = (px, fallback) => {
  let result
  const w = mount(defineComponent({ setup() { result = useMinWidth(px, fallback); return () => h('i') } }))
  return { w, result }
}

describe('useMinWidth', () => {
  it('answers the fallback without matchMedia', () => {
    window.matchMedia = undefined
    expect(host(640).result.value).toBe(true)
    expect(host(640, false).result.value).toBe(false)
  })
  it('follows the media query and stops listening on unmount', () => {
    let listener
    const remove = vi.fn()
    window.matchMedia = vi.fn(q => ({ matches: false, media: q, addEventListener: (_, fn) => (listener = fn), removeEventListener: remove }))
    const { w, result } = host(640)
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 640px)')
    expect(result.value).toBe(false)
    listener({ matches: true })
    expect(result.value).toBe(true)
    w.unmount()
    expect(remove).toHaveBeenCalledWith('change', listener)
  })
})
