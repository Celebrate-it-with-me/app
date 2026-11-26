import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({
  templates: vi.fn(),
  impact: vi.fn(),
  apply: vi.fn(),
  preview: vi.fn(),
  quote: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  query: {}
}))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))
vi.mock('@/modules/payments/services/PaymentsService', () => ({ default: { quote: mocks.quote } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ query: mocks.query }), useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => ({ activeEvent: { modules: [{ key: 'comments', state: 'active' }] } }) }))

import TemplatePickerEntry from '../components/TemplatePickerEntry.vue'
import { useToast } from '@/ui'

const LIST = [
  { id: 1, name: 'Clásica', tier: 'free', locked: false, current: true, previewImage: null, description: { es: 'a', en: 'a' } },
  { id: 3, name: 'Botánica', tier: 'premium', locked: true, current: false, previewImage: null, description: { es: 'b', en: 'b' } }
]
const text = () => document.body.textContent.replace(/\s+/g, ' ')
const button = label => {
  const all = [...document.body.querySelectorAll('button, a')]
  const clean = b => b.textContent.replace(/\s+/g, ' ').trim()
  return all.find(b => clean(b) === label) ?? all.find(b => clean(b).includes(label))
}
const click = async label => {
  button(label).click()
  await flushPromises()
}

let wrapper
async function mountEntry(props = {}) {
  wrapper = mount(TemplatePickerEntry, { props: { eventId: 5, ...props }, global: { plugins: [i18n] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  i18n.global.locale.value = 'es'
  Object.values(mocks).forEach(fn => typeof fn?.mockReset === 'function' && fn.mockReset())
  for (const key of Object.keys(mocks.query)) delete mocks.query[key]
  mocks.templates.mockResolvedValue(structuredClone(LIST))
  mocks.preview.mockResolvedValue({ locale: 'es', sections: [], theme: {} })
  mocks.impact.mockResolvedValue({ templateId: 3, tier: 'premium', locked: false, keeps: [], resets: [] })
  mocks.quote.mockResolvedValue({ amountCents: 7900, currency: 'USD' })
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('TemplatePickerEntry', () => {
  it('draws the real miniature (not an empty icon) and waits for the current template before mounting it', async () => {
    await mountEntry()
    const mini = wrapper.get('[data-testid=invitation-miniature]')
    expect(mini.attributes('style')).toContain('width: 56px')
    expect(wrapper.find('svg.lucide-image-off').exists()).toBe(false)
  })

  it('uses the template image as fallback and skips the live view when she cannot edit', async () => {
    mocks.templates.mockResolvedValue([{ ...LIST[0], previewImage: 'https://cdn.test/a.webp' }])
    await mountEntry({ disabled: true })
    expect(wrapper.get('[data-testid=miniature-image]').attributes('src')).toBe('https://cdn.test/a.webp')
    expect(mocks.preview).not.toHaveBeenCalled()
  })

  it('shows the template in use read from the list when the editor does not pass it', async () => {
    await mountEntry()
    expect(text()).toContain('Clásica')
    expect(text()).toContain('Gratis')
    expect(button('Cambiar plantilla').disabled).toBe(false)
  })

  it('goes to the unlock screen of the full event with the template in the address', async () => {
    await mountEntry()
    await click('Cambiar plantilla')
    await click('Botánica')
    await click('Desbloquear')
    expect(mocks.push).toHaveBeenCalledWith({ name: 'unlock', params: { module: 'full' }, query: { from: 'template', template: '3' } })
  })

  it('reopens on the wanted template when she comes back from the payment and cleans the address', async () => {
    mocks.query.template = '3'
    mocks.query.other = 'x'
    mocks.templates.mockResolvedValue(LIST.map(item => (item.id === 3 ? { ...item, locked: false } : item)))
    await mountEntry()
    expect(text()).toContain('Ya desbloqueaste tu evento')
    expect(mocks.replace).toHaveBeenCalledWith({ query: { other: 'x' } })
  })

  it('after a change shows an undo notice that goes back to the previous template and tells the editor', async () => {
    mocks.apply.mockResolvedValueOnce({ undo: { until: new Date(Date.now() + 600000).toISOString(), templateId: 1 } }).mockResolvedValueOnce({ undo: null })
    mocks.templates.mockResolvedValue(LIST.map(item => ({ ...item, locked: false })))
    await mountEntry()
    await click('Cambiar plantilla')
    await click('Botánica')
    await click('Usar esta plantilla')
    await click('Cambiar')
    expect(wrapper.emitted('changed')).toHaveLength(1)
    expect(text()).toContain('Antes usabas Clásica')
    await click('Deshacer')
    expect(mocks.apply).toHaveBeenLastCalledWith(5, 1, { undo: true })
    expect(wrapper.emitted('changed')).toHaveLength(2)
    expect(text()).not.toContain('Antes usabas')
  })

  it('disables the change when the invitation is published and explains who does it', async () => {
    await mountEntry({ templateLocked: true })
    expect(button('Cambiar plantilla').disabled).toBe(true)
    expect(text()).toContain('conservamos tus enlaces')
    expect(button('Contactar con soporte').getAttribute('href')).toMatch(/^mailto:/)
  })

  it('warns when the template of the event is gone', async () => {
    await mountEntry({ unavailable: true })
    expect(text()).toContain('Tu plantilla ya no está disponible')
  })

  const PRESETS = [
    { key: 'salvia', label: { es: 'Salvia', en: 'Sage' }, palette: { background: '#eef3e8', text: '#3f5a3a', accent: '#7f9c78' } },
    { key: 'rosa', label: { es: 'Rosa', en: 'Rose' }, palette: { background: '#fbeff1', text: '#7b2d3f', accent: '#c9657c' } }
  ]
  const withPresets = locked => LIST.map(item => (item.id === 3 ? { ...item, locked, presets: PRESETS } : item))
  const toasts = () => {
    const { toasts: list, dismiss } = useToast()
    return { list, clear: () => [...list].forEach(item => dismiss(item.id)) }
  }

  it('takes the palette to the unlock screen and back', async () => {
    mocks.templates.mockResolvedValue(withPresets(true))
    await mountEntry()
    await click('Cambiar plantilla')
    await click('Botánica')
    document.body.querySelector('[data-testid=palette-swatches] button[aria-label="Rosa"]').click()
    await flushPromises()
    await click('Desbloquear')
    expect(mocks.push).toHaveBeenCalledWith({ name: 'unlock', params: { module: 'full' }, query: { from: 'template', template: '3', preset: 'rosa' } })
  })

  it('reopens on the palette she had chosen when she comes back from the payment', async () => {
    mocks.query.template = '3'
    mocks.query.preset = 'rosa'
    mocks.templates.mockResolvedValue(withPresets(false))
    await mountEntry()
    expect(document.body.querySelector('[data-testid=palette-swatches] button[aria-label="Rosa"]').getAttribute('aria-pressed')).toBe('true')
    expect(mocks.replace).toHaveBeenCalledWith({ query: {} })
  })

  it('says "Listo" with an Undo action in a toast that goes back to the previous template', async () => {
    const { list, clear } = toasts()
    clear()
    mocks.apply.mockResolvedValueOnce({ undo: { until: new Date(Date.now() + 600000).toISOString(), templateId: 1 } }).mockResolvedValueOnce({ undo: null })
    mocks.templates.mockResolvedValue(LIST.map(item => ({ ...item, locked: false })))
    await mountEntry()
    await click('Cambiar plantilla')
    await click('Botánica')
    await click('Usar esta plantilla')
    await click('Cambiar')
    const toast = list.find(item => item.title === 'Listo, ahora usas Botánica.')
    expect(toast.action.label).toBe('Deshacer')
    await toast.action.onClick()
    await flushPromises()
    expect(mocks.apply).toHaveBeenLastCalledWith(5, 1, { undo: true })
    expect(wrapper.emitted('changed')).toHaveLength(2)
    clear()
  })

  it('a palette saved on its own gets its own toast and no "before you used" notice', async () => {
    const { list, clear } = toasts()
    clear()
    mocks.templates.mockResolvedValue(LIST.map(item => (item.id === 1 ? { ...item, presets: PRESETS } : item)))
    mocks.apply.mockResolvedValue({ undo: { until: new Date(Date.now() + 600000).toISOString(), templateId: 1, preset: null } })
    await mountEntry()
    await click('Cambiar plantilla')
    document.body.querySelector('[data-testid=palette-swatches] button[aria-label="Rosa"]').click()
    await flushPromises()
    await click('Guardar paleta')
    expect(list.some(item => item.title === 'Listo, la paleta Rosa quedó guardada.' && item.action?.label === 'Deshacer')).toBe(true)
    expect(text()).not.toContain('Antes usabas')
    clear()
  })

  it('gives the selector the stage of the invitation', async () => {
    await mountEntry({ stage: 'save_the_date' })
    await click('Cambiar plantilla')
    expect(mocks.preview.mock.calls.filter(([, body]) => body.state).at(-1)[1].state).toBe('save_the_date')
  })
})
