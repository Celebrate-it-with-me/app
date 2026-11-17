import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ templates: vi.fn(), impact: vi.fn(), apply: vi.fn(), preview: vi.fn(), quote: vi.fn(), event: { id: 5, modules: [] } }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))
vi.mock('@/modules/payments/services/PaymentsService', () => ({ default: { quote: mocks.quote } }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => ({ activeEvent: mocks.event }) }))

import ModuleTemplateGate from '../components/ModuleTemplateGate.vue'

let wrapper
const mountGate = async module => {
  wrapper = mount(ModuleTemplateGate, { props: { module }, global: { plugins: [i18n] }, attachTo: document.body })
  await flushPromises()
}
const list = missingModules => [{ id: 1, name: 'Paquete', tier: 'free', current: true, missingModules }, { id: 2, name: 'Otra', tier: 'free', current: false, missingModules: ['comments'] }]

beforeEach(() => {
  i18n.global.locale.value = 'es'
  mocks.templates.mockReset()
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('ModuleTemplateGate', () => {
  it('shows the fixed notice when the current template lacks the module, and its button opens the selector', async () => {
    mocks.templates.mockResolvedValue(list(['comments']))
    await mountGate('comments')
    expect(wrapper.text()).toContain('Tu plantilla actual no muestra comentarios en la invitación.')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(document.body.textContent).toContain('Elige tu plantilla')
  })
  it('speaks English', async () => {
    i18n.global.locale.value = 'en'
    mocks.templates.mockResolvedValue(list(['seating']))
    await mountGate('seating')
    expect(wrapper.text()).toContain('Your current template does not show seating on the invitation.')
    expect(wrapper.text()).toContain('Change template')
  })
  it('shows nothing when the current template has the module (only another template lacks it)', async () => {
    mocks.templates.mockResolvedValue(list(['seating']))
    await mountGate('comments')
    expect(wrapper.find('[data-testid="module-template-notice"]').exists()).toBe(false)
  })
  it('shows nothing for a native template (empty or absent missingModules)', async () => {
    mocks.templates.mockResolvedValue(list([]))
    await mountGate('comments')
    expect(wrapper.find('[data-testid="module-template-notice"]').exists()).toBe(false)
    mocks.templates.mockResolvedValue([{ id: 1, current: true }])
    wrapper.unmount()
    await mountGate('comments')
    expect(wrapper.find('[data-testid="module-template-notice"]').exists()).toBe(false)
  })
  it('shows nothing while loading or when the read fails', async () => {
    mocks.templates.mockReturnValue(new Promise(() => {}))
    await mountGate('comments')
    expect(wrapper.find('[data-testid="module-template-notice"]').exists()).toBe(false)
    wrapper.unmount()
    mocks.templates.mockRejectedValue(new Error('x'))
    await mountGate('comments')
    expect(wrapper.find('[data-testid="module-template-notice"]').exists()).toBe(false)
  })
})
