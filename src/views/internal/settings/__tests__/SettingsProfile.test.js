import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'

const svc = vi.hoisted(() => ({ updateProfile: vi.fn(), refreshUser: vi.fn() }))
vi.mock('@/services/UserService', () => ({ default: svc }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('@/ui/useToast', () => ({ useToast: () => toast }))
const crop = vi.hoisted(() => ({ cropSquareToFile: vi.fn() }))
vi.mock('@/utils/avatarCrop', async importOriginal => ({ ...(await importOriginal()), cropSquareToFile: crop.cropSquareToFile }))

import SettingsProfile from '../SettingsProfile.vue'
import { useUserStore } from '@/stores/useUserStore'

let wrapper
const q = id => wrapper.find(`[data-testid=${id}]`)
const dq = id => document.querySelector(`[data-testid=${id}]`)

async function mountProfile(user = {}) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const store = useUserStore()
  Object.assign(store, { name: 'Valentina', email: 'val@cwm.test', phone: '+13055550123', avatar: '', ...user })
  svc.refreshUser.mockResolvedValue({ status: 200, data: { data: { user: { name: store.name, email: store.email, phone: store.phone, avatar_url: store.avatar } } } })
  wrapper = mount(SettingsProfile, { global: { plugins: [i18n, pinia] }, attachTo: document.body })
  await flushPromises()
  return store
}
const type = async (selector, value) => {
  await wrapper.find(selector).setValue(value)
  await flushPromises()
}
const pick = async file => {
  const input = q('photo-input')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}
const image = (name, mime, size = 1000) => {
  const f = new File(['x'], name, { type: mime })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

beforeEach(() => {
  setLocale('es')
  Object.values(svc).forEach(m => m.mockReset())
  toast.success.mockReset()
  toast.error.mockReset()
  crop.cropSquareToFile.mockReset()
  URL.createObjectURL = vi.fn(() => 'blob:photo')
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('SettingsProfile form', () => {
  it('starts saved: "Todo guardado" and the button disabled', async () => {
    await mountProfile()
    expect(q('profile-all-saved').text()).toContain('Todo guardado')
    expect(q('profile-unsaved').exists()).toBe(false)
    expect(wrapper.find('form button[type=submit]').attributes('disabled')).toBeDefined()
    expect(q('profile-save-bar').exists()).toBe(false)
  })

  it('with changes shows "Cambios sin guardar", enables the button and raises the phone bar', async () => {
    await mountProfile()
    await type('#account_name', 'Valentina Rojas')
    expect(q('profile-unsaved').text()).toBe('Cambios sin guardar')
    expect(q('profile-all-saved').exists()).toBe(false)
    expect(wrapper.find('form button[type=submit]').attributes('disabled')).toBeUndefined()
    expect(q('profile-save-row').classes()).toContain('max-md:hidden')
    const bar = q('profile-save-bar')
    expect(bar.classes()).toEqual(expect.arrayContaining(['fixed', 'md:hidden', 'left-4', 'right-4']))
    expect(bar.text()).toContain('Cambios sin guardar')
    expect(bar.find('button').attributes('form')).toBe('account-profile-form')
  })

  it('saves, toasts "Datos guardados" and goes back to saved', async () => {
    await mountProfile()
    svc.updateProfile.mockResolvedValue({ status: 200 })
    await type('#account_name', 'Valentina Rojas')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await vi.waitFor(() => expect(svc.updateProfile).toHaveBeenCalled())
    await flushPromises()
    expect(svc.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Valentina Rojas' }))
    expect(toast.success).toHaveBeenCalledWith('Datos guardados')
  })

  it('reports a failed save', async () => {
    await mountProfile()
    svc.updateProfile.mockRejectedValue({ response: { data: { errors: {} } } })
    await type('#account_name', 'Otro')
    await wrapper.find('form').trigger('submit')
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled())
  })

  it('uses the right autocomplete and input types', async () => {
    await mountProfile()
    expect(wrapper.find('#account_name').attributes('autocomplete')).toBe('name')
    expect(wrapper.find('#account_phone').attributes('type')).toBe('tel')
    expect(wrapper.find('#account_phone').attributes('autocomplete')).toBe('tel')
  })

  it('turns the support address into a mailto link with the subject', async () => {
    await mountProfile()
    const link = q('email-change-link')
    expect(link.attributes('href')).toBe('mailto:hola@quinvite.com?subject=Cambiar%20mi%20correo')
    expect(link.text()).toBe('hola@quinvite.com')
  })

  it('does not cut a long name', async () => {
    await mountProfile({ name: 'María de los Ángeles Fernández de la Vega y Montenegro' })
    expect(q('profile-name').classes()).not.toContain('truncate')
    expect(q('profile-name').text()).toContain('Montenegro')
  })
})

describe('SettingsProfile photo', () => {
  it('offers "Cambiar foto" always and "Quitar foto" only with a photo', async () => {
    await mountProfile()
    expect(q('photo-change').text()).toBe('Cambiar foto')
    expect(q('photo-remove').exists()).toBe(false)
    wrapper.unmount()
    await mountProfile({ avatar: 'https://api.test/storage/avatars/a.jpg' })
    expect(q('photo-remove').text()).toBe('Quitar foto')
  })

  it('accepts only JPG, PNG and WebP images', async () => {
    await mountProfile()
    expect(q('photo-input').attributes('accept')).toBe('image/jpeg,image/png,image/webp')
  })

  it('refuses a wrong type and a huge file with a message, without opening the dialog', async () => {
    await mountProfile()
    await pick(image('a.gif', 'image/gif'))
    expect(toast.error).toHaveBeenLastCalledWith('Elige una imagen JPG, PNG o WebP.')
    await pick(image('a.png', 'image/png', 20 * 1024 * 1024))
    expect(toast.error).toHaveBeenLastCalledWith(expect.stringContaining('12 MB'))
    expect(dq('photo-preview')).toBeNull()
  })

  it('opens the circular preview for a good image and uploads the cropped file with the stored name and phone', async () => {
    const store = await mountProfile()
    await pick(image('a.jpg', 'image/jpeg'))
    expect(dq('photo-preview').className).toContain('rounded-full')
    const cropped = new File(['c'], 'avatar.jpg', { type: 'image/jpeg' })
    crop.cropSquareToFile.mockResolvedValue(cropped)
    svc.updateProfile.mockResolvedValue({ status: 200 })
    dq('photo-preview').querySelector('img').dispatchEvent(new Event('load'))
    await flushPromises()
    dq('photo-confirm').click()
    await flushPromises()
    expect(svc.updateProfile).toHaveBeenCalledWith({ name: store.name, phone: store.phone, avatar: cropped, removeAvatar: false })
    expect(toast.success).toHaveBeenCalledWith('Foto actualizada')
    expect(dq('photo-preview')).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo')
  })

  it('does not upload a cropped file over 2 MB', async () => {
    await mountProfile()
    await pick(image('a.jpg', 'image/jpeg'))
    const big = new File(['c'], 'avatar.jpg', { type: 'image/jpeg' })
    Object.defineProperty(big, 'size', { value: 3 * 1024 * 1024 })
    crop.cropSquareToFile.mockResolvedValue(big)
    dq('photo-preview').querySelector('img').dispatchEvent(new Event('load'))
    await flushPromises()
    dq('photo-confirm').click()
    await flushPromises()
    expect(svc.updateProfile).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('2 MB'))
  })

  it('reports an upload failure and keeps the dialog open', async () => {
    await mountProfile()
    await pick(image('a.jpg', 'image/jpeg'))
    crop.cropSquareToFile.mockResolvedValue(new File(['c'], 'avatar.jpg', { type: 'image/jpeg' }))
    svc.updateProfile.mockRejectedValue(new Error('boom'))
    dq('photo-preview').querySelector('img').dispatchEvent(new Event('load'))
    await flushPromises()
    dq('photo-confirm').click()
    await flushPromises()
    expect(toast.error).toHaveBeenCalledWith('No pudimos actualizar tu foto. Inténtalo de nuevo.')
    expect(dq('photo-preview')).not.toBeNull()
  })

  it('closes and warns when the image cannot be read', async () => {
    await mountProfile()
    await pick(image('a.jpg', 'image/jpeg'))
    dq('photo-preview').querySelector('img').dispatchEvent(new Event('error'))
    await flushPromises()
    expect(toast.error).toHaveBeenCalledWith('No pudimos leer esa imagen. Prueba con otra.')
    expect(dq('photo-preview')).toBeNull()
  })

  it('removes the photo by sending remove_avatar (mocked service; the real call needs the API branch)', async () => {
    const store = await mountProfile({ avatar: 'https://api.test/storage/avatars/a.jpg' })
    svc.updateProfile.mockResolvedValue({ status: 200 })
    await q('photo-remove').trigger('click')
    await flushPromises()
    expect(svc.updateProfile).toHaveBeenCalledWith({ name: store.name, phone: store.phone, avatar: undefined, removeAvatar: true })
    expect(toast.success).toHaveBeenCalledWith('Foto quitada')
  })

  it('reports a failed removal', async () => {
    await mountProfile({ avatar: 'https://api.test/storage/avatars/a.jpg' })
    svc.updateProfile.mockResolvedValue({ status: 500 })
    await q('photo-remove').trigger('click')
    await flushPromises()
    expect(toast.error).toHaveBeenCalledWith('No pudimos actualizar tu foto. Inténtalo de nuevo.')
  })
})
