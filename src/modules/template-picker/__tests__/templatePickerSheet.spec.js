import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ templates: vi.fn(), impact: vi.fn(), apply: vi.fn(), preview: vi.fn(), quote: vi.fn() }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))
vi.mock('@/modules/payments/services/PaymentsService', () => ({ default: { quote: mocks.quote } }))

import TemplatePickerSheet from '../components/TemplatePickerSheet.vue'

const LIST = [
  { id: 1, name: 'Clásica', tier: 'free', locked: false, current: true, previewImage: null, description: { es: 'Elegante', en: 'Elegant' }, hasPresets: false },
  { id: 2, name: 'Rosas', tier: 'free', locked: false, current: false, previewImage: 'https://x.test/2.webp', description: { es: 'Rosas', en: 'Roses' }, hasPresets: false },
  { id: 3, name: 'Botánica', tier: 'premium', locked: true, current: false, previewImage: 'https://x.test/3.webp', description: { es: 'Hojas', en: 'Leaves' }, hasPresets: true, presets: [{ value: 'a', label: { es: 'Salvia', en: 'Sage' } }] }
]
const IMPACT = { templateId: 2, tier: 'free', locked: false, willPin: false, keeps: [{ kind: 'sections' }, { kind: 'cover_photo' }], resets: [{ kind: 'preset' }, { kind: 'options', count: 2 }, { kind: 'weird' }], restoresFromStash: false, changesPublishedLook: false }
const apiError = (status, data) => Object.assign(new Error('x'), { response: { status, data } })
const text = () => document.body.textContent.replace(/\s+/g, ' ')
const button = label => [...document.body.querySelectorAll('button, a')].find(b => b.textContent.replace(/\s+/g, ' ').trim().includes(label))
const click = async label => {
  button(label).click()
  await flushPromises()
}

