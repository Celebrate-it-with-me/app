import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'
import en from '@/locales/en'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), toast: vi.fn() }))
vi.mock('@/ui', async importOriginal => ({ ...(await importOriginal()), useToast: () => toast }))
const events = vi.hoisted(() => ({ activeEvent: { id: 7, locale: 'en', menu: [] }, activeEventHasMenu: false }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => events }))
const saveBlob = vi.hoisted(() => vi.fn())
vi.mock('@/modules/roster/utils/roster', () => ({ saveBlob }))

import SeatingService, { filenameOf } from '../services/SeatingService'
import SeatingExportModal from '../components/SeatingExportModal.vue'
import SeatingView from '../views/SeatingView.vue'
import { exportErrorKey } from '../utils/seating'

const Modal = {
  props: ['open', 'title', 'description'],
  emits: ['update:open'],
  template: '<div v-if="open" class="modal"><h2>{{ title }}</h2><button class="modal-x" @click="$emit(\'update:open\', false)">x</button><slot /><slot name="footer" /></div>'
}
const i18n = (locale = 'es') => createI18n({ legacy: false, locale, fallbackLocale: 'es', messages: { es, en } })
const apiError = status => Object.assign(new Error('x'), { response: { status } })
const file = (name = 'catering-xv-2026-11-18.xlsx') => ({ data: new Blob(['x']), headers: { 'content-disposition': `attachment; filename="${name}"` } })

let wrapper
const mountModal = (props = {}, locale) => {
  wrapper = mount(SeatingExportModal, { props: { open: true, eventId: 7, ...props }, global: { plugins: [i18n(locale)], stubs: { UiModal: Modal } } })
  return wrapper
}
const btn = text => wrapper.findAll('button').find(b => b.text().includes(text))

beforeEach(() => {
  setActivePinia(createPinia())
  Object.values(api).forEach(fn => fn.mockReset())
  Object.values(toast).forEach(fn => fn.mockReset())
  saveBlob.mockReset()
})
afterEach(() => wrapper?.unmount())

describe('SeatingService.downloadCatering', () => {
  it('asks for the binary file with the chosen options', async () => {
    api.get.mockResolvedValue(file())
    const out = await SeatingService.downloadCatering(7, { format: 'pdf', locale: 'en', includePending: true })
    expect(api.get).toHaveBeenCalledWith('event/7/seating/export/catering', { params: { format: 'pdf', locale: 'en', include_pending: 1 }, responseType: 'blob' })
    expect(out.filename).toBe('catering-xv-2026-11-18.xlsx')
    expect(out.blob).toBeInstanceOf(Blob)
  })
  it('defaults to xlsx, confirmed only, and falls back to a file name', async () => {
    api.get.mockResolvedValue({ data: new Blob(['x']), headers: {} })
    const out = await SeatingService.downloadCatering(7)
    expect(api.get).toHaveBeenCalledWith('event/7/seating/export/catering', { params: { format: 'xlsx', locale: undefined, include_pending: 0 }, responseType: 'blob' })
    expect(out.filename).toBe('catering.xlsx')
    expect(filenameOf(undefined, 'a.pdf')).toBe('a.pdf')
    expect(filenameOf({ headers: { 'content-disposition': 'attachment; filename=plain.pdf' } }, 'x')).toBe('plain.pdf')
  })
})

describe('exportErrorKey', () => {
  it.each([[429, 'tooMany'], [403, 'forbidden'], [401, 'forbidden'], [404, 'missing'], [422, 'invalid'], [500, 'generic'], [undefined, 'generic']])('%s -> %s', (status, key) => {
    expect(exportErrorKey(status ? apiError(status) : null)).toBe(key)
  })
})

