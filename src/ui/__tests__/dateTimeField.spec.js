import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import { UiDateTimeField, UiField } from '@/ui'

const mountField = (props = {}, options = {}) => mount(UiDateTimeField, { props, global: { plugins: [i18n] }, ...options })

describe('UiDateTimeField', () => {
  beforeEach(() => setLocale('es'))

  it('shows the value spelled out and never as numbers', () => {
    const wrapper = mountField({ modelValue: '2027-01-02T16:30', mode: 'datetime' })
    const text = wrapper.get('[data-testid=datetime-label]').text()
    expect(text).toMatch(/^2 ene 2027, 4:30 p\.\s?m\.$/)
    expect(text).not.toMatch(/\d\/\d/)
  })

  it('follows the language of the app', async () => {
    await setLocale('en')
    expect(mountField({ modelValue: '2027-01-02', mode: 'date' }).get('[data-testid=datetime-label]').text()).toBe('January 2, 2027')
  })

  it('shows a time on its own in 12 hours', () => {
    expect(mountField({ modelValue: '16:30', mode: 'time' }).get('[data-testid=datetime-label]').text()).toMatch(/^4:30 p\.\s?m\.$/)
  })

  it('uses the right native input per mode', () => {
    expect(mountField({ mode: 'datetime' }).get('input').attributes('type')).toBe('datetime-local')
    expect(mountField({ mode: 'date' }).get('input').attributes('type')).toBe('date')
    expect(mountField({ mode: 'time' }).get('input').attributes('type')).toBe('time')
  })

  it('shows a prompt in the language of the app while empty', () => {
    expect(mountField({ mode: 'date' }).get('[data-testid=datetime-label]').text()).toBe('Elige una fecha')
    expect(mountField({ mode: 'time' }).get('[data-testid=datetime-label]').text()).toBe('Elige una hora')
    expect(mountField({ mode: 'datetime' }).get('[data-testid=datetime-label]').text()).toBe('Elige fecha y hora')
    expect(mountField({ placeholder: 'Cuándo' }).get('[data-testid=datetime-label]').text()).toBe('Cuándo')
  })

  it('emits the same local ISO string the native input produces', async () => {
    const wrapper = mountField({ modelValue: '', mode: 'datetime' })
    await wrapper.get('input').setValue('2026-12-25T18:30')
    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-12-25T18:30']])
  })

  it('opens the picker on click, and survives a browser that refuses', async () => {
    const wrapper = mountField({ mode: 'date' })
    const showPicker = vi.fn()
    wrapper.get('input').element.showPicker = showPicker
    await wrapper.get('input').trigger('click')
    expect(showPicker).toHaveBeenCalledTimes(1)

    wrapper.get('input').element.showPicker = () => {
      throw new Error('NotAllowedError')
    }
    await expect(wrapper.get('input').trigger('click')).resolves.not.toThrow()
  })

  it('is a disabled native input when it is disabled, so the picker cannot open', () => {
    const wrapper = mountField({ mode: 'date', disabled: true })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid=datetime-face]').classes()).toContain('bg-cream-200')
  })

  it('takes its id and its error state from the field around it', () => {
    const wrapper = mount(
      { components: { UiField, UiDateTimeField }, template: '<UiField label="Inicio" error="Falta" id="start"><UiDateTimeField mode="date" /></UiField>' },
      { global: { plugins: [i18n] } }
    )
    const input = wrapper.get('input')
    expect(input.attributes('id')).toBe('start')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[data-testid=datetime-face]').classes()).toContain('border-danger-500')
  })

  it('passes native attributes such as min to the input', () => {
    expect(mountField({ mode: 'date' }, { attrs: { min: '2027-01-01' } }).get('input').attributes('min')).toBe('2027-01-01')
  })

  it('works without a field around it (own id, invalid prop)', () => {
    const wrapper = mountField({ mode: 'time', invalid: true })
    expect(wrapper.get('input').attributes('id')).toMatch(/^datetime-/)
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  })
})
