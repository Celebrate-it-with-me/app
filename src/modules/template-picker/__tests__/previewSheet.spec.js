import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ templates: vi.fn(), preview: vi.fn(), store: { activeEvent: null } }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => mocks.store }))

import InvitationPreviewSheet from '../components/InvitationPreviewSheet.vue'
import ModuleTemplateGate from '../components/ModuleTemplateGate.vue'

const PAYLOAD = { locale: 'es', sections: [{ type: 'closing', title: 'Gracias', data: {} }] }

describe('InvitationPreviewSheet', () => {
  let w
  const body = () => document.body
  const button = label => [...body().querySelectorAll('button')].find(b => b.textContent.trim() === label)
  const click = async el => {
    el.click()
    await flushPromises()
  }
  const mountSheet = async (props = {}) => {
    w = mount(InvitationPreviewSheet, { props: { open: true, eventId: 5, fields: { cover_text: 'Hola' }, ...props }, global: { plugins: [i18n] }, attachTo: document.body })
    await flushPromises()
  }

  beforeEach(() => {
    i18n.global.locale.value = 'es'
    mocks.preview.mockReset().mockResolvedValue(PAYLOAD)
  })
  afterEach(() => {
    w?.unmount()
    document.body.innerHTML = ''
  })

  it('renders the unsaved edits with the interface language and the invitation stage', async () => {
    await mountSheet()
    expect(mocks.preview).toHaveBeenCalledWith(5, expect.objectContaining({ locale: 'es', state: 'invitation', fields: { cover_text: 'Hola' } }))
    expect(body().querySelector('iframe[src="/preview/invitation"]')).not.toBeNull()
    expect(body().querySelector('[role=status]')).toBeNull()
  })

  it('starts in English when the interface is English', async () => {
    i18n.global.locale.value = 'en'
    await mountSheet()
    expect(mocks.preview).toHaveBeenCalledWith(5, expect.objectContaining({ locale: 'en' }))
  })

  it('shows a loading status while the preview is on its way', async () => {
    mocks.preview.mockReturnValue(new Promise(() => {}))
    await mountSheet()
    expect(body().querySelector('[role=status]')).not.toBeNull()
    expect(body().querySelector('iframe')).toBeNull()
  })

  it('asks again when the language or the stage is changed', async () => {
    await mountSheet()
    await click(button('English'))
    expect(mocks.preview).toHaveBeenLastCalledWith(5, expect.objectContaining({ locale: 'en' }))
    await click(button(i18n.global.t('templatePicker.preview.states.noPhoto')))
    expect(mocks.preview).toHaveBeenLastCalledWith(5, expect.objectContaining({ state: 'no_photo' }))
  })

  it('offers a retry when the preview fails', async () => {
    mocks.preview.mockRejectedValueOnce({ response: { status: 500, data: {} } })
    await mountSheet()
    const alert = body().querySelector('[role=alert]')
    expect(alert.textContent).toContain(i18n.global.t('templatePicker.preview.failed'))
    await click(button(i18n.global.t('templatePicker.retry')))
    expect(mocks.preview).toHaveBeenCalledTimes(2)
    expect(body().querySelector('[role=alert]')).toBeNull()
  })

  it('does not offer a retry when the role cannot preview (403)', async () => {
    mocks.preview.mockRejectedValue({ response: { status: 403, data: {} } })
    await mountSheet()
    expect(body().querySelector('[role=alert]').textContent).toContain(i18n.global.t('templatePicker.errors.previewForbidden'))
    expect(button(i18n.global.t('templatePicker.retry'))).toBeUndefined()
  })

  it('previews nothing while closed, loads when opened, and forgets the preview when closed', async () => {
    await mountSheet({ open: false })
    expect(mocks.preview).not.toHaveBeenCalled()
    await w.setProps({ open: true })
    await flushPromises()
    expect(mocks.preview).toHaveBeenCalledTimes(1)
    await w.setProps({ open: false })
    await flushPromises()
    expect(body().querySelector('iframe')).toBeNull()
  })

  it('the close button asks the parent to close it', async () => {
    await mountSheet()
    await click(button(i18n.global.t('invitationEditor.previewClose')))
    expect(w.emitted('update:open')[0]).toEqual([false])
  })
})

describe('ModuleTemplateGate event changes', () => {
  let w
  const state = reactive({ activeEvent: null })
  beforeEach(() => {
    i18n.global.locale.value = 'es'
    mocks.templates.mockReset()
    mocks.store = state
    state.activeEvent = null
  })
  afterEach(() => {
    w?.unmount()
    document.body.innerHTML = ''
  })
  const mountGate = async () => {
    w = mount(ModuleTemplateGate, { props: { module: 'comments' }, global: { plugins: [i18n] }, attachTo: document.body })
    await flushPromises()
  }
  const notice = () => w.find('[data-testid="module-template-notice"]').exists()
  const tpl = missingModules => [{ id: 1, current: true, missingModules }]

  it('reads nothing without an active event and loads when one appears', async () => {
    await mountGate()
    expect(mocks.templates).not.toHaveBeenCalled()
    mocks.templates.mockResolvedValue(tpl(['comments']))
    state.activeEvent = { id: 8 }
    await flushPromises()
    expect(mocks.templates).toHaveBeenCalledWith(8)
    expect(notice()).toBe(true)
  })

  it('clears the notice when the event is left', async () => {
    mocks.templates.mockResolvedValue(tpl(['comments']))
    state.activeEvent = { id: 8 }
    await mountGate()
    expect(notice()).toBe(true)
    state.activeEvent = null
    await flushPromises()
    expect(notice()).toBe(false)
  })

  it('ignores a slow answer for an event that is no longer the active one', async () => {
    let late
    mocks.templates.mockImplementationOnce(() => new Promise(resolve => (late = resolve))).mockResolvedValueOnce(tpl([]))
    state.activeEvent = { id: 8 }
    await mountGate()
    state.activeEvent = { id: 9 }
    await flushPromises()
    late(tpl(['comments']))
    await flushPromises()
    expect(notice()).toBe(false)
  })
})
