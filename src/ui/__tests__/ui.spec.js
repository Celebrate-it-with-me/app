import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { UiBottomSheet, UiDropdown, UiButton, UiSwitch, UiField, UiInput, UiBadge, UiPagination, UiAvatar, UiSelect, useToast } from '@/ui'
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

describe('touch targets', () => {
  it('grows the small icon button, the switch, and leaves the 44 px ones alone', () => {
    expect(mount(UiButton, { props: { icon: true, size: 'sm' } }).classes()).toContain('touch-target')
    expect(mount(UiButton, { props: { icon: true, size: 'md' } }).classes()).not.toContain('touch-target')
    expect(mount(UiButton, { props: { size: 'sm' } }).classes()).not.toContain('touch-target')
    const wrapper = mount(UiSwitch, { props: { label: 'x' } })
    expect(wrapper.get('[role=switch]').classes()).toContain('touch-target')
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

  it('accepts a rich hint (a link) in the hint slot and describes the control with it', async () => {
    const wrapper = mount({
      components: { UiField, UiInput },
      template: `<UiField label="Correo"><UiInput model-value="" /><template #hint>Escribe a <a href="mailto:a@b.c">a@b.c</a></template></UiField>`
    })
    await nextTick()
    expect(wrapper.get('p a').attributes('href')).toBe('mailto:a@b.c')
    expect(wrapper.get('input').attributes('aria-describedby')).toBe(wrapper.get('p').attributes('id'))
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
  it('does not stack identical toasts and keeps at most three', () => {
    const { toasts, toast, dismiss } = useToast()
    ;[...toasts].forEach(t => dismiss(t.id))
    const first = toast({ title: 'Igual', tone: 'success' })
    expect(toast({ title: 'Igual', tone: 'success' })).toBe(first)
    expect(toasts.length).toBe(1)
    toast('b')
    toast('c')
    toast('d')
    expect(toasts.map(t => t.title)).toEqual(['b', 'c', 'd'])
    ;[...toasts].forEach(t => dismiss(t.id))
  })

  it('queues and dismisses toasts', () => {
    const { toasts, toast, dismiss } = useToast()
    const before = toasts.length
    const id = toast({ title: 'Hola' })
    expect(toasts.length).toBe(before + 1)
    dismiss(id)
    expect(toasts.length).toBe(before)
  })
})

describe('UiSelect lazy', () => {
  const options = [
    { value: 'event', label: 'The event' },
    { value: 'es', label: 'Spanish' }
  ]

  it('draws a plain combobox button with the current label, and the id the label points to', () => {
    const wrapper = mount(UiSelect, { props: { id: 'lang', modelValue: 'es', options, lazy: true }, attachTo: document.body })
    const button = wrapper.get('button#lang')
    expect(button.attributes('role')).toBe('combobox')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.text()).toBe('Spanish')
    wrapper.unmount()
  })

  it('mounts the real select (open) on the first click', async () => {
    const wrapper = mount(UiSelect, { props: { id: 'lang', modelValue: 'es', options, lazy: true }, attachTo: document.body })
    await wrapper.get('button#lang').trigger('click')
    await nextTick()
    expect(wrapper.find('button#lang').attributes('data-state')).toBe('open')
    wrapper.unmount()
  })

  it('is the real select straight away when it is not lazy', () => {
    const wrapper = mount(UiSelect, { props: { id: 'lang', modelValue: 'es', options }, attachTo: document.body })
    expect(wrapper.get('button#lang').attributes('data-state')).toBe('closed')
    wrapper.unmount()
  })
})

describe('UiSelect accessible name (ORG-020)', () => {
  const options = [{ value: 'a', label: 'A' }]

  it('puts aria-label and aria-labelledby on the trigger, in the real select and in the lazy button', () => {
    const real = mount(UiSelect, { props: { id: 's1', modelValue: 'a', options, ariaLabel: 'Sort by' }, attachTo: document.body })
    expect(real.get('button#s1').attributes('aria-label')).toBe('Sort by')
    const lazy = mount(UiSelect, { props: { id: 's2', modelValue: 'a', options, ariaLabelledby: 'caption', lazy: true }, attachTo: document.body })
    expect(lazy.get('button#s2').attributes('aria-labelledby')).toBe('caption')
    real.unmount()
    lazy.unmount()
  })

  it('warns in development when nothing names it, and stays quiet when something does', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const nameless = mount(UiSelect, { props: { id: 's3', modelValue: 'a', options }, attachTo: document.body })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('No accessible name'))
    warn.mockClear()
    const named = mount(UiSelect, { props: { id: 's4', modelValue: 'a', options, ariaLabel: 'Sort by' }, attachTo: document.body })
    const label = document.createElement('label')
    label.setAttribute('for', 's5')
    label.textContent = 'Language'
    document.body.append(label)
    const labelled = mount(UiSelect, { props: { id: 's5', modelValue: 'a', options }, attachTo: document.body })
    expect(warn).not.toHaveBeenCalled()
    ;[nameless, named, labelled].forEach(w => w.unmount())
    label.remove()
    warn.mockRestore()
  })
})

describe('UiModal fullscreenMobile', () => {
  it('covers the phone screen and keeps the centered card on larger ones', async () => {
    const { mount } = await import('@vue/test-utils')
    const { nextTick } = await import('vue')
    const { UiModal } = await import('../index.js')
    const wrapper = mount(UiModal, { props: { open: true, title: 'x', fullscreenMobile: true }, attachTo: document.body })
    await nextTick()
    const content = document.body.querySelector('[role="dialog"]')
    expect(content.className).toContain('h-dvh')
    expect(content.className).toContain('rounded-none')
    expect(content.className).not.toContain('rounded-t-2xl')
    wrapper.unmount()
    const plain = mount(UiModal, { props: { open: true, title: 'x' }, attachTo: document.body })
    await nextTick()
    expect(document.body.querySelector('[role="dialog"]').className).toContain('rounded-t-2xl')
    plain.unmount()
  })
})

describe('UiModal kit additions', () => {
  it('xl is wider and bare leaves the body without padding or its own scroll', async () => {
    const { mount } = await import('@vue/test-utils')
    const { nextTick } = await import('vue')
    const { UiModal } = await import('../index.js')
    const wrapper = mount(UiModal, {
      props: { open: true, title: 'x', size: 'xl', bare: true },
      slots: { default: '<p id="inner">hi</p>', footer: '<button>ok</button>' },
      attachTo: document.body
    })
    await nextTick()
    const content = document.body.querySelector('[role="dialog"]')
    expect(content.className).toContain('sm:max-w-6xl')
    const body = document.body.querySelector('#inner').parentElement
    expect(body.className).toContain('overflow-hidden')
    expect(body.className).not.toContain('overflow-y-auto')
    expect(body.className).not.toContain('px-5')
    expect(content.innerHTML).toContain('safe-area-inset-bottom')
    wrapper.unmount()
    const normal = mount(UiModal, { props: { open: true, title: 'x' }, slots: { default: '<p id="inner2">hi</p>' }, attachTo: document.body })
    await nextTick()
    expect(document.body.querySelector('#inner2').parentElement.className).toContain('overflow-y-auto')
    normal.unmount()
  })
})

describe('UiToaster action', () => {
  it('gives an action toast a longer life and runs the action once, closing the toast', async () => {
    const { mount } = await import('@vue/test-utils')
    const { nextTick } = await import('vue')
    const { UiToaster } = await import('../index.js')
    const { toasts, toast, dismiss } = useToast()
    ;[...toasts].forEach(t => dismiss(t.id))
    const onClick = vi.fn()
    const id = toast({ title: 'Listo', action: { label: 'Deshacer', onClick } })
    expect(toasts.find(t => t.id === id).duration).toBe(10000)
    expect(toast({ title: 'Otro', duration: 2000, action: { label: 'x' } })).toBeGreaterThan(id)
    expect(toasts.find(t => t.title === 'Otro').duration).toBe(2000)
    const wrapper = mount(UiToaster, { attachTo: document.body })
    await nextTick()
    const button = [...document.body.querySelectorAll('button')].find(b => b.textContent.trim() === 'Deshacer')
    expect(button).toBeTruthy()
    button.click()
    await nextTick()
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(toasts.find(t => t.id === id)).toBeUndefined()
    wrapper.unmount()
    ;[...toasts].forEach(t => dismiss(t.id))
  })

  it('does not draw an action button when there is no action', async () => {
    const { mount } = await import('@vue/test-utils')
    const { nextTick } = await import('vue')
    const { UiToaster } = await import('../index.js')
    const { toasts, toast, dismiss } = useToast()
    ;[...toasts].forEach(t => dismiss(t.id))
    toast({ title: 'Solo aviso' })
    const wrapper = mount(UiToaster, { attachTo: document.body })
    await nextTick()
    expect(document.body.textContent).toContain('Solo aviso')
    expect(document.body.querySelectorAll('[data-reka-toast-action], [data-radix-toast-action]').length).toBe(0)
    wrapper.unmount()
    ;[...toasts].forEach(t => dismiss(t.id))
  })
})

describe('UiBottomSheet', () => {
  it('is a dialog with the title, an optional subtitle and the content; Escape asks to close it', async () => {
    const wrapper = mount(UiBottomSheet, { props: { open: true, title: 'Ana Perez', subtitle: 'Idioma' }, slots: { default: '<p id="inside">hola</p>' }, attachTo: document.body })
    await nextTick()
    const dialog = document.body.querySelector('[data-testid="bottom-sheet"]')
    expect(dialog.getAttribute('role')).toBe('dialog')
    expect(dialog.querySelector('h2').textContent).toBe('Ana Perez')
    expect(dialog.querySelector('[data-testid="bottom-sheet-subtitle"]').textContent).toBe('Idioma')
    expect(dialog.querySelector('#inside')).not.toBeNull()
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
    wrapper.unmount()
    document.body.innerHTML = ''
  })

  it('renders nothing while closed', () => {
    const wrapper = mount(UiBottomSheet, { props: { open: false, title: 'x' }, attachTo: document.body })
    expect(document.body.querySelector('[data-testid="bottom-sheet"]')).toBeNull()
    wrapper.unmount()
  })
})

describe('UiDropdown submenus', () => {
  const open = async items => {
    const wrapper = mount(UiDropdown, { props: { items }, slots: { trigger: '<button id="t">menu</button>' }, attachTo: document.body })
    document.getElementById('t').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    await nextTick()
    return wrapper
  }

  it('shows an item with children as a submenu trigger, and radio choices with the current one checked', async () => {
    const onChange = vi.fn()
    const wrapper = await open([
      { label: 'Plain', onSelect: () => {} },
      { label: 'Language', radio: { value: 'es', options: [{ value: 'es', label: 'Spanish' }, { value: 'en', label: 'English' }], onChange } },
      { label: 'Download', children: [{ label: 'All', onSelect: () => {} }] }
    ])
    const entries = [...document.body.querySelectorAll('[role="menuitem"]')].map(e => e.textContent.trim())
    expect(entries).toEqual(['Plain', 'Language', 'Download'])
    const triggers = [...document.body.querySelectorAll('[aria-haspopup="menu"]')].filter(e => e.getAttribute('role') === 'menuitem')
    expect(triggers).toHaveLength(2)
    wrapper.unmount()
    document.body.innerHTML = ''
  })
})

