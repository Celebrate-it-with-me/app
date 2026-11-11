import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem, FwbModal } from 'flowbite-vue'

// Components and props used by the app: FwbButton (color, loading, disabled),
// FwbModal (size), FwbDropdown (text, content-wrapper-class, color), FwbListGroup(Item).
describe('flowbite-vue 0.4 with the props used by the app', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders buttons with color, loading and disabled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const btn = mount(FwbButton, { props: { color: 'purple' }, slots: { default: 'Save' } })
    const disabled = mount(FwbButton, { props: { disabled: true }, slots: { default: 'Save' } })
    const loading = mount(FwbButton, { props: { loading: true }, slots: { default: 'Save' } })

    expect(btn.text()).toContain('Save')
    expect(disabled.find('button').attributes('disabled')).toBeDefined()
    expect(loading.find('svg').exists()).toBe(true) // spinner
    expect(warn).not.toHaveBeenCalled()
  })

  it('opens a dropdown and applies content-wrapper-class to its content', async () => {
    const wrapper = mount(FwbDropdown, {
      props: { text: 'Actions', contentWrapperClass: 'rounded-lg', color: 'yellow' },
      slots: { default: '<ul><li>Edit</li></ul>' },
      attachTo: document.body
    })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(document.body.textContent).toContain('Edit')
    expect(document.body.innerHTML).toContain('rounded-lg')
    wrapper.unmount()
  })

  it('renders a modal with a size and its slots', () => {
    const wrapper = mount(FwbModal, {
      props: { size: 'lg' },
      slots: { header: 'Title', body: 'Body text', footer: 'Footer' },
      global: { stubs: { teleport: true } }
    })

    expect(wrapper.text()).toContain('Title')
    expect(wrapper.text()).toContain('Body text')
  })

  it('renders list groups and items', () => {
    const wrapper = mount(FwbListGroup, { slots: { default: () => [] } })
    const item = mount(FwbListGroupItem, { slots: { default: 'Item one' } })

    expect(wrapper.exists()).toBe(true)
    expect(item.text()).toContain('Item one')
  })
})
