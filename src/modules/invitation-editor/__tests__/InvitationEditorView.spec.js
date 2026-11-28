import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const svc = vi.hoisted(() => ({ get: vi.fn(), saveFields: vi.fn(), saveSections: vi.fn() }))
vi.mock('../services/InvitationEditorService', () => ({ default: svc }))
vi.mock('@/services/axios', () => ({ CWM_API: {} }))
const picker = vi.hoisted(() => ({ templates: vi.fn(), preview: vi.fn(), uploadCover: vi.fn(), removeCover: vi.fn(), saveFocus: vi.fn(), impact: vi.fn(), apply: vi.fn() }))
vi.mock('@/modules/template-picker/services/TemplatePickerService', () => ({ default: picker }))
vi.mock('@/modules/payments/services/PaymentsService', () => ({ default: { quote: vi.fn() } }))

import InvitationEditorView from '../views/InvitationEditorView.vue'
import PaymentsService from '@/modules/payments/services/PaymentsService'

const http = (status, data = {}) => Object.assign(new Error(`http ${status}`), { response: { status, data } })
const payload = () => ({
  template: { id: 12, slug: 'b', name: 'Botánica', tier: 'premium', versionId: 1, available: true, fallbackToClassic: false },
  state: { status: 'draft', stage: 'invitation', pinned: false, templateLocked: false, unlocked: false, locale: 'es' },
  groups: [{ id: 'cover', label: { es: 'Portada', en: 'Cover' } }, { id: 'look', label: { es: 'Estilo', en: 'Look' } }, { id: 'empty', label: { es: 'Vacío', en: 'Empty' } }],
  fields: [
    { id: 'cover_photo', type: 'image', group: 'cover', label: { es: 'Foto de portada', en: 'Cover photo' }, locked: false, value: null, default: null, isDefault: true },
    { id: 'cover_text', type: 'text', group: 'cover', multiline: true, label: { es: 'Mensaje', en: 'Message' }, max: { es: 10, en: 10 }, locked: false, value: { es: 'Hola', en: 'Hi' }, default: { es: 'Hola', en: 'Hi' }, isDefault: true },
    { id: 'preset', type: 'choice', group: 'look', label: { es: 'Paleta', en: 'Palette' }, choices: [{ value: 'a', label: { es: 'Rosa', en: 'Rose' } }, { value: 'b', label: { es: 'Salvia', en: 'Sage' } }], locked: false, value: 'a', default: 'a', isDefault: true },
    { id: 'color_primary', type: 'color', group: 'look', label: { es: 'Color principal', en: 'Primary' }, locked: true, value: '#566f52', default: '#566f52', isDefault: true },
    { id: 'color_accent', type: 'color', group: 'look', label: { es: 'Acento', en: 'Accent' }, locked: false, value: '#c9a24d', default: '#c9a24d', isDefault: true },
    { id: 'ornaments', type: 'toggle', group: 'look', label: { es: 'Adornos', en: 'Ornaments' }, locked: false, value: true, default: true, isDefault: true },
    { id: 'weird', type: 'hologram', group: 'look', label: { es: 'Raro', en: 'Weird' }, value: 1 }
  ],
  sections: [
    { type: 'cover', enabled: true, order: 1, required: true, title: { es: 'Portada', en: 'Cover' } },
    { type: 'program', enabled: true, order: 2, required: false, title: { es: 'Programa', en: 'Program' } },
    { type: 'gallery', enabled: false, order: 3, required: false, moduleState: 'locked', title: { es: 'Galería', en: 'Gallery' } },
    { type: 'rsvp', enabled: true, order: 4, required: true, title: { es: 'Confirmación', en: 'RSVP' } }
  ]
})

