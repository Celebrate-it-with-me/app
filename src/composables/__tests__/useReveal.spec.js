import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useReveal } from '../useReveal'

const Host = defineComponent({
  setup() {
    const { root } = useReveal()
    return () =>
      h('div', { ref: root }, [
        h('p', { 'data-reveal': '', id: 'a' }, 'a'),
        h('p', { 'data-reveal': '', id: 'b' }, 'b')
      ])
  }
})

let observers
let reducedMotion

beforeEach(() => {
  observers = []
  reducedMotion = false
  window.matchMedia = vi.fn(() => ({ matches: reducedMotion }))
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback
      this.observed = new Set()
      this.disconnect = vi.fn()
      observers.push(this)
    }
    observe(node) {
      this.observed.add(node)
    }
    unobserve(node) {
      this.observed.delete(node)
    }
  }
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useReveal', () => {
  it('arms every [data-reveal] node and reveals it when it enters the viewport', () => {
    const wrapper = mount(Host)
    const [a, b] = wrapper.findAll('[data-reveal]')
    expect(a.classes()).toContain('is-armed')
    expect(b.classes()).toContain('is-armed')
    expect(a.classes()).not.toContain('is-in')

    observers[0].callback([{ isIntersecting: true, target: a.element }, { isIntersecting: false, target: b.element }])
    expect(a.classes()).toContain('is-in')
    expect(b.classes()).not.toContain('is-in')
    expect(observers[0].observed.has(a.element)).toBe(false)
  })

  it('leaves everything visible (nothing armed) with reduced motion', () => {
    reducedMotion = true
    const wrapper = mount(Host)
    expect(observers).toHaveLength(0)
    expect(wrapper.find('#a').classes()).not.toContain('is-armed')
  })

  it('leaves everything visible when IntersectionObserver does not exist', () => {
    delete window.IntersectionObserver
    const wrapper = mount(Host)
    expect(wrapper.find('#a').classes()).not.toContain('is-armed')
  })

  it('reveals everything after the safety timeout if the observer never fires', () => {
    vi.useFakeTimers()
    const wrapper = mount(Host)
    vi.advanceTimersByTime(4000)
    expect(wrapper.find('#a').classes()).toContain('is-in')
    expect(wrapper.find('#b').classes()).toContain('is-in')
  })

  it('disconnects the observer and cancels the timeout on unmount', () => {
    vi.useFakeTimers()
    const wrapper = mount(Host)
    const [observer] = observers
    wrapper.unmount()
    expect(observer.disconnect).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})
