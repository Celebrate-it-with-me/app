import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { UiButton, UiField, UiInput, UiBadge, UiPagination, UiAvatar, useToast } from '@/ui'
import { initials, avatarTone, cx } from '@/ui/utils'

describe('utils', () => {
  it('builds initials and a stable tone per name', () => {
    expect(initials('María Fernández López')).toBe('MF')
    expect(initials('')).toBe('')
    expect(avatarTone('Marisol')).toBe(avatarTone('Marisol'))
    expect(cx('a', false, ['b', null], 'c')).toBe('a b c')
  })
})

describe('UiButton', () => {
  it('renders a button by default and disables while loading', () => {
    const wrapper = mount(UiButton, { props: { loading: true }, slots: { default: 'Guardar' } })
    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.text()).toContain('Guardar')
  })

  it('renders an anchor when href is given', () => {
    const wrapper = mount(UiButton, { props: { href: 'https://quinvite.com' } })
    expect(wrapper.get('a').attributes('href')).toBe('https://quinvite.com')
  })
})

describe('UiField + UiInput', () => {
  it('links the label to the input and marks it invalid on error', async () => {
    const wrapper = mount({
      components: { UiField, UiInput },
      template: `<UiField label="Nombre" error="Obligatorio"><UiInput model-value="" /></UiField>`
    })
    await nextTick()
    const label = wrapper.get('label')
    const input = wrapper.get('input')
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[role="alert"]').text()).toBe('Obligatorio')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(UiInput, { props: { modelValue: '' } })
    await wrapper.get('input').setValue('Valentina')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Valentina'])
  })
})

describe('UiBadge', () => {
  it('applies the tone classes', () => {
    const wrapper = mount(UiBadge, { props: { tone: 'success' }, slots: { default: 'Confirmó' } })
    expect(wrapper.classes()).toContain('bg-success-50')
  })
})

describe('UiPagination', () => {
  it('collapses far pages into an ellipsis and emits the new page', async () => {
    const wrapper = mount(UiPagination, { props: { page: 6, pages: 12 } })
    expect(wrapper.text()).toContain('…')
    const buttons = wrapper.findAll('button').filter(b => b.text() === '7')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('update:page')[0]).toEqual([7])
  })

  it('disables prev on the first page', () => {
    const wrapper = mount(UiPagination, { props: { page: 1, pages: 3 } })
    expect(wrapper.findAll('button')[0].attributes('disabled')).toBeDefined()
  })
})

describe('UiAvatar', () => {
  it('shows initials when there is no image', () => {
    const wrapper = mount(UiAvatar, { props: { name: 'Carlos Pérez' } })
    expect(wrapper.text()).toBe('CP')
  })
})

describe('useToast', () => {
  it('queues and dismisses toasts', () => {
    const { toasts, toast, dismiss } = useToast()
    const before = toasts.length
    const id = toast({ title: 'Hola' })
    expect(toasts.length).toBe(before + 1)
    dismiss(id)
    expect(toasts.length).toBe(before)
  })
})
