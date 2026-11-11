import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { VueDatePicker } from '@vuepic/vue-datepicker'

// The props the app passes to VueDatePicker in CDate.vue, TimelineForm.vue and DateField.vue,
// in the shape required by v14 (the v11 top-level props format, enableTimePicker,
// enableSeconds, hideInputIcon and inputClassName no longer exist).
const appProps = {
  placeholder: 'Pick a date',
  formats: { input: 'MM/dd/yyyy HH:mm' },
  timeConfig: { enableTimePicker: true, enableSeconds: false },
  inputAttrs: { hideInputIcon: true, id: 'event-date' },
  autoApply: true,
  weekStart: 0,
  dark: true,
  ui: { input: 'custom-datepicker-input' }
}

describe('VueDatePicker 14 with the props used by the app', () => {
  afterEach(() => vi.restoreAllMocks())

  it('is a named export', () => {
    expect(VueDatePicker).toBeTruthy()
  })

  it('renders without Vue warnings and applies ui.input to the input', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(VueDatePicker, { props: appProps, attachTo: document.body })

    expect(warn).not.toHaveBeenCalled()
    expect(wrapper.find('input').classes()).toContain('custom-datepicker-input')
    expect(wrapper.find('input').attributes('placeholder')).toBe('Pick a date')
    expect(wrapper.find('input').attributes('id')).toBe('event-date')
    expect(wrapper.find('.dp__input_icon').exists()).toBe(false) // hideInputIcon
    wrapper.unmount()
  })

  it('supports range mode and the disabled / readonly flags', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const range = mount(VueDatePicker, { props: { ...appProps, range: true, teleport: 'body' } })
    const disabled = mount(VueDatePicker, { props: { ...appProps, disabled: true } })

    expect(warn).not.toHaveBeenCalled()
    expect(range.exists()).toBe(true)
    expect(disabled.find('input').attributes('disabled')).toBeDefined()
  })

  it('shows the model value formatted with the given format', async () => {
    const date = new Date(2026, 11, 24, 18, 30)
    const wrapper = mount(VueDatePicker, { props: { ...appProps, modelValue: date } })
    await flushPromises()

    expect(wrapper.find('input').element.value).toBe('12/24/2026 18:30')
  })

  it('uses a date-only format when the time picker is disabled', async () => {
    const date = new Date(2026, 11, 24, 18, 30)
    const wrapper = mount(VueDatePicker, {
      props: { ...appProps, formats: { input: 'MM/dd/yyyy' }, timeConfig: { enableTimePicker: false }, modelValue: date }
    })
    await flushPromises()

    expect(wrapper.find('input').element.value).toBe('12/24/2026')
  })
})
