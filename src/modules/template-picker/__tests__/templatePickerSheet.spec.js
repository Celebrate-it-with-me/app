import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ templates: vi.fn(), impact: vi.fn(), apply: vi.fn(), preview: vi.fn(), quote: vi.fn() }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))
vi.mock('@/modules/payments/services/PaymentsService', () => ({ default: { quote: mocks.quote } }))

import TemplatePickerSheet from '../components/TemplatePickerSheet.vue'

const LIST = [
  { id: 1, name: 'Clásica', tier: 'free', locked: false, current: true, previewImage: null, description: { es: 'Elegante', en: 'Elegant' }, hasPresets: false, tags: ['elegante'] },
  { id: 2, name: 'Rosas', tier: 'free', locked: false, current: false, previewImage: 'https://x.test/2.webp', description: { es: 'Rosas', en: 'Roses' }, hasPresets: false, tags: ['floral'] },
  { id: 3, name: 'Botánica', tier: 'premium', locked: true, current: false, previewImage: 'https://x.test/3.webp', description: { es: 'Hojas', en: 'Leaves' }, hasPresets: true, presets: [{ value: 'a', label: { es: 'Salvia', en: 'Sage' } }] }
]
const IMPACT = { templateId: 2, tier: 'free', locked: false, willPin: false, keeps: [{ kind: 'sections' }, { kind: 'cover_photo' }], resets: [{ kind: 'preset' }, { kind: 'options', count: 2 }, { kind: 'weird' }], restoresFromStash: false, changesPublishedLook: false }
const CLEAN = { ...IMPACT, resets: [], keeps: [] }
const apiError = (status, data) => Object.assign(new Error('x'), { response: { status, data } })
const text = () => document.body.textContent.replace(/\s+/g, ' ')
const button = label => [...document.body.querySelectorAll('button, a')].find(b => b.textContent.replace(/\s+/g, ' ').trim().includes(label))
const click = async label => {
  button(label).click()
  await flushPromises()
}
const gridCard = name => document.body.querySelector(`[data-testid=template-grid] button[aria-label^="${name}"]`)
const pick = async name => {
  gridCard(name).click()
  await flushPromises()
}
const primary = () => document.body.querySelector('[data-testid=primary-action]')