let wrapper
async function mountSheet(props = {}) {
  wrapper = mount(TemplatePickerSheet, { props: { open: true, eventId: 5, ...props }, global: { plugins: [i18n] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setActivePinia(createPinia())
  i18n.global.locale.value = 'es'
  Object.values(mocks).forEach(fn => fn.mockReset())
  mocks.templates.mockResolvedValue(structuredClone(LIST))
  mocks.preview.mockResolvedValue({ locale: 'es', sections: [], theme: {} })
  mocks.impact.mockResolvedValue(structuredClone(IMPACT))
  mocks.quote.mockResolvedValue({ amountCents: 7900, currency: 'USD' })
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('TemplatePickerSheet', () => {
  it('lists the templates with the one in use first and premium ones marked', async () => {
    await mountSheet()
    const cards = [...document.body.querySelectorAll('ul li button')]
    expect(cards.map(c => c.getAttribute('aria-label'))).toEqual(['Clásica, Gratis, En uso', 'Rosas, Gratis', 'Botánica, Premium, bloqueada'])
    // one banner on top instead of a hint on every card
    expect(text()).not.toContain('Se desbloquea')
    expect(document.body.querySelector('[data-testid=unlock-banner]')?.textContent).toContain('Desbloquea todo por $79')
    expect(document.body.querySelectorAll('[data-testid=invitation-miniature]').length).toBe(3)
    expect(text()).not.toContain('Sin imagen')
  })

  // The miniature queue spaces its calls 400 ms apart (API limit), so the calls are checked on a fake clock: with real timers the
  // number of calls seen depended on how long the awaits took (under load or coverage the second call landed inside the test).
  it('draws each card with its own template and does not repeat the calls when coming back from a detail or reopening', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    try {
      const cover = () => mocks.preview.mock.calls.filter(([, body]) => body.state === undefined).map(([, body]) => body.templateId)
      const settle = () => vi.advanceTimersByTimeAsync(2000)
      await mountSheet()
      expect(cover()).toEqual([1])
      await settle()
      expect(cover()).toEqual([1, 2, 3])
      await click('Clásica')
      await click('Volver')
      await click('Clásica')
      await click('Volver')
      await settle()
      expect(cover()).toEqual([1, 2, 3])
      await wrapper.setProps({ open: false })
      await flushPromises()
      await wrapper.setProps({ open: true })
      await flushPromises()
      await settle()
      expect(cover()).toEqual([1, 2, 3])
      expect(document.body.querySelectorAll('[data-testid=invitation-miniature]').length).toBe(3)
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows an error with a retry when the list fails, and recovers', async () => {
    mocks.templates.mockRejectedValueOnce(apiError(500, {}))
    await mountSheet()
    expect(text()).toContain('No pudimos cargar las plantillas')
    await click('Reintentar')
    expect(document.body.querySelectorAll('ul li').length).toBe(3)
  })

  it('previews a template with the real event data (never applies it) and asks the API for the language and stage chosen', async () => {
    await mountSheet()
    await click('Rosas')
    expect(mocks.preview).toHaveBeenLastCalledWith(5, { templateId: 2, locale: 'es', state: 'invitation', preset: undefined })
    expect(document.body.querySelector('iframe[src="/preview/invitation"]')).not.toBeNull()
    await click('English')
    expect(mocks.preview).toHaveBeenLastCalledWith(5, { templateId: 2, locale: 'en', state: 'invitation', preset: undefined })
    await click('Sin foto')
    expect(mocks.preview).toHaveBeenLastCalledWith(5, { templateId: 2, locale: 'en', state: 'no_photo', preset: undefined })
    expect(mocks.apply).not.toHaveBeenCalled()
  })

  it('a premium template without the plan can be seen but only offers to unlock it', async () => {
    await mountSheet()
    await click('Botánica')
    expect(text()).toContain('Plantilla premium')
    expect(button('Desbloquear · $79')).toBeDefined()
    expect(button('Usar esta plantilla')).toBeUndefined()
    await click('Desbloquear · $79')
    expect(wrapper.emitted('unlock')[0][0].id).toBe(3)
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
    expect(mocks.apply).not.toHaveBeenCalled()
  })

  it('shows what is kept and reset before changing, then applies and reports the change with its undo data', async () => {
    mocks.apply.mockResolvedValue({ undo: { until: '2026-11-16T10:10:00Z', templateId: 1 } })
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    expect(mocks.impact).toHaveBeenCalledWith(5, 2)
    expect(text()).toContain('¿Cambiar a Rosas?')
    expect(text()).toContain('Tu foto de portada')
    expect(text()).toContain('Las opciones de estilo de la plantilla (2)')
    expect(text()).toContain('Otros ajustes de estilo')
    expect(text()).toContain('Podrás deshacerlo durante 10 minutos.')
    await click('Cambiar')
    expect(mocks.apply).toHaveBeenCalledWith(5, 2, { undo: false })
    const [data, template, undo] = wrapper.emitted('changed')[0]
    expect(data.undo.templateId).toBe(1)
    expect(template.id).toBe(2)
    expect(undo).toEqual({ until: '2026-11-16T10:10:00Z', templateId: 1, name: 'Clásica' })
  })

  it('undoes the last change by applying the previous template', async () => {
    mocks.apply.mockResolvedValueOnce({ undo: { until: '2026-11-16T10:10:00Z', templateId: 1 } }).mockResolvedValueOnce({ undo: { templateId: 2 } })
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    await click('Cambiar')
    await wrapper.vm.undo()
    expect(mocks.apply).toHaveBeenLastCalledWith(5, 1, { undo: true })
    expect(wrapper.emitted('undone')).toHaveLength(1)
  })

  it('warns when changing would alter a Save the date already shared, and says when the old style comes back', async () => {
    mocks.impact.mockResolvedValue({ ...IMPACT, changesPublishedLook: true, restoresFromStash: true })
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    expect(text()).toContain('Tu Guarda la fecha ya compartida cambiará de aspecto.')
    expect(text()).toContain('Recuperamos tu estilo anterior')
  })

  it('goes to the unlock bridge when the API answers plan_required even if the list said it was free', async () => {
    mocks.apply.mockRejectedValue(apiError(403, { code: 'plan_required' }))
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    await click('Cambiar')
    expect(wrapper.emitted('unlock')[0][0].id).toBe(2)
    expect(wrapper.emitted('changed')).toBeUndefined()
  })

  it('explains a published invitation (409 template_locked) with a way to contact support', async () => {
    mocks.apply.mockRejectedValue(apiError(409, { code: 'template_locked' }))
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    await click('Cambiar')
    expect(text()).toContain('Tu invitación ya está publicada')
    expect(text()).toContain('conservamos tus enlaces')
    expect(button('Contactar con soporte').getAttribute('href')).toMatch(/^mailto:/)
    expect(wrapper.emitted('changed')).toBeUndefined()
  })

  it('says the event is archived (422 status) instead of a generic error', async () => {
    mocks.apply.mockRejectedValue(apiError(422, { errors: { status: ['event_archived'] } }))
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    await click('Cambiar')
    expect(text()).toContain('Este evento está archivado y no se puede editar.')
  })

  it('says the role cannot change the template (403 without a code)', async () => {
    mocks.apply.mockRejectedValue(apiError(403, {}))
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    await click('Cambiar')
    expect(text()).toContain('Tu rol solo permite ver la invitación')
  })

  it('never offers a way to apply over a published invitation: only support', async () => {
    mocks.apply.mockRejectedValue(apiError(409, { code: 'template_locked' }))
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    await click('Cambiar')
    expect(mocks.apply).toHaveBeenCalledTimes(1)
    expect(button('Cambiar')).toBeUndefined()
    expect(button('Contactar con soporte')).toBeDefined()
  })

  it('reloads the list when the template is no longer available', async () => {
    mocks.apply.mockRejectedValue(apiError(403, { code: 'template_not_available' }))
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    mocks.templates.mockClear()
    await click('Cambiar')
    expect(mocks.templates).toHaveBeenCalledTimes(1)
    expect(document.body.querySelectorAll('ul li').length).toBe(3)
  })

  it('keeps the confirmation open with an error on any other failure', async () => {
    mocks.apply.mockRejectedValue(apiError(500, {}))
    await mountSheet()
    await click('Rosas')
    await click('Usar esta plantilla')
    await click('Cambiar')
    expect(text()).toContain('No pudimos cambiar la plantilla')
    expect(button('Cambiar')).toBeDefined()
  })

  it('opens straight on a template when coming back from the payment and offers to use it now', async () => {
    mocks.templates.mockResolvedValue(LIST.map(item => (item.id === 3 ? { ...item, locked: false } : item)))
    await mountSheet({ initialTemplateId: '3', fromPayment: true })
    expect(text()).toContain('Ya desbloqueaste tu evento. ¿Usamos Botánica ahora?')
    expect(button('Usar ahora')).toBeDefined()
  })

  it('does not offer to apply the template already in use', async () => {
    await mountSheet()
    await click('Clásica')
    expect(button('Ya la usas').disabled).toBe(true)
  })

  it('offers the palettes the template declares', async () => {
    await mountSheet()
    await click('Botánica')
    await click('Salvia')
    expect(mocks.preview).toHaveBeenLastCalledWith(5, { templateId: 3, locale: 'es', state: 'invitation', preset: 'a' })
  })
})
