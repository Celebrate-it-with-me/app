import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { UiPage } from '@/ui'

describe('UiPage', () => {
  it('caps a default page at 3xl and never centers it', () => {
    const wrapper = mount(UiPage, { slots: { default: '<p>hola</p>' } })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['w-full', 'max-w-3xl']))
    expect(wrapper.classes()).not.toContain('mx-auto')
    expect(wrapper.text()).toBe('hola')
  })

  it('caps a form at 2xl and leaves a wide page uncapped', () => {
    expect(mount(UiPage, { props: { width: 'form' } }).classes()).toContain('max-w-2xl')
    const wide = mount(UiPage, { props: { width: 'wide' } })
    expect(wide.classes().some(c => c.startsWith('max-w-'))).toBe(false)
  })

  it('passes class and attributes to its root', () => {
    const wrapper = mount(UiPage, { attrs: { class: 'pb-4', 'data-x': '1' } })
    expect(wrapper.classes()).toContain('pb-4')
    expect(wrapper.attributes('data-x')).toBe('1')
  })
})
