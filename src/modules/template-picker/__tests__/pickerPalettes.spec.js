import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ templates: vi.fn(), impact: vi.fn(), apply: vi.fn(), preview: vi.fn(), quote: vi.fn() }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))
vi.mock('@/modules/payments/services/PaymentsService', () => ({ default: { quote: mocks.quote } }))

import TemplatePickerSheet from '../components/TemplatePickerSheet.vue'
import PaletteSwatches from '../components/PaletteSwatches.vue'
import { useTemplatePicker } from '../composables/useTemplatePicker'

const PRESETS = [
  { value: 'salvia', key: 'salvia', name: 'Salvia', label: { es: 'Salvia', en: 'Sage' }, colors: ['#eef3e8', '#7f9c78', '#3f5a3a'], palette: { background: '#eef3e8', text: '#3f5a3a', accent: '#7f9c78' } },
  { value: 'rosa', key: 'rosa', name: 'Rosa', label: { es: 'Rosa', en: 'Rose' }, colors: ['#fbeff1', '#c9657c', '#7b2d3f'], palette: { background: '#fbeff1', text: '#7b2d3f', accent: '#c9657c' } }
]
const LIST = [
  { id: 1, name: 'Clásica', tier: 'free', locked: false, current: true, description: { es: 'Elegante', en: 'Elegant' } },
  { id: 2, name: 'Botánica', tier: 'premium', locked: false, current: false, description: { es: 'Hojas', en: 'Leaves' }, presets: PRESETS },
  { id: 3, name: 'Miami', tier: 'premium', locked: true, current: false, description: { es: 'Noche', en: 'Night' }, presets: PRESETS }
]
const CLEAN = { templateId: 2, tier: 'premium', locked: false, keeps: [], resets: [], restoresFromStash: false, changesPublishedLook: false }
const text = () => document.body.textContent.replace(/\s+/g, ' ')
const button = label => [...document.body.querySelectorAll('button, a')].find(b => b.textContent.replace(/\s+/g, ' ').trim().includes(label))
const click = async label => {
  button(label).click()
  await flushPromises()
}
const pick = async name => {
  document.body.querySelector(`[data-testid=template-grid] button[aria-label^="${name}"]`).click()
  await flushPromises()
}
const swatch = name => document.body.querySelector(`[data-testid=palette-swatches] button[aria-label="${name}"]`)
const panelCalls = () => mocks.preview.mock.calls.filter(([, body]) => body.state).map(([, body]) => body)
const primary = () => document.body.querySelector('[data-testid=primary-action]')

