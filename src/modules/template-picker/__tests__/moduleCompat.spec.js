import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import i18n from '@/locales/i18n'
import { conflictingModules, activeModuleKeys, missingModulesOf, moduleNames, templateMissingFrom } from '../utils/templatePicker'

const mocks = vi.hoisted(() => ({ templates: vi.fn(), impact: vi.fn(), apply: vi.fn(), preview: vi.fn(), quote: vi.fn() }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))
vi.mock('@/modules/payments/services/PaymentsService', () => ({ default: { quote: mocks.quote } }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => ({ activeEvent: { modules: [{ key: 'comments', state: 'active' }] } }) }))

import TemplateCard from '../components/TemplateCard.vue'
import TemplatePickerSheet from '../components/TemplatePickerSheet.vue'
import ModuleTemplateNotice from '../components/ModuleTemplateNotice.vue'

const apiError = (status, data) => Object.assign(new Error('x'), { response: { status, data } })
const text = () => document.body.textContent.replace(/\s+/g, ' ')
const button = label => [...document.body.querySelectorAll('button, a')].find(b => b.textContent.replace(/\s+/g, ' ').trim().includes(label))
const click = async label => {
  button(label).click()
  await flushPromises()
}

const LIST = [
  { id: 1, name: 'Clásica', tier: 'free', locked: false, current: true, previewImage: null, description: 'x', missingModules: [] },
  { id: 2, name: 'Mínima', tier: 'free', locked: false, current: false, previewImage: null, description: 'y', missingModules: ['comments', 'seating'] }
]
const IMPACT = { templateId: 2, tier: 'free', locked: false, willPin: false, keeps: [], resets: [], restoresFromStash: false, changesPublishedLook: false }

let wrapper
beforeEach(() => {
  setActivePinia(createPinia())
  i18n.global.locale.value = 'es'
  Object.values(mocks).forEach(fn => fn.mockReset())
  mocks.templates.mockResolvedValue(structuredClone(LIST))
  mocks.preview.mockResolvedValue({ locale: 'es', sections: [], theme: {} })
  mocks.impact.mockResolvedValue(structuredClone(IMPACT))
  mocks.apply.mockResolvedValue({ undo: null })
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('module compatibility helpers', () => {
  it('reads the 409 template_missing_module and ignores other errors', () => {
    expect(templateMissingFrom(apiError(409, { code: 'template_missing_module', module: 'comments', template: { slug: 's', name: 'Mínima' } }))).toEqual({ module: 'comments', templateName: 'Mínima' })
    expect(templateMissingFrom(apiError(409, { code: 'template_locked' }))).toBeNull()
    expect(templateMissingFrom(apiError(403, { code: 'template_missing_module' }))).toBeNull()
  })
  it('intersects missing and active modules', () => {
    expect(conflictingModules({ missingModules: ['comments', 'seating'] }, ['seating', 'rsvp'])).toEqual(['seating'])
    expect(conflictingModules({}, ['seating'])).toEqual([])
    expect(missingModulesOf({ missingModules: null })).toEqual([])
    expect(activeModuleKeys([{ key: 'comments', state: 'active' }, { key: 'seating', state: 'locked' }])).toEqual(['comments'])
  })
  it('translates module names', () => {
    const t = i18n.global.t
    const te = i18n.global.te
    expect(moduleNames(['comments', 'seating', 'zzz'], { t, te })).toEqual(['Comentarios', 'Mesas', 'zzz'])
    expect(moduleNames(['suggested_music'], { t, te })).toEqual(['Música sugerida'])
  })
})

describe('TemplateCard', () => {
  it('shows "No incluye" with translated names and stays enabled', () => {
    wrapper = mount(TemplateCard, { props: { template: LIST[1] }, global: { plugins: [i18n] } })
    expect(wrapper.get('[data-testid="template-missing"]').text()).toBe('No incluye: Comentarios, Mesas')
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
    i18n.global.locale.value = 'en'
    return wrapper.vm.$nextTick().then(() => expect(wrapper.get('[data-testid="template-missing"]').text()).toBe('Does not include: Comments, Seating'))
  })
  it('shows nothing when the template is complete', () => {
    wrapper = mount(TemplateCard, { props: { template: LIST[0] }, global: { plugins: [i18n] } })
    expect(wrapper.find('[data-testid="template-missing"]').exists()).toBe(false)
  })
})

describe('TemplatePickerSheet confirmation', () => {
  async function toUse(activeModules) {
    wrapper = mount(TemplatePickerSheet, { props: { open: true, eventId: 5, activeModules }, global: { plugins: [i18n] }, attachTo: document.body })
    await flushPromises()
    document.body.querySelectorAll('ul li button')[1].click()
    await flushPromises()
    await click('Usar esta plantilla')
  }
  it('asks before going on when the template lacks an active module, and accept continues', async () => {
    await toUse(['comments'])
    expect(text()).toContain('Esta plantilla no incluye Comentarios, que tienes activo. No se mostrará en tu invitación. ¿Cambiar de todos modos?')
    expect(mocks.impact).not.toHaveBeenCalled()
    await click('Cambiar de todos modos')
    expect(mocks.impact).toHaveBeenCalled()
    await click('Cambiar')
    expect(mocks.apply).toHaveBeenCalledTimes(1)
  })
  it('cancelling the dialog keeps the preview and applies nothing', async () => {
    await toUse(['seating'])
    await click('Mejor no')
    expect(text()).not.toContain('Cambiar de todos modos')
    expect(mocks.apply).not.toHaveBeenCalled()
  })
  it('does not ask when the missing modules are not active', async () => {
    await toUse(['rsvp'])
    expect(text()).not.toContain('Cambiar de todos modos')
    expect(mocks.impact).toHaveBeenCalled()
  })
})

describe('ModuleTemplateNotice', () => {
  it('names the module and the template and opens the selector', async () => {
    wrapper = mount(ModuleTemplateNotice, { props: { eventId: 5, module: 'comments', templateName: 'Mínima' }, global: { plugins: [i18n] }, attachTo: document.body })
    expect(wrapper.text()).toContain('No se puede activar Comentarios: la plantilla «Mínima» no lo incluye.')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(mocks.templates).toHaveBeenCalled()
    expect(text()).toContain('Elige tu plantilla')
  })
})