let wrapper
async function mountSheet(props = {}) {
  wrapper = mount(TemplatePickerSheet, { props: { open: true, eventId: 5, ...props }, global: { plugins: [i18n] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
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

describe('TemplatePickerSheet layout and list', () => {
  it('opens on the template in use, with the cards in order and one badge each', async () => {
    await mountSheet()
    const cards = [...document.body.querySelectorAll('[data-testid=template-grid] button[aria-label][aria-pressed]:not([data-testid=template-favorite])')]
    expect(cards.map(c => c.getAttribute('aria-label'))).toEqual(['Clásica, Actual', 'Rosas, Gratis', 'Botánica, Premium, bloqueada'])
    expect(cards.map(c => c.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false'])
    expect(document.body.querySelector('[data-testid=template-panel] h3').textContent).toBe('Clásica')
    expect(mocks.preview).toHaveBeenCalledWith(5, { templateId: 1, locale: 'es', state: 'invitation' })
    expect(document.body.querySelectorAll('[data-testid=template-badge]').length).toBe(3)
  })

  it('has a single zone that scrolls on wide screens and no sideways overflow classes', async () => {
    await mountSheet()
    const body = document.body.querySelector('[data-testid=template-picker-body]')
    expect(body.querySelector('.lg\\:grid-cols-\\[minmax\\(0\\,1fr\\)_25rem\\]')).not.toBeNull()
    expect(body.className).not.toContain('overflow-y-auto')
    expect(document.body.querySelector('[role=dialog] [data-testid=template-picker-body]').parentElement.className).toContain('overflow-hidden')
    expect(document.body.querySelector('[data-testid=template-grid]').className).toContain('auto-fill')
    expect(document.body.querySelector('[data-testid=template-strip]')).not.toBeNull()
  })

  it('shows the banner to unlock and unlocks without a template', async () => {
    await mountSheet()
    document.body.querySelector('[data-testid=unlock-banner]').click()
    await flushPromises()
    expect(wrapper.emitted('unlock')).toHaveLength(1)
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
  })

  it('hides the banner coming back from the payment', async () => {
    await mountSheet({ fromPayment: true })
    expect(document.body.querySelector('[data-testid=unlock-banner]')).toBeNull()
  })

  it('shows skeletons while loading, then an error with a retry that recovers', async () => {
    mocks.templates.mockRejectedValueOnce(apiError(500, {}))
    await mountSheet()
    expect(text()).toContain('No pudimos cargar las plantillas')
    await click('Reintentar')
    expect(document.body.querySelectorAll('[data-testid=template-grid] li').length).toBe(3)
  })

  it('says there is nothing available when the list is empty', async () => {
    mocks.templates.mockResolvedValue([])
    await mountSheet()
    expect(text()).toContain('Por ahora no hay plantillas disponibles.')
    expect(primary()).toBeNull()
  })

  it('with two or fewer templates there is no search, no filters and no heart', async () => {
    mocks.templates.mockResolvedValue(LIST.slice(0, 2))
    await mountSheet()
    expect(document.body.querySelector('[data-testid=template-filters]')).toBeNull()
    expect(document.body.querySelector('[data-testid=template-favorite]')).toBeNull()
    expect(document.body.querySelectorAll('[data-testid=template-grid] li').length).toBe(2)
  })

  it('with one template it is a single card and the button says it is the one in use', async () => {
    mocks.templates.mockResolvedValue(LIST.slice(0, 1))
    await mountSheet()
    expect(document.body.querySelectorAll('[data-testid=template-grid] li').length).toBe(1)
    expect(button('Ya la usas').disabled).toBe(true)
  })

  it('uses the real event name and date in the stationery fallback', async () => {
    const { useEventsStore } = await import('@/modules/events/stores/useEventsStore')
    useEventsStore().activeEvent = { eventName: 'XV de Valentina', startDate: '06/12/2027 18:00', timezone: 'America/New_York' }
    await mountSheet()
    const miniature = wrapper.findComponent({ name: 'InvitationMiniature' })
    expect(miniature.props('name')).toBe('XV de Valentina')
    expect(miniature.props('dateLabel')).toContain('2027')
    expect(miniature.props('dateLabel')).toContain('12')
  })
})

describe('TemplatePickerSheet filters, search and favorites', () => {
  const MANY = [
    ...LIST,
    { id: 4, name: 'Jardín', tier: 'free', locked: false, current: false, previewImage: null, description: null, tags: ['floral'] },
    { id: 5, name: 'Gala dorada', tier: 'premium', locked: true, current: false, previewImage: null, description: null, tags: ['elegante'] }
  ]
  const names = () => [...document.body.querySelectorAll('[data-testid=template-grid] li button[aria-pressed][aria-label]:not([data-testid=template-favorite])')].map(b => b.getAttribute('aria-label').split(',')[0])
  const type = async value => {
    const input = document.body.querySelector('[data-testid=template-filters] input')
    input.value = value
    input.dispatchEvent(new Event('input'))
    await flushPromises()
  }

  it('filters by access, style and name, shows the count and clears everything', async () => {
    mocks.templates.mockResolvedValue(structuredClone(MANY))
    await mountSheet()
    expect(document.body.querySelector('[data-testid=template-count]').textContent).toBe('5 plantillas')
    const filters = document.body.querySelector('[data-testid=template-filters]')
    const chip = label => [...filters.querySelectorAll('button')].find(b => b.textContent.trim() === label)
    chip('Premium').click()
    await flushPromises()
    expect(names()).toEqual(['Botánica', 'Gala dorada'])
    chip('Todas').click()
    chip('Floral').click()
    await flushPromises()
    expect(names()).toEqual(['Jardín', 'Rosas'])
    expect(document.body.querySelector('[data-testid=template-count]').textContent).toBe('2 plantillas')
    await type('jardin')
    expect(names()).toEqual(['Jardín'])
    expect(document.body.querySelector('[data-testid=template-count]').textContent).toBe('1 plantilla')
    chip('Floral').click()
    await flushPromises()
    expect(chip('Floral').getAttribute('aria-pressed')).toBe('false')
  })

  it('has an empty state with a button that removes the filters', async () => {
    mocks.templates.mockResolvedValue(structuredClone(MANY))
    await mountSheet()
    await type('zzz')
    expect(document.body.querySelector('[data-testid=template-no-results]').textContent).toContain('Ninguna plantilla coincide')
    await click('Quitar filtros')
    expect(names().length).toBe(5)
    expect(document.body.querySelector('[data-testid=template-filters] input').value).toBe('')
  })

  it('marks a favorite with the heart, remembers it and offers to see only favorites', async () => {
    mocks.templates.mockResolvedValue(structuredClone(MANY))
    await mountSheet()
    expect([...document.body.querySelectorAll('[data-testid=template-filters] button')].some(b => b.textContent.includes('Favoritas'))).toBe(false)
    const heart = () => document.body.querySelector('[data-testid=template-favorite][aria-label$="Jardín como favorita"], [data-testid=template-favorite][aria-label$="Jardín de tus favoritas"]')
    expect(heart().getAttribute('aria-label')).toBe('Marcar Jardín como favorita')
    expect(heart().getAttribute('aria-pressed')).toBe('false')
    heart().click()
    await flushPromises()
    expect(heart().getAttribute('aria-pressed')).toBe('true')
    expect(heart().getAttribute('aria-label')).toBe('Quitar Jardín de tus favoritas')
    // the heart does not select the card
    expect(document.body.querySelector('[data-testid=template-panel] h3').textContent).toBe('Clásica')
    expect(localStorage.getItem('qv.templateFavs.anon')).toBe('["4"]')
    await click('Favoritas')
    expect(names()).toEqual(['Jardín'])
  })
})

describe('TemplatePickerSheet preview and selection', () => {
  it('selects without closing, previews with the real data and asks for the language and stage chosen', async () => {
    await mountSheet()
    await pick('Rosas')
    expect(mocks.preview).toHaveBeenLastCalledWith(5, { templateId: 2, locale: 'es', state: 'invitation' })
    expect(document.body.querySelector('[data-testid=template-panel] h3').textContent).toBe('Rosas')
    expect(document.body.querySelector('[role=dialog]')).not.toBeNull()
    expect(document.body.querySelector('iframe[src="/preview/invitation"]')).not.toBeNull()
    await click('English')
    expect(mocks.preview).toHaveBeenLastCalledWith(5, { templateId: 2, locale: 'en', state: 'invitation' })
    await click('Guarda la fecha')
    expect(mocks.preview).toHaveBeenLastCalledWith(5, { templateId: 2, locale: 'en', state: 'save_the_date' })
    expect(text()).not.toContain('Sin foto')
    expect(mocks.apply).not.toHaveBeenCalled()
  })

  it('starts on the stage of the invitation', async () => {
    await mountSheet({ stage: 'save_the_date' })
    const panelCalls = mocks.preview.mock.calls.filter(([, body]) => body.state)
    expect(panelCalls.at(-1)[1]).toEqual({ templateId: 1, locale: 'es', state: 'save_the_date' })
  })

  it('makes the phone an inert picture (no scroll of its own)', async () => {
    mocks.preview.mockResolvedValue({ locale: 'es', sections: [{ type: 'cover', data: {} }], theme: {} })
    await mountSheet()
    const frame = document.body.querySelector('[data-testid=template-phone] iframe')
    expect(frame.getAttribute('scrolling')).toBe('no')
    expect(frame.hasAttribute('inert')).toBe(true)
    expect(frame.className).toContain('pointer-events-none')
  })

  it('shows the preview error with a retry, and no retry when the role cannot preview', async () => {
    mocks.preview.mockRejectedValueOnce(apiError(500, {}))
    await mountSheet()
    expect(text()).toContain('No pudimos preparar la vista previa.')
    mocks.preview.mockResolvedValue({ locale: 'es', sections: [], theme: {} })
    await click('Reintentar')
    expect(text()).not.toContain('No pudimos preparar la vista previa.')
    mocks.preview.mockRejectedValueOnce(apiError(403, {}))
    await pick('Rosas')
    expect(text()).toContain('Tu rol no puede preparar la vista previa.')
    expect(document.body.querySelector('[role=alert] button')).toBeNull()
  })

  it('a premium template without the plan can be seen but only offers to unlock it', async () => {
    await mountSheet()
    await pick('Botánica')
    expect(text()).toContain('Plantilla premium')
    expect(primary().textContent).toContain('Desbloquear · $79')
    expect(button('Usar esta plantilla')).toBeUndefined()
    primary().click()
    await flushPromises()
    expect(wrapper.emitted('unlock')[0][0].id).toBe(3)
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
    expect(mocks.apply).not.toHaveBeenCalled()
  })

  it('opens straight on a template when coming back from the payment and offers to use it now', async () => {
    mocks.templates.mockResolvedValue(LIST.map(item => (item.id === 3 ? { ...item, locked: false } : item)))
    await mountSheet({ initialTemplateId: '3', fromPayment: true })
    expect(text()).toContain('Ya desbloqueaste tu evento. ¿Usamos Botánica ahora?')
    expect(button('Usar ahora')).toBeDefined()
  })

  it('does not offer to apply the template already in use', async () => {
    await mountSheet()
    expect(button('Ya la usas').disabled).toBe(true)
    expect(text()).not.toContain('Tu contenido y fotos se conservan.')
  })

  it('the strip of thumbnails selects too', async () => {
    await mountSheet()
    document.body.querySelector('[data-testid=template-strip] button[aria-label="Ver Rosas"]').click()
    await flushPromises()
    expect(document.body.querySelector('[data-testid=template-panel] h3').textContent).toBe('Rosas')
  })
})

describe('TemplatePickerSheet button states and changing', () => {
  it('saves straight away when nothing restarts, nothing is lost and nothing is published', async () => {
    mocks.impact.mockResolvedValue(structuredClone(CLEAN))
    mocks.apply.mockResolvedValue({ undo: { until: '2026-11-16T10:10:00Z', templateId: 1 } })
    await mountSheet()
    await pick('Rosas')
    expect(text()).toContain('Tu contenido y fotos se conservan.')
    primary().click()
    await flushPromises()
    expect(mocks.apply).toHaveBeenCalledWith(5, 2, { undo: false })
    expect(document.body.querySelector('[data-testid=confirm-change]')).toBeNull()
    const [data, template, undo] = wrapper.emitted('changed')[0]
    expect(data.undo.templateId).toBe(1)
    expect(template.id).toBe(2)
    expect(undo).toEqual({ until: '2026-11-16T10:10:00Z', templateId: 1, name: 'Clásica' })
    expect(wrapper.emitted('update:open').pop()).toEqual([false])
  })

  it('asks first, in short, when something restarts, and applies only on accept', async () => {
    mocks.apply.mockResolvedValue({ undo: { until: '2026-11-16T10:10:00Z', templateId: 1 } })
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    expect(mocks.impact).toHaveBeenCalledWith(5, 2)
    expect(text()).toContain('¿Cambiar a Rosas?')
    expect(text()).toContain('Tu foto de portada')
    expect(text()).toContain('Las opciones de estilo de la plantilla (2)')
    expect(text()).toContain('Otros ajustes de estilo')
    expect(text()).toContain('Podrás deshacerlo durante 10 minutos.')
    expect(mocks.apply).not.toHaveBeenCalled()
    await click('Cancelar')
    expect(mocks.apply).not.toHaveBeenCalled()
    primary().click()
    await flushPromises()
    document.body.querySelector('[data-testid=confirm-apply]').click()
    await flushPromises()
    expect(mocks.apply).toHaveBeenCalledWith(5, 2, { undo: false })
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })

  it('warns when changing would alter a Save the date already shared, and says when the old style comes back', async () => {
    mocks.impact.mockResolvedValue({ ...IMPACT, changesPublishedLook: true, restoresFromStash: true })
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    expect(text()).toContain('Tu Guarda la fecha ya compartida cambiará de aspecto.')
    expect(text()).toContain('Recuperamos tu estilo anterior')
  })

  it('a published look asks even when nothing else restarts', async () => {
    mocks.impact.mockResolvedValue({ ...CLEAN, changesPublishedLook: true })
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    expect(document.body.querySelector('[data-testid=confirm-change]')).not.toBeNull()
    expect(mocks.apply).not.toHaveBeenCalled()
  })

  it('a missing active module is part of the short confirmation', async () => {
    mocks.impact.mockResolvedValue(structuredClone(CLEAN))
    mocks.templates.mockResolvedValue(LIST.map(item => (item.id === 2 ? { ...item, missingModules: ['comments'] } : item)))
    await mountSheet({ activeModules: ['comments'] })
    await pick('Rosas')
    primary().click()
    await flushPromises()
    expect(document.body.querySelector('[data-testid=missing-ask]').textContent).toContain('Esta plantilla no incluye Comentarios')
    expect(mocks.apply).not.toHaveBeenCalled()
    await click('Cambiar de todos modos')
    expect(mocks.apply).toHaveBeenCalledTimes(1)
  })

  it('retries the impact when it failed and the confirmation shows the failure', async () => {
    mocks.impact.mockRejectedValue(apiError(500, {}))
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    expect(text()).toContain('No pudimos calcular qué cambia.')
    expect(document.body.querySelector('[data-testid=confirm-apply]').disabled).toBe(true)
    mocks.impact.mockResolvedValue(structuredClone(IMPACT))
    await click('Reintentar')
    expect(document.body.querySelector('[data-testid=confirm-apply]').disabled).toBe(false)
  })

  it('undoes the last change by applying the previous template', async () => {
    mocks.impact.mockResolvedValue(structuredClone(CLEAN))
    mocks.apply.mockResolvedValueOnce({ undo: { until: '2026-11-16T10:10:00Z', templateId: 1 } }).mockResolvedValueOnce({ undo: { templateId: 2 } })
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    await wrapper.vm.undo()
    expect(mocks.apply).toHaveBeenLastCalledWith(5, 1, { undo: true })
    expect(wrapper.emitted('undone')).toHaveLength(1)
  })

  it('reports a failed undo', async () => {
    mocks.impact.mockResolvedValue(structuredClone(CLEAN))
    mocks.apply.mockResolvedValueOnce({ undo: { until: 'x', templateId: 1 } }).mockRejectedValueOnce(apiError(409, { code: 'template_locked' }))
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    const result = await wrapper.vm.undo()
    expect(result.ok).toBe(false)
    expect(wrapper.emitted('undone')).toBeUndefined()
  })

  it('goes to the unlock bridge when the API answers plan_required even if the list said it was free', async () => {
    mocks.impact.mockResolvedValue(structuredClone(CLEAN))
    mocks.apply.mockRejectedValue(apiError(403, { code: 'plan_required' }))
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    expect(wrapper.emitted('unlock')[0][0].id).toBe(2)
    expect(wrapper.emitted('changed')).toBeUndefined()
  })

  it('explains a published invitation (409 template_locked) with a way to contact support', async () => {
    mocks.impact.mockResolvedValue(structuredClone(CLEAN))
    mocks.apply.mockRejectedValue(apiError(409, { code: 'template_locked' }))
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    expect(text()).toContain('Tu invitación ya está publicada')
    expect(text()).toContain('conservamos tus enlaces')
    expect(button('Contactar con soporte').getAttribute('href')).toMatch(/^mailto:/)
    expect(mocks.apply).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('changed')).toBeUndefined()
    await click('Cerrar')
    expect(wrapper.emitted('update:open').pop()).toEqual([false])
  })

  it.each([
    [422, { errors: { status: ['event_archived'] } }, 'Este evento está archivado y no se puede editar.'],
    [403, {}, 'Tu rol solo permite ver la invitación'],
    [500, {}, 'No pudimos cambiar la plantilla']
  ])('shows the failure of a direct save (%s) in the footer and keeps the sheet open', async (status, data, expected) => {
    mocks.impact.mockResolvedValue(structuredClone(CLEAN))
    mocks.apply.mockRejectedValue(apiError(status, data))
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    expect(document.body.querySelector('[role=dialog] [role=alert]').textContent).toContain(expected)
    expect(wrapper.emitted('changed')).toBeUndefined()
    expect(primary().disabled).toBe(false)
  })

  it('keeps the confirmation open with the error when applying from it fails', async () => {
    mocks.apply.mockRejectedValue(apiError(500, {}))
    await mountSheet()
    await pick('Rosas')
    primary().click()
    await flushPromises()
    document.body.querySelector('[data-testid=confirm-apply]').click()
    await flushPromises()
    expect(document.body.querySelector('[data-testid=confirm-change]').textContent).toContain('No pudimos cambiar la plantilla')
  })

  it('reloads the list when the template is no longer available', async () => {
    mocks.impact.mockResolvedValue(structuredClone(CLEAN))
    mocks.apply.mockRejectedValue(apiError(403, { code: 'template_not_available' }))
    await mountSheet()
    await pick('Rosas')
    mocks.templates.mockClear()
    primary().click()
    await flushPromises()
    expect(mocks.templates).toHaveBeenCalledTimes(1)
    expect(document.body.querySelectorAll('[data-testid=template-grid] li').length).toBe(3)
    expect(document.body.querySelector('[data-testid=template-panel] h3').textContent).toBe('Clásica')
  })
})

describe('TemplatePickerSheet closing', () => {
  it('closes at once when the template in use is the one being looked at', async () => {
    await mountSheet()
    await click('Cancelar')
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
    expect(document.body.querySelector('[data-testid=discard-ask]')).toBeNull()
  })

  it('asks before leaving a template she looked at but did not apply, and can stay or leave', async () => {
    await mountSheet()
    await pick('Rosas')
    await click('Cancelar')
    expect(document.body.querySelector('[data-testid=discard-ask]').textContent).toContain('Estás viendo Rosas')
    expect(wrapper.emitted('update:open')).toBeUndefined()
    await click('Seguir viendo')
    expect(document.body.querySelector('[data-testid=discard-ask]')).toBeNull()
    await click('Cancelar')
    document.body.querySelector('[data-testid=discard-leave]').click()
    await flushPromises()
    expect(wrapper.emitted('update:open').pop()).toEqual([false])
  })

  it('reopening starts again on the template in use', async () => {
    await mountSheet()
    await pick('Rosas')
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await flushPromises()
    expect(document.body.querySelector('[data-testid=template-panel] h3').textContent).toBe('Clásica')
  })
})
