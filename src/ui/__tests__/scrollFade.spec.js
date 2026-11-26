import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { UiScrollFade } from '@/ui'

function measure(wrapper, { scrollLeft, clientWidth, scrollWidth }) {
  const el = wrapper.get('.no-scrollbar').element
  Object.defineProperty(el, 'scrollLeft', { value: scrollLeft, configurable: true })
  Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true })
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth, configurable: true })
  return el
}

describe('UiScrollFade', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows no fade when everything fits', async () => {
    const wrapper = mount(UiScrollFade, { slots: { default: '<div>tabs</div>' } })
    measure(wrapper, { scrollLeft: 0, clientWidth: 300, scrollWidth: 300 })
    await wrapper.get('.no-scrollbar').trigger('scroll')
    expect(wrapper.find('[data-testid=fade-left]').exists()).toBe(false)
    expect(wrapper.find('[data-testid=fade-right]').exists()).toBe(false)
  })

  it('fades the right edge when there is more, and the left one after scrolling', async () => {
    const wrapper = mount(UiScrollFade, { slots: { default: '<div>tabs</div>' } })
    const el = measure(wrapper, { scrollLeft: 0, clientWidth: 300, scrollWidth: 600 })
    await el.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('[data-testid=fade-right]').exists()).toBe(true)
    expect(wrapper.find('[data-testid=fade-left]').exists()).toBe(false)

    measure(wrapper, { scrollLeft: 100, clientWidth: 300, scrollWidth: 600 })
    el.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('[data-testid=fade-left]').exists()).toBe(true)

    measure(wrapper, { scrollLeft: 300, clientWidth: 300, scrollWidth: 600 })
    el.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('[data-testid=fade-right]').exists()).toBe(false)
  })

  it('re-measures when the content resizes and stops observing on unmount', async () => {
    let callback
    const disconnect = vi.fn()
    vi.stubGlobal('ResizeObserver', class { constructor(cb) { callback = cb } observe() {} disconnect() { disconnect() } })
    const wrapper = mount(UiScrollFade, { slots: { default: '<div>tabs</div>' } })
    measure(wrapper, { scrollLeft: 0, clientWidth: 100, scrollWidth: 400 })
    callback()
    await nextTick()
    expect(wrapper.find('[data-testid=fade-right]').exists()).toBe(true)
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
    // A late resize after unmount must not throw.
    expect(() => callback()).not.toThrow()
  })
})
