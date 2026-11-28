import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DressCodeColors from '../components/DressCodeColors.vue'
import DressCodePalette from '../components/DressCodePalette.vue'

const media = matches => vi.stubGlobal('matchMedia', query => ({ matches, media: query, addEventListener() {}, removeEventListener() {} }))
let wrapper
const mountIt = (props = {}) => {
  wrapper = mount(DressCodeColors, {
    props: { modelValue: ['#C9A24B'], otherColors: ['#1F3A5F'], label: 'Reservados', sheetTitle: 'Colores reservados', blockedReason: 'Ya está en sugeridos', ...props },
    attachTo: document.body,
    global: { plugins: [i18n] }
  })
  return wrapper
}

beforeEach(() => setLocale('es'))
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('DressCodeColors on a wide screen', () => {
  beforeEach(() => media(true))

  it('adds a custom colour from the picker, ignores one that is not a colour or belongs to the other group', async () => {
    mountIt()
    await wrapper.get('[data-testid=dress-add]').trigger('click')
    const palette = wrapper.findComponent(DressCodePalette)
    palette.vm.$emit('custom', '#ff0000')
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual(['#C9A24B', '#FF0000'])
    palette.vm.$emit('custom', 'not-a-colour')
    palette.vm.$emit('custom', '#1f3a5f')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('picking a colour already chosen removes it, and nothing is added once the group is full', async () => {
    mountIt()
    await wrapper.get('[data-testid=dress-add]').trigger('click')
    wrapper.findComponent(DressCodePalette).vm.$emit('toggle', '#C9A24B')
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual([])
    await wrapper.setProps({ modelValue: ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888'] })
    wrapper.findComponent(DressCodePalette).vm.$emit('toggle', '#ABCDEF')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('closes the panel on Escape or a tap outside', async () => {
    mountIt()
    await wrapper.get('[data-testid=dress-add]').trigger('click')
    expect(wrapper.find('[data-testid=dress-panel]').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.find('[data-testid=dress-panel]').exists()).toBe(false)
    await wrapper.get('[data-testid=dress-add]').trigger('click')
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await flushPromises()
    expect(wrapper.find('[data-testid=dress-panel]').exists()).toBe(false)
  })
})

describe('DressCodeColors on a phone', () => {
  beforeEach(() => media(false))

  it('opens the palette in a sheet, takes a custom colour from it and closes with "Listo"', async () => {
    mountIt()
    await wrapper.get('[data-testid=dress-add]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid=dress-panel]').exists()).toBe(false)
    expect(document.body.textContent).toContain('Colores reservados')
    wrapper.findComponent(DressCodePalette).vm.$emit('custom', '#00ff00')
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual(['#C9A24B', '#00FF00'])
    wrapper.findComponent(DressCodePalette).vm.$emit('toggle', '#C9A24B')
    expect(wrapper.emitted('update:modelValue')[1][0]).toEqual([])
    document.querySelector('[data-testid=dress-done]').click()
    await flushPromises()
    expect(document.querySelector('[data-testid=dress-done]')).toBeNull()
  })
})

describe('DressCodePalette custom colour', () => {
  it('sends the colour picked with the native picker', async () => {
    const w = mount(DressCodePalette, { global: { plugins: [i18n] } })
    const input = w.get('input[type=color]')
    input.element.value = '#123456'
    await input.trigger('change')
    expect(w.emitted('custom')[0]).toEqual(['#123456'])
  })

  it('disables the picker and every unselected swatch once the group is full', () => {
    const w = mount(DressCodePalette, { props: { full: true, selected: [], blocked: [] }, global: { plugins: [i18n] } })
    expect(w.get('input[type=color]').attributes('disabled')).toBeDefined()
    expect(w.findAll('button[data-swatch]').every(b => b.attributes('disabled') !== undefined)).toBe(true)
  })
})