describe('SeatingExportModal', () => {
  it('shows the formats, the pending switch off and the menu notice', () => {
    mountModal({ hasMenu: false })
    const text = wrapper.text()
    expect(text).toContain('Excel (.xlsx)')
    expect(text).toContain('PDF para imprimir')
    expect(text).toContain('Los que declinaron nunca entran')
    expect(text).toContain('Solo verás el recuento por mesa')
    expect(text).toContain('No lleva teléfonos ni correos')
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('false')
  })

  it('hides the notice when the event has a menu, and speaks English', () => {
    mountModal({ hasMenu: true }, 'en')
    expect(wrapper.text()).not.toContain('only see the count per table')
    expect(wrapper.text()).toContain('Printable PDF')
  })

  it('downloads the Excel with the event language and closes', async () => {
    api.get.mockResolvedValue(file())
    mountModal({ eventLocale: 'en' })
    await btn('Descargar').trigger('click')
    await flushPromises()
    expect(api.get.mock.calls[0][1].params).toEqual({ format: 'xlsx', locale: 'en', include_pending: 0 })
    expect(saveBlob).toHaveBeenCalledWith(expect.any(Blob), 'catering-xv-2026-11-18.xlsx')
    expect(toast.success).toHaveBeenCalledWith('Archivo descargado.')
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
  })

  it('downloads the PDF with pending guests when asked', async () => {
    api.get.mockResolvedValue(file('catering-xv-2026-11-18.pdf'))
    mountModal({ eventLocale: 'fr' })
    await wrapper.findAll('[role="radio"]')[1].trigger('click')
    await wrapper.find('[role="switch"]').trigger('click')
    await btn('Descargar').trigger('click')
    await flushPromises()
    expect(api.get.mock.calls[0][1].params).toEqual({ format: 'pdf', locale: 'es', include_pending: 1 })
    expect(saveBlob).toHaveBeenCalledWith(expect.any(Blob), 'catering-xv-2026-11-18.pdf')
  })

  it('shows the downloading state and ignores a second click', async () => {
    let finish
    api.get.mockReturnValue(new Promise(r => (finish = r)))
    mountModal()
    await btn('Descargar').trigger('click')
    expect(wrapper.text()).toContain('Descargando...')
    await wrapper.find('button[disabled]').trigger('click')
    expect(api.get).toHaveBeenCalledTimes(1)
    finish(file())
    await flushPromises()
    expect(wrapper.text()).not.toContain('Descargando...')
  })

  it.each([
    [429, 'Demasiadas descargas, espera un minuto'],
    [403, 'No tienes permiso'],
    [404, 'No encontramos este evento'],
    [422, 'opciones no son válidas'],
    [500, 'No pudimos generar el archivo']
  ])('explains a %s and stays open', async (status, text) => {
    api.get.mockRejectedValue(apiError(status))
    mountModal()
    await btn('Descargar').trigger('click')
    await flushPromises()
    expect(toast.error.mock.calls[0][0]).toContain(text)
    expect(wrapper.find('[role="alert"]').text()).toContain(text)
    expect(saveBlob).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('resets its options each time it opens, and cancels', async () => {
    mountModal({ open: false })
    await wrapper.setProps({ open: true })
    await wrapper.find('[role="switch"]').trigger('click')
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('false')
    await btn('Cancelar').trigger('click')
    expect(wrapper.emitted('update:open').at(-1)).toEqual([false])
    await wrapper.find('.modal-x').trigger('click')
  })
})

describe('SeatingView export button', () => {
  it('opens the export panel with the event language and the menu notice', async () => {
    api.get.mockResolvedValue({ data: { data: [] } })
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
    wrapper = mount(SeatingView, { global: { plugins: [i18n()], stubs: { UiModal: Modal, ModuleTemplateGate: true, ModuleTemplateNotice: true } } })
    await flushPromises()
    await btn('Exportar para catering y salón').trigger('click')
    expect(wrapper.find('.modal h2').text()).toBe('Exportar para catering y salón')
    expect(wrapper.text()).toContain('Solo verás el recuento por mesa')
    events.activeEvent = { id: 7, locale: 'es' }
  })
})
