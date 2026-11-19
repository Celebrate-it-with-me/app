import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'
import { useToast } from '@/ui'

const mocks = vi.hoisted(() => ({ uploadCover: vi.fn(), removeCover: vi.fn(), saveFocus: vi.fn() }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))
vi.mock('../utils/templatePicker', async importOriginal => ({ ...(await importOriginal()), readImageSize: vi.fn(async () => ({ width: 1440, height: 1800 })) }))

import CoverPhotoField from '../components/CoverPhotoField.vue'

const apiError = (status, data) => Object.assign(new Error('x'), { response: { status, data } })
const VALUE = { url: 'https://x.test/c.webp', thumbUrl: 'https://x.test/t.webp', focus: '50% 50%', width: 1440, height: 1800 }
const field = value => ({ id: 'cover_photo', label: 'Portada', aspect: '4:5', minWidth: 960, value })
const text = () => document.body.textContent.replace(/\s+/g, ' ')
const button = label => [...document.body.querySelectorAll('button')].find(b => b.textContent.replace(/\s+/g, ' ').trim().includes(label))
const toasts = () => useToast().toasts.map(t => `${t.tone}:${t.title}`)

let wrapper
const mountField = async (value = null) => {
  wrapper = mount(CoverPhotoField, { props: { eventId: 5, field: field(value) }, global: { plugins: [i18n] }, attachTo: document.body })
  await flushPromises()
}
const escape = async () => {
  document.body.querySelector('[role=dialog]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await flushPromises()
}

beforeEach(() => {
  i18n.global.locale.value = 'es'
  Object.values(mocks).forEach(fn => fn.mockReset())
  useToast().toasts.splice(0)
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('CoverPhotoField extra behaviour', () => {
  it('follows the value the parent passes down and gives the photo another chance after a broken image', async () => {
    await mountField(VALUE)
    const img = wrapper.get('img')
    await img.trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    await wrapper.setProps({ field: field({ ...VALUE, thumbUrl: 'https://x.test/new.webp' }) })
    expect(wrapper.get('img').attributes('src')).toBe('https://x.test/new.webp')
    await wrapper.setProps({ field: field(null) })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(text()).toContain('Sin foto')
  })

  it('the upload button opens the file chooser and clears an old error', async () => {
    await mountField()
    const click = vi.spyOn(wrapper.get('input[type=file]').element, 'click').mockImplementation(() => {})
    await button('Subir foto').click()
    expect(click).toHaveBeenCalled()
  })

  it('treats the proxy 413 as a photo that is too big', async () => {
    mocks.uploadCover.mockRejectedValue(apiError(413, {}))
    await mountField()
    const input = wrapper.get('input[type=file]')
    Object.defineProperty(input.element, 'files', { value: [new File([new Uint8Array(2000)], 'a.jpg', { type: 'image/jpeg' })], configurable: true })
    await input.trigger('change')
    await flushPromises()
    expect(text()).toContain('10 MB')
  })

  it('keeps the photo and says why when removing fails', async () => {
    mocks.removeCover.mockRejectedValue(apiError(403, {}))
    await mountField(VALUE)
    await button('Quitar').click()
    await flushPromises()
    button('Quitar foto').click()
    await flushPromises()
    expect(toasts()).toContain('danger:Tu rol solo permite ver la invitación.')
    expect(wrapper.emitted('changed')).toBeUndefined()
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('closing the adjust and remove dialogs with Escape changes nothing', async () => {
    await mountField(VALUE)
    await button('Ajustar encuadre').click()
    await flushPromises()
    expect(document.body.querySelector('[role=slider]')).not.toBeNull()
    await escape()
    expect(document.body.querySelector('[role=slider]')).toBeNull()
    await button('Quitar').click()
    await flushPromises()
    await escape()
    expect(document.body.querySelector('[role=dialog]')).toBeNull()
    expect(mocks.saveFocus).not.toHaveBeenCalled()
    expect(mocks.removeCover).not.toHaveBeenCalled()
  })
})
