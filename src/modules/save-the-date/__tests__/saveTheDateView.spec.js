import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn() }))
vi.mock('../services/SaveTheDateService', () => ({ default: api }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('@/ui/useToast', () => ({ useToast: () => toast, toasts: { value: [] }, default: () => toast }))
import SaveTheDateView from '../views/SaveTheDateView.vue'

let wrapper
const body = () => document.body
const baseEvent = { id: 7, userRole: 'owner', eventName: 'Los XV de Valentina', status: 'published', invitationStage: 'save_the_date', startDate: '01/02/2027 20:00', timezone: 'America/New_York' }

async function setup(event = baseEvent) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  useEventsStore().activeEvent = event
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }] })
  await router.push('/')
  wrapper = mount(SaveTheDateView, { global: { plugins: [i18n, pinia, router] }, attachTo: document.body })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  api.get.mockReset().mockResolvedValue({ message: 'Hola', showCountdown: true, useAddToCalendar: false })
  api.save.mockReset().mockImplementation(async (_id, payload) => payload)
  toast.success.mockReset()
  toast.error.mockReset()
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

const notice = () => body().querySelector('[data-testid="std-notice"]')

describe('Save the date: notice', () => {
  it('says it is published when the Save the date is live', async () => {
    await setup()
    expect(notice().textContent).toContain('Tu aviso está publicado')
    expect(notice().querySelector('[aria-current="step"]').textContent).toContain('Guarda la fecha')
  })

  it('says it no longer shows once the full invitation is published, and the preview is flagged inactive', async () => {
    await setup({ ...baseEvent, invitationStage: 'invitation' })
    expect(notice().textContent).toContain('El aviso ya no se muestra')
    expect(notice().querySelector('[aria-current="step"]').textContent).toContain('Invitación completa')
    expect(body().querySelector('[data-testid="std-preview-inactive"]')).not.toBeNull()
  })

  it('says nothing is published for a draft, with no active stage', async () => {
    await setup({ ...baseEvent, status: 'draft' })
    expect(notice().textContent).toContain('Aún no has publicado el aviso')
    expect(notice().querySelector('[aria-current="step"]')).toBeNull()
  })
})

describe('Save the date: form, preview and saving', () => {
  it('starts as "Todo guardado" with no save bar', async () => {
    await setup()
    expect(body().querySelector('[data-testid="std-all-saved"]').textContent).toContain('Todo guardado')
    expect(body().querySelector('[data-testid="std-save-bar"]')).toBeNull()
  })

  it('mirrors the unsaved message and switches in the preview and turns dirty', async () => {
    await setup()
    const preview = () => body().querySelector('aside [data-testid="std-preview"]')
    expect(preview().textContent).toContain('Hola')
    expect(preview().querySelector('[data-testid="std-preview-calendar"]')).toBeNull()
    const textarea = body().querySelector('textarea')
    textarea.value = 'Nuevo mensaje'
    textarea.dispatchEvent(new Event('input'))
    const switches = body().querySelectorAll('[role="switch"]')
    switches[0].click()
    switches[1].click()
    await flushPromises()
    expect(preview().textContent).toContain('Nuevo mensaje')
    expect(preview().querySelector('[data-testid="std-preview-countdown"]')).toBeNull()
    expect(preview().querySelector('[data-testid="std-preview-calendar"]')).not.toBeNull()
    expect(body().querySelector('[data-testid="std-all-saved"]')).toBeNull()
    expect(body().querySelector('[data-testid="std-save-bar"]').textContent).toContain('Cambios sin guardar')
  })

  it('saves from the bar, toasts and goes back to "Todo guardado"', async () => {
    await setup()
    body().querySelector('textarea').value = 'Otro'
    body().querySelector('textarea').dispatchEvent(new Event('input'))
    await flushPromises()
    body().querySelector('[data-testid="std-save-bar"] button').click()
    await flushPromises()
    expect(api.save).toHaveBeenCalledWith(7, expect.objectContaining({ message: 'Otro' }))
    expect(toast.success).toHaveBeenCalledWith('Cambios guardados.')
    expect(body().querySelector('[data-testid="std-all-saved"]')).not.toBeNull()
    expect(body().querySelector('[data-testid="std-save-bar"]')).toBeNull()
  })

  it('opens the preview sheet from the phone button and closes it with Escape', async () => {
    await setup()
    body().querySelector('[data-testid="std-preview-open"]').click()
    await flushPromises()
    const sheet = body().querySelector('[data-testid="bottom-sheet"]')
    expect(sheet).not.toBeNull()
    expect(sheet.querySelector('[data-testid="std-preview"]')).not.toBeNull()
    sheet.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(body().querySelector('[data-testid="bottom-sheet"]')).toBeNull()
  })

  it('offers no save controls to a viewer', async () => {
    await setup({ ...baseEvent, userRole: 'viewer' })
    expect(body().querySelector('[data-testid="std-all-saved"]')).toBeNull()
    expect(body().querySelector('[data-testid="std-save-bar"]')).toBeNull()
  })
})