let wrapper
async function mountSheet(props = {}, list = LIST) {
  mocks.templates.mockResolvedValue(structuredClone(list))
  wrapper = mount(TemplatePickerSheet, { props: { open: true, eventId: 5, ...props }, global: { plugins: [i18n] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  i18n.global.locale.value = 'es'
  Object.values(mocks).forEach(fn => fn.mockReset())
  mocks.preview.mockImplementation(async (e, body) => ({ locale: 'es', sections: [], theme: {}, marker: `${body.templateId ?? 'current'}-${body.preset ?? ''}` }))
  mocks.impact.mockResolvedValue({ ...CLEAN })
  mocks.apply.mockResolvedValue({ undo: { until: '2026-11-16T10:10:00Z', templateId: 1 } })
  mocks.quote.mockResolvedValue({ amountCents: 7900, currency: 'USD' })
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('PaletteSwatches', () => {
  const presets = [
    { key: 'a', label: { es: 'Alfa', en: 'Alpha' }, palette: { background: '#fff', text: '#000', accent: '#f00' } },
    { key: 'b', label: 'Beta', palette: { background: null, text: null, accent: null } }
  ]
  it('draws nothing with one palette or none, names the active one and emits the choice', async () => {
    const none = mount(PaletteSwatches, { props: { presets: presets.slice(0, 1) }, global: { plugins: [i18n] } })
    expect(none.find('[data-testid=palette-swatches]').exists()).toBe(false)
    const w = mount(PaletteSwatches, { props: { presets, modelValue: 'b' }, global: { plugins: [i18n] }, attachTo: document.body })
    expect(w.get('[role=status]').text()).toBe('Paleta de colores: Beta')
    const buttons = w.findAll('button')
    expect(buttons.map(b => b.attributes('aria-pressed'))).toEqual(['false', 'true'])
    expect(buttons[0].attributes('aria-label')).toBe('Alfa')
    await buttons[0].trigger('click')
    expect(w.emitted('update:modelValue')[0]).toEqual(['a'])
    await buttons[0].trigger('pointerenter')
    expect(w.emitted('hover')[0][0].key).toBe('a')
    await w.setProps({ modelValue: '' })
    expect(w.get('[role=status]').text()).toBe('Paleta de colores: Alfa')
    w.unmount()
  })
})

describe('TemplatePickerSheet palettes', () => {
  it('offers the palettes of the template, previews the chosen one and saves it with the template', async () => {
    await mountSheet()
    await pick('Botánica')
    expect(document.body.querySelectorAll('[data-testid=palette-swatches] button').length).toBe(2)
    expect(swatch('Salvia').getAttribute('aria-pressed')).toBe('true')
    await swatch('Rosa').click()
    await flushPromises()
    expect(panelCalls().at(-1)).toEqual({ templateId: 2, locale: 'es', state: 'invitation', preset: 'rosa' })
    primary().click()
    await flushPromises()
    expect(mocks.apply).toHaveBeenCalledWith(5, 2, { undo: false, preset: 'rosa' })
  })

  it('starts each template on its own palette and shows no swatches for the Clásica (nothing invented)', async () => {
    await mountSheet()
    expect(document.body.querySelector('[data-testid=palette-swatches]')).toBeNull()
    await pick('Botánica')
    await swatch('Rosa').click()
    await flushPromises()
    await pick('Clásica')
    await pick('Botánica')
    expect(swatch('Salvia').getAttribute('aria-pressed')).toBe('true')
  })

  it('on the template in use only a palette change enables "Guardar paleta", which saves without asking', async () => {
    const list = LIST.map(item => (item.id === 2 ? { ...item, current: true, activePreset: 'salvia' } : { ...item, current: false }))
    await mountSheet({}, list)
    expect(button('Ya la usas').disabled).toBe(true)
    await swatch('Salvia').click()
    await flushPromises()
    expect(button('Ya la usas')).toBeDefined()
    await swatch('Rosa').click()
    await flushPromises()
    expect(text()).toContain('Guardar paleta')
    primary().click()
    await flushPromises()
    expect(mocks.impact).not.toHaveBeenCalled()
    expect(mocks.apply).toHaveBeenCalledWith(5, 2, { undo: false, preset: 'rosa' })
    const [, template, undo, extra] = wrapper.emitted('changed')[0]
    expect(template.id).toBe(2)
    expect(undo.templateId).toBe(1)
    expect(extra).toEqual({ paletteOnly: true, name: 'Rosa' })
  })

  it('treats the first palette as the saved one when the API does not say, and asks before leaving unsaved palette changes', async () => {
    await mountSheet({}, LIST.map(item => (item.id === 2 ? { ...item, current: true } : { ...item, current: false })))
    await swatch('Salvia').click()
    await flushPromises()
    expect(button('Ya la usas')).toBeDefined()
    await swatch('Rosa').click()
    await flushPromises()
    await click('Cancelar')
    expect(document.body.querySelector('[data-testid=discard-ask]')).not.toBeNull()
  })

  it('carries the palette to the unlock bridge', async () => {
    await mountSheet()
    await pick('Miami')
    await swatch('Rosa').click()
    await flushPromises()
    primary().click()
    await flushPromises()
    expect(wrapper.emitted('unlock')[0][0].id).toBe(3)
    expect(wrapper.emitted('unlock')[0][1]).toBe('rosa')
  })

  it('reopens on the template and the palette she had chosen before paying', async () => {
    await mountSheet({ initialTemplateId: '3', initialPreset: 'rosa', fromPayment: true }, LIST.map(item => ({ ...item, locked: false })))
    expect(swatch('Rosa').getAttribute('aria-pressed')).toBe('true')
    expect(panelCalls().at(-1).preset).toBe('rosa')
    wrapper.unmount()
    await mountSheet({ initialTemplateId: '3', initialPreset: 'zzz', fromPayment: true }, LIST.map(item => ({ ...item, locked: false })))
    expect(swatch('Salvia').getAttribute('aria-pressed')).toBe('true')
  })
})

describe('TemplatePickerSheet compare and full view', () => {
  it('compares with the invitation as it is saved, only when the chosen one is not the current', async () => {
    await mountSheet()
    expect(document.body.querySelector('[data-testid=compare-toggle]')).toBeNull()
    await pick('Botánica')
    expect(document.body.querySelector('[data-testid=compare-current]')).toBeNull()
    document.body.querySelector('[data-testid=compare-toggle]').click()
    await flushPromises()
    expect(document.body.querySelector('[data-testid=compare-current]')).not.toBeNull()
    expect(mocks.preview).toHaveBeenCalledWith(5, expect.objectContaining({ templateId: undefined, state: 'invitation', locale: 'es' }))
    expect(document.body.querySelector('[data-testid=compare-toggle]').getAttribute('aria-pressed')).toBe('true')
    expect(text()).toContain('Dejar de comparar')
    await click('English')
    expect(mocks.preview).toHaveBeenCalledWith(5, expect.objectContaining({ templateId: undefined, locale: 'en' }))
    await pick('Clásica')
    expect(document.body.querySelector('[data-testid=compare-current]')).toBeNull()
    expect(document.body.querySelector('[data-testid=compare-toggle]')).toBeNull()
  })

  it('stops comparing on request and says when the current invitation cannot be drawn', async () => {
    await mountSheet()
    await pick('Botánica')
    mocks.preview.mockImplementation(async (e, body) => {
      if (body.templateId === undefined) throw new Error('x')
      return { sections: [] }
    })
    document.body.querySelector('[data-testid=compare-toggle]').click()
    await flushPromises()
    expect(document.body.querySelector('[data-testid=compare-current]').textContent).toContain('No pudimos mostrar tu invitación actual.')
    document.body.querySelector('[data-testid=compare-toggle]').click()
    await flushPromises()
    expect(document.body.querySelector('[data-testid=compare-current]')).toBeNull()
  })

  it('opens the whole invitation full screen with the template and palette being looked at', async () => {
    await mountSheet()
    await pick('Botánica')
    await swatch('Rosa').click()
    await flushPromises()
    await click('Ver invitación completa')
    const fullCalls = mocks.preview.mock.calls.map(([, body]) => body)
    expect(fullCalls.at(-1)).toMatchObject({ templateId: 2, locale: 'es', state: 'invitation', preset: 'rosa' })
    expect(document.body.querySelector('[data-testid=editor-preview]')).not.toBeNull()
  })
})

describe('preview cache and prefetch', () => {
  it('does not ask again for a combination already seen, and keeps the previous payload while the next loads', async () => {
    await mountSheet()
    await pick('Botánica')
    const before = panelCalls().length
    await swatch('Rosa').click()
    await flushPromises()
    await swatch('Salvia').click()
    await flushPromises()
    await swatch('Rosa').click()
    await flushPromises()
    // rosa and the explicit salvia are asked once each: going back and forth to rosa adds nothing
    expect(panelCalls().length - before).toBe(2)
  })

  it('warms a card and a swatch when they are looked at, once the pause is over', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      await mountSheet()
      await pick('Botánica')
      const before = panelCalls().length
      document.body.querySelector('[data-testid=template-grid] button[aria-label^="Miami"]').closest('div').dispatchEvent(new Event('pointerenter'))
      await vi.advanceTimersByTimeAsync(200)
      expect(panelCalls().length - before).toBe(1)
      expect(panelCalls().at(-1)).toEqual({ templateId: 3, locale: 'es', state: 'invitation', preset: undefined })
      swatch('Rosa').dispatchEvent(new Event('pointerenter'))
      await vi.advanceTimersByTimeAsync(200)
      expect(panelCalls().at(-1)).toEqual({ templateId: 2, locale: 'es', state: 'invitation', preset: 'rosa' })
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('useTemplatePicker cache and palette undo', () => {
  it('shares a request in flight, drops failures, forgets on demand and bounds its size', async () => {
    const picker = useTemplatePicker(5)
    let release
    mocks.preview.mockImplementation(() => new Promise(resolve => (release = () => resolve({ ok: 1 }))))
    const a = picker.loadPreview({ id: 1 }, { locale: 'es', state: 'invitation' })
    const b = picker.loadPreview({ id: 1 }, { locale: 'es', state: 'invitation' })
    release()
    await Promise.all([a, b])
    expect(mocks.preview).toHaveBeenCalledTimes(1)
    mocks.preview.mockReset()
    mocks.preview.mockRejectedValueOnce(new Error('x')).mockResolvedValue({ ok: 2 })
    await picker.loadPreview({ id: 2 }, { locale: 'es' })
    expect(picker.previewStatus.value).toBe('error')
    await picker.loadPreview({ id: 2 }, { locale: 'es' })
    expect(picker.previewStatus.value).toBe('ready')
    expect(mocks.preview).toHaveBeenCalledTimes(2)
    picker.clearPreviewCache()
    await picker.loadPreview({ id: 2 }, { locale: 'es' })
    expect(mocks.preview).toHaveBeenCalledTimes(3)
    for (let i = 10; i < 50; i++) await picker.loadPreview({ id: i }, { locale: 'es' })
    const calls = mocks.preview.mock.calls.length
    await picker.loadPreview({ id: 10 }, { locale: 'es' }) // evicted: asked again
    expect(mocks.preview.mock.calls.length).toBe(calls + 1)
  })

  it('never caches unsaved edits (fields) and prefetch ignores nothing and swallows failures', async () => {
    const picker = useTemplatePicker(5)
    mocks.preview.mockResolvedValue({ ok: 1 })
    await picker.loadPreview(null, { locale: 'es', fields: { a: 1 } })
    await picker.loadPreview(null, { locale: 'es', fields: { a: 1 } })
    expect(mocks.preview).toHaveBeenCalledTimes(2)
    picker.prefetchPreview(null)
    mocks.preview.mockRejectedValue(new Error('x'))
    picker.prefetchPreview({ id: 77 }, { locale: 'es' })
    await flushPromises()
    expect(mocks.preview).toHaveBeenCalledTimes(3)
  })

  it('undoing a palette-only change sends the old palette back (null clears it)', async () => {
    const picker = useTemplatePicker(5)
    mocks.templates.mockResolvedValue(structuredClone(LIST))
    await picker.load()
    mocks.apply.mockResolvedValueOnce({ undo: { until: 'x', templateId: 1, preset: null } }).mockResolvedValueOnce({ undo: null })
    await picker.apply({ id: 1 }, { preset: 'rosa' })
    expect(picker.templates.value.find(item => item.id === 1).activePreset).toBe('rosa')
    await picker.undoLast()
    expect(mocks.apply).toHaveBeenLastCalledWith(5, 1, { undo: true, preset: null })
    mocks.apply.mockResolvedValueOnce({ undo: { until: 'x', templateId: 1 } }).mockResolvedValueOnce({ undo: null })
    await picker.apply({ id: 2 })
    await picker.undoLast()
    expect(mocks.apply).toHaveBeenLastCalledWith(5, 1, { undo: true })
    expect(await picker.undoLast()).toEqual({ ok: false, code: 'other' })
  })
})
