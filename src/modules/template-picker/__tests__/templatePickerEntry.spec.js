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

import TemplatePickerEntry from '../components/TemplatePickerEntry.vue'

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
    await click('Desbloquear para usarla')
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
    expect(mocks.apply).toHaveBeenLastCalledWith(5, 1, { confirm: false })
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
})
