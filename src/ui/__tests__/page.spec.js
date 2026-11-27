import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { UiPage } from '@/ui'

describe('UiPage', () => {
  it('uses the whole column and never centers it', () => {
    const wrapper = mount(UiPage, { slots: { default: '<p>hola</p>' } })
    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.classes().some(c => c.startsWith('max-w-'))).toBe(false)
    expect(wrapper.classes()).not.toContain('mx-auto')
    expect(wrapper.text()).toBe('hola')
  })

  it('passes class and attributes to its root', () => {
    const wrapper = mount(UiPage, { attrs: { class: 'pb-4', 'data-x': '1' } })
    expect(wrapper.classes()).toContain('pb-4')
    expect(wrapper.attributes('data-x')).toBe('1')
  })
})
