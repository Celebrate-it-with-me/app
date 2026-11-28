import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { UiDropdown } from '@/ui'

const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await nextTick()
    await new Promise(r => setTimeout(r, 0))
  }
}

const open = async items => {
  const wrapper = mount(UiDropdown, { props: { items }, slots: { trigger: '<button id="t">menu</button>' }, attachTo: document.body })
  document.getElementById('t').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await flush()
  return wrapper
}

const openSub = async label => {
  const trigger = [...document.body.querySelectorAll('[role="menuitem"]')].find(e => e.textContent.includes(label))
  trigger.focus()
  trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  await flush()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('UiDropdown submenu content', () => {
  it('lists the children of a submenu, runs their action and marks danger ones', async () => {
    const onAll = vi.fn()
    const wrapper = await open([
      { label: 'Download', icon: { render: () => null }, children: [
        { label: 'All', onSelect: onAll },
        { label: 'Remove', danger: true, icon: { render: () => null } },
        { label: 'Locked', disabled: true }
      ] }
    ])
    await openSub('Download')
    const items = [...document.body.querySelectorAll('[role="menuitem"]')].filter(e => ['All', 'Remove', 'Locked'].includes(e.textContent.trim()))
    expect(items.map(e => e.textContent.trim())).toEqual(['All', 'Remove', 'Locked'])
    expect(items[1].className).toContain('text-danger-700')
    expect(items[2].getAttribute('data-disabled')).not.toBeNull()
    items[0].focus()
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    items[0].click()
    await flush()
    expect(onAll).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('shows radio options with the current one checked and reports a change', async () => {
    const onChange = vi.fn()
    const wrapper = await open([
      { label: 'Language', separator: true, radio: { value: 'es', options: [{ value: 'es', label: 'Spanish' }, { value: 'en', label: 'English' }], onChange } }
    ])
    await openSub('Language')
    const radios = [...document.body.querySelectorAll('[role="menuitemradio"]')]
    expect(radios.map(e => e.textContent.trim())).toEqual(['Spanish', 'English'])
    expect(radios[0].getAttribute('aria-checked')).toBe('true')
    radios[1].focus()
    radios[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    radios[1].click()
    await flush()
    expect(onChange).toHaveBeenCalledWith('en')
    wrapper.unmount()
  })
})
