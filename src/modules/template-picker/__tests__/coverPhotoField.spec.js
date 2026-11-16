import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ uploadCover: vi.fn(), removeCover: vi.fn(), saveFocus: vi.fn(), size: { width: 1440, height: 1800 } }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))
vi.mock('../utils/templatePicker', async importOriginal => ({ ...(await importOriginal()), readImageSize: vi.fn(async () => mocks.size) }))

import CoverPhotoField from '../components/CoverPhotoField.vue'

const apiError = (status, data) => Object.assign(new Error('x'), { response: { status, data } })
const VALUE = { url: 'https://x.test/c.webp', thumbUrl: 'https://x.test/t.webp', focus: '50% 50%', width: 1440, height: 1800 }
const field = value => ({ id: 'cover_photo', label: { es: 'Foto de portada', en: 'Cover photo' }, aspect: '4:5', minWidth: 960, value })
const text = () => document.body.textContent.replace(/\s+/g, ' ')
const button = label => [...document.body.querySelectorAll('button')].find(b => b.textContent.replace(/\s+/g, ' ').trim().includes(label))

let wrapper
const mountField = (value = null) => {
  wrapper = mount(CoverPhotoField, { props: { eventId: 5, field: field(value) }, global: { plugins: [i18n] }, attachTo: document.body })
  return flushPromises()
}
async function pick(file) {
  const input = wrapper.find('input[type=file]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}
const photo = (name = 'a.jpg', type = 'image/jpeg', size = 2000) => new File([new Uint8Array(size)], name, { type })

beforeEach(() => {
  i18n.global.locale.value = 'es'
  Object.values(mocks).forEach(fn => typeof fn === 'function' && fn.mockReset())
  mocks.size = { width: 1440, height: 1800 }
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('CoverPhotoField', () => {
  it('explains the empty state and offers to upload', async () => {
    await mountField()
    expect(text()).toContain('Sin foto')
    expect(text()).toContain('tu portada mostrará las iniciales')
    expect(button('Subir foto')).toBeDefined()
    expect(button('Quitar')).toBeUndefined()
    expect(wrapper.get('input[type=file]').attributes('accept')).toBe('image/jpeg,image/png,image/webp')
  })

  it.each([
    ['a.heic', 'image/heic', 2000, 'Usa una foto JPG, PNG o WebP'],
    ['a.gif', 'image/gif', 2000, 'Usa una foto JPG, PNG o WebP'],
    ['a.pdf', 'application/pdf', 2000, 'no es una imagen']
  ])('rejects %s before uploading', async (name, type, size, message) => {
    await mountField()
    await pick(photo(name, type, size))
    expect(text()).toContain(message)
    expect(mocks.uploadCover).not.toHaveBeenCalled()
  })

  it('rejects a photo over 10 MB and one narrower than the field asks, keeping the current photo', async () => {
    await mountField(VALUE)
    await pick(photo('big.jpg', 'image/jpeg', 10 * 1024 * 1024 + 1))
    expect(text()).toContain('más de 10 MB')
    mocks.size = { width: 800, height: 1000 }
    await pick(photo())
    expect(text()).toContain('al menos 960 px de ancho')
    expect(mocks.uploadCover).not.toHaveBeenCalled()
    expect(wrapper.find('img').attributes('src')).toBe('https://x.test/t.webp')
  })

  it('uploads, reports the new value and opens the focus step', async () => {
    mocks.uploadCover.mockResolvedValue(VALUE)
    await mountField()
    await pick(photo())
    expect(mocks.uploadCover).toHaveBeenCalledWith(5, expect.any(File), '50% 50%')
    expect(wrapper.emitted('changed')[0]).toEqual([VALUE])
    expect(text()).toContain('Elige qué se ve')
    expect(document.body.querySelector('[role=slider]')).not.toBeNull()
  })

  it.each([
    [422, { errors: { photo: ['too_small'] } }, 'al menos 960 px'],
    [422, { errors: { photo: ['too_many_pixels'] } }, 'demasiados píxeles'],
    [422, { errors: { photo: ['corrupt'] } }, 'No pudimos leer la foto'],
    [422, { errors: { photo: ['unsupported_type'] } }, 'JPG, PNG o WebP'],
    [409, { code: 'package_no_cover_field' }, 'no tiene espacio para una foto'],
    [429, {}, 'Demasiados intentos'],
    [413, {}, 'más de 10 MB'],
    [500, {}, 'No pudimos subir la foto']
  ])('shows the reason when the server answers %i', async (status, data, message) => {
    mocks.uploadCover.mockRejectedValue(apiError(status, data))
    await mountField(VALUE)
    await pick(photo())
    expect(text()).toContain(message)
    expect(wrapper.emitted('changed')).toBeUndefined()
  })

  it('saves the chosen focus only when it changed (arrow keys move it)', async () => {
    mocks.saveFocus.mockResolvedValue({})
    await mountField(VALUE)
    await button('Ajustar encuadre').click()
    await flushPromises()
    await button('Listo').click()
    await flushPromises()
    expect(mocks.saveFocus).not.toHaveBeenCalled()

    await button('Ajustar encuadre').click()
    await flushPromises()
    const slider = document.body.querySelector('[role=slider]')
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await flushPromises()
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await flushPromises()
    expect(slider.getAttribute('aria-valuetext')).toBe('Horizontal 55%, vertical 55%')
    await button('Listo').click()
    await flushPromises()
    expect(mocks.saveFocus).toHaveBeenCalledWith(5, '55% 55%')
    expect(wrapper.emitted('changed').at(-1)[0].focus).toBe('55% 55%')
  })

  it('removes the photo after confirming and goes back to the empty state', async () => {
    mocks.removeCover.mockResolvedValue()
    await mountField(VALUE)
    await button('Quitar').click()
    await flushPromises()
    expect(text()).toContain('¿Quitar la foto de portada?')
    await button('Quitar foto').click()
    await flushPromises()
    expect(mocks.removeCover).toHaveBeenCalledWith(5)
    expect(wrapper.emitted('changed')[0]).toEqual([null])
    expect(text()).toContain('Sin foto')
  })

  it('falls back to the empty look when the photo file is gone', async () => {
    await mountField(VALUE)
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(text()).toContain('Sin foto')
  })
})