let wrapper
let router
async function setup({ role = 'owner' } = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = { id: 7, name: 'XV de Valentina', userRole: role }
  router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/dashboard/unlock/:module', '/dashboard/events/:id/edit'].map((path, i) => ({ path, name: ['home', 'unlock', 'edit-event'][i], component: { template: '<div />' } }))
  })
  await router.push('/')
  wrapper = mount(InvitationEditorView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

describe('InvitationEditorView', () => {
  beforeEach(() => {
    setLocale('es')
    vi.clearAllMocks()
    svc.get.mockResolvedValue(payload())
    PaymentsService.quote.mockResolvedValue({ amountCents: 7900, currency: 'USD', unlocked: false })
    svc.saveFields.mockResolvedValue({ fields: [], savedAt: 'now' })
    svc.saveSections.mockResolvedValue({})
    picker.templates.mockResolvedValue([{ id: 12, name: 'Botánica', tier: 'premium', current: true, locked: false, previewImage: null }])
    picker.preview.mockResolvedValue({ locale: 'es', sections: [], theme: {} })
  })
  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('builds the form from the fields the API sends, grouped, one control per type', async () => {
    await setup()
    expect(wrapper.find('[data-testid=editor]').exists()).toBe(true)
    expect(wrapper.findAll('details').map(d => d.attributes('data-group'))).toEqual(['cover', 'look']) // a group without fields is not drawn
    expect(wrapper.find('[data-field=cover_photo] input[type=file]').exists()).toBe(true) // the cover photo field of the picker module
    expect(wrapper.find('[data-field=cover_text] textarea').exists()).toBe(true)
    expect(wrapper.findAll('[data-field=preset] input[type=radio]')).toHaveLength(2)
    expect(wrapper.find('[data-field=color_accent] [data-testid=color-hex]').exists()).toBe(true)
    expect(wrapper.find('[data-field=ornaments] input[role=switch], [data-field=ornaments] button[role=switch]').exists()).toBe(true)
    expect(wrapper.find('[data-field=weird]').exists()).toBe(false) // unknown types are ignored, not a crash
  })

  it('shows the plan lock as a padlock on the row and one banner with the price on top, and disables the control', async () => {
    await setup()
    const field = wrapper.get('[data-field=color_primary]')
    expect(field.text()).not.toContain('Es parte del evento completo')
    const lock = field.get('[data-testid=field-locked]')
    expect(lock.text()).toBe('Color principal') // the name with the padlock inline, one tap target
    expect(lock.attributes('aria-label')).toBe('Bloqueado: Color principal. Se desbloquea con el evento completo.')
    expect(lock.classes()).toContain('min-h-11')
    expect(wrapper.findAll('[data-testid=unlock-banner]')).toHaveLength(1)
    expect(wrapper.get('[data-testid=unlock-banner]').text()).toBe('Desbloquea todo por $79 · pago único')
    expect(field.get('[data-testid=color-hex]').attributes('disabled')).toBeDefined()
    expect(field.findAll('[data-testid=swatch]').every(s => s.attributes('disabled') !== undefined)).toBe(true)
    await lock.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('unlock')
    expect(router.currentRoute.value.params.module).toBe('full')
  })

  it('a locked section row has a padlock button to the payment, and the toggle field one too', async () => {
    await setup()
    await wrapper.get('[data-section=gallery] [data-testid=section-locked]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('unlock')
  })

  it('the banner leads to the payment', async () => {
    await setup()
    await wrapper.get('[data-testid=unlock-banner]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('unlock')
  })

  it('a locked toggle has its padlock inline with the name, as a 44 px button to the payment', async () => {
    const data = payload()
    data.fields.find(f => f.id === 'ornaments').locked = true
    svc.get.mockResolvedValue(data)
    await setup()
    const lock = wrapper.get('[data-field=ornaments] [data-testid=field-locked]')
    expect(lock.text()).toBe('Adornos') // inline with the name, in the row of the switch
    expect(lock.classes()).toContain('min-h-11')
    expect(wrapper.findAll('[data-field=ornaments] [data-testid=field-locked]')).toHaveLength(1)
    await lock.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('unlock')
  })

  it('saves a choice at once, by field id, and shows "Guardado"', async () => {
    await setup()
    await wrapper.get('[data-testid=choice-b]').setValue(true)
    await flushPromises()
    expect(svc.saveFields).toHaveBeenCalledWith(7, { preset: 'b' })
    expect(wrapper.get('[data-testid=save-indicator]').attributes('data-status')).toBe('saved')
  })

  it('debounces text and sends both languages trimmed', async () => {
    await setup()
    vi.useFakeTimers()
    await wrapper.get('[data-field=cover_text] [data-testid=text-es]').setValue('  Hola mundo ')
    await vi.advanceTimersByTimeAsync(300)
    expect(svc.saveFields).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(400)
    expect(svc.saveFields).toHaveBeenCalledWith(7, { cover_text: { es: 'Hola mundo', en: 'Hi' } })
  })

  it('does not send a text over the limit and explains it', async () => {
    await setup()
    await wrapper.get('[data-field=cover_text] [data-testid=text-es]').setValue('x'.repeat(11))
    await flushPromises()
    expect(svc.saveFields).not.toHaveBeenCalled()
    expect(wrapper.get('[data-field=cover_text] [data-testid=field-error]').text()).toContain('Máximo 10')
  })

  it('shows the API\'s 422 on the field with the text of its code', async () => {
    svc.saveFields.mockRejectedValueOnce(http(422, { errors: { 'fields.color_accent': ['invalid_color'] } }))
    await setup()
    await wrapper.get('[data-field=color_accent] [data-testid=swatch]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-field=color_accent] [data-testid=field-error]').text()).toContain('color válido')
  })

  it('does not report a half-typed hex while typing, only when leaving the box', async () => {
    await setup()
    const hex = wrapper.get('[data-field=color_accent] [data-testid=color-hex]')
    await hex.setValue('#12')
    expect(wrapper.find('[data-field=color_accent] [data-testid=field-error]').exists()).toBe(false)
    await hex.trigger('blur')
    expect(wrapper.get('[data-field=color_accent] [data-testid=field-error]').exists()).toBe(true)
    expect(svc.saveFields).not.toHaveBeenCalled()
    await hex.setValue('7B2D5B')
    await flushPromises()
    expect(svc.saveFields).toHaveBeenCalledWith(7, { color_accent: '#7b2d5b' })
  })

  it('goes back to the template value with null', async () => {
    const data = payload()
    data.fields[4].value = '#ffffff'
    data.fields[4].isDefault = false
    svc.get.mockResolvedValue(data)
    await setup()
    await wrapper.get('[data-field=color_accent] [data-testid=reset]').trigger('click')
    await flushPromises()
    expect(svc.saveFields).toHaveBeenCalledWith(7, { color_accent: null })
    expect(wrapper.get('[data-field=color_accent] [data-testid=color-hex]').element.value).toBe('#c9a24d')
  })

  it('on 403 plan_required puts the field back to the template value, locked, with a notice', async () => {
    svc.saveFields.mockRejectedValueOnce(http(403, { code: 'plan_required' }))
    await setup()
    await wrapper.get('[data-field=color_accent] [data-testid=swatch]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-field=color_accent] svg').exists()).toBe(true)
    expect(wrapper.get('[data-field=color_accent] [data-testid=color-hex]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-field=color_accent] [data-testid=color-hex]').element.value).toBe('#c9a24d')
  })

  it('on 409 template_locked marks the template as locked, with the way to support', async () => {
    svc.saveFields.mockRejectedValueOnce(http(409, { code: 'template_locked' }))
    await setup()
    await wrapper.get('[data-testid=choice-b]').setValue(true)
    await flushPromises()
    expect(wrapper.text()).toContain('escríbenos')
    expect(wrapper.get('a[href^="mailto:"]').exists()).toBe(true)
    const change = wrapper.findAll('button').find(b => b.text().includes('Cambiar plantilla'))
    expect(change.attributes('disabled')).toBeDefined()
  })

  it('toggles and moves sections with PATCH sections, keeping the cover first', async () => {
    await setup()
    const program = wrapper.get('[data-section=program]')
    await program.get('[data-testid=move-down]').trigger('click')
    await flushPromises()
    expect(svc.saveSections).toHaveBeenCalledWith(7, [
      { type: 'cover', enabled: true, order: 1 },
      { type: 'gallery', enabled: false, order: 2 },
      { type: 'program', enabled: true, order: 3 },
      { type: 'rsvp', enabled: true, order: 4 }
    ])
    expect(wrapper.get('[data-section=cover] [data-testid=move-up]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-section=program] [data-testid=move-up]').attributes('disabled')).toBeUndefined()
  })

  it('shows the closing pinned to the end, with no way to move it, and a clear message for closing_last', async () => {
    const data = payload()
    data.sections.push({ type: 'closing', enabled: true, order: 5, required: false, title: { es: 'Cierre', en: 'Closing' } })
    svc.get.mockResolvedValue(data)
    await setup()
    const closing = wrapper.get('[data-section=closing]')
    expect(closing.get('[data-testid=closing-pinned]').text()).toBe('El cierre siempre va al final de la invitación.')
    expect(closing.get('[data-testid=move-up]').attributes('disabled')).toBeDefined()
    expect(closing.get('[data-testid=move-down]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-section=rsvp] [data-testid=move-down]').attributes('disabled')).toBeDefined()
    expect(i18n.global.t('invitationEditor.sections.errors.closing_last')).toContain('cierre')
    expect(i18n.global.t('invitationEditor.sections.errors.closing_last', {}, { locale: 'en' })).toContain('closing')
  })

  it('required sections and sections of a locked module cannot be switched on', async () => {
    await setup()
    expect(wrapper.get('[data-section=cover] [role=switch]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-section=gallery] [role=switch]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-section=gallery] [data-testid=section-locked]').exists()).toBe(true)
  })

  it('puts the sections back when the API refuses them', async () => {
    svc.saveSections.mockRejectedValueOnce(http(422, { errors: { 'sections.1.enabled': ['required_section'] } }))
    await setup()
    await wrapper.get('[data-section=program] [role=switch]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-section=program] [role=switch]').attributes('aria-checked')).toBe('true')
  })

  it('shows an error with retry when the editor cannot load, never a half form', async () => {
    svc.get.mockRejectedValueOnce(Object.assign(new Error('Network Error'), {}))
    await setup()
    expect(wrapper.find('[data-testid=editor-error]').exists()).toBe(true)
    expect(wrapper.find('[data-testid=editor]').exists()).toBe(false)
    await wrapper.get('[data-testid=editor-error] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid=editor]').exists()).toBe(true)
  })

  it('explains a template with nothing to customize', async () => {
    const data = payload()
    data.fields = []
    svc.get.mockResolvedValue(data)
    await setup()
    expect(wrapper.find('[data-testid=editor-empty]').exists()).toBe(true)
    expect(wrapper.find('details').exists()).toBe(false)
  })

  it('a viewer sees the form but cannot change it', async () => {
    await setup({ role: 'viewer' })
    expect(wrapper.get('[data-field=color_accent] [data-testid=color-hex]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-section=program] [role=switch]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-testid=reset]').exists()).toBe(false)
    expect(wrapper.findAll('button').find(b => b.text().includes('Vista previa')).attributes('disabled')).toBeDefined() // the API refuses a viewer's preview (403)
  })

  it('opens the preview with the edits that are not saved yet, and writes nothing', async () => {
    await setup()
    await wrapper.get('[data-field=cover_text] [data-testid=text-es]').setValue('Hola amigo')
    const open = wrapper.findAll('button').find(b => b.text().includes('Vista previa'))
    expect(open.attributes('disabled')).toBeUndefined()
    await open.trigger('click')
    await flushPromises()
    expect(picker.preview).toHaveBeenCalledWith(7, expect.objectContaining({ locale: 'es', state: 'invitation', fields: { cover_text: { es: 'Hola amigo', en: 'Hi' } } }))
    expect(svc.saveFields).not.toHaveBeenCalled()
    expect(document.body.querySelector('[data-testid=editor-preview] iframe')).not.toBeNull()
  })

  it('redraws the form from the state the picker answers after applying a template', async () => {
    picker.templates.mockResolvedValue([
      { id: 12, name: 'Botánica', tier: 'premium', current: true, locked: false, previewImage: null, description: { es: 'a', en: 'a' } },
      { id: 1, name: 'Clásica', tier: 'free', current: false, locked: false, previewImage: null, description: { es: 'b', en: 'b' } }
    ])
    picker.impact.mockResolvedValue({ templateId: 1, tier: 'free', locked: false, keeps: [], resets: [] })
    const next = payload()
    next.template = { ...next.template, id: 1, name: 'Clásica', tier: 'free' }
    next.fields = next.fields.filter(f => f.id !== 'ornaments')
    picker.apply.mockResolvedValue({ ...next, undo: { until: new Date(Date.now() + 600000).toISOString(), templateId: 12 } })
    await setup()
    expect(wrapper.find('[data-field=ornaments]').exists()).toBe(true)
    const click = async label => {
      const all = [...document.body.querySelectorAll('button')]
      const clean = b => b.textContent.replace(/\s+/g, ' ').trim()
      ;(all.find(b => clean(b) === label) ?? all.find(b => clean(b).includes(label))).click()
      await flushPromises()
    }
    await click('Cambiar plantilla')
    await click('Clásica')
    await click('Usar esta plantilla')
    await click('Cambiar')
    expect(picker.apply).toHaveBeenCalledWith(7, 1, { undo: false })
    expect(wrapper.find('[data-field=ornaments]').exists()).toBe(false)
  })

  it('draws the labels in English when the interface is in English', async () => {
    setLocale('en')
    await setup()
    expect(wrapper.text()).toContain('Cover photo')
    expect(wrapper.text()).toContain('Sections')
    setLocale('es')
  })

  it('keeps the actions in a fixed bar the assistant button lifts above, and the page has room under the last section', async () => {
    await setup()
    const bar = wrapper.get('[data-testid=action-bar]')
    expect(bar.classes()).toContain('fixed')
    expect(bar.text()).toContain('Vista previa')
    expect(bar.text()).toContain('Publicar')
    expect(wrapper.get('[data-testid=editor]').element.parentElement.className).toContain('pb-16')
    expect(wrapper.get('[data-section=program]').classes()).toContain('fab-safe') // the assistant button's column stays free
  })

  it('draws the invitation next to the form on wide screens (hidden by CSS below 1280 px) and redraws it after a save', async () => {
    await setup()
    const aside = wrapper.get('[data-testid=editor-preview]')
    expect(aside.classes()).toEqual(expect.arrayContaining(['hidden', 'xl:flex', 'sticky']))
    expect(aside.find('[data-testid=hero-phone]').exists()).toBe(true)
    const before = aside.get('[data-testid=hero-phone]').element
    await wrapper.get('[data-testid=choice-b]').setValue(true)
    await flushPromises()
    expect(wrapper.get('[data-testid=editor-preview] [data-testid=hero-phone]').element).not.toBe(before)
  })

  it('section rows compact below 360 px: stacked arrows, 40 px, uniform minimum height', async () => {
    await setup()
    const row = wrapper.get('[data-section=program]')
    expect(row.get('[data-testid=move-up]').classes()).toEqual(expect.arrayContaining(['max-[360px]:h-10', 'max-[360px]:w-10', 'h-11', 'w-11']))
    expect(row.get('[data-testid=move-down]').element.parentElement.className).toContain('max-[360px]:flex-col')
    expect(row.get('[data-testid=section-controls]').element.parentElement.className).toContain('max-[360px]:min-h-20')
  })
})
