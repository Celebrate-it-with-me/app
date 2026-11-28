import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'

const crop = vi.hoisted(() => ({ cropSquareToFile: vi.fn() }))
vi.mock('@/utils/avatarCrop', () => ({ cropSquareToFile: crop.cropSquareToFile }))

import ProfilePhotoDialog from '../ProfilePhotoDialog.vue'

let wrapper
const dq = id => document.querySelector(`[data-testid=${id}]`)
const mountIt = async (props = {}) => {
  wrapper = mount(ProfilePhotoDialog, { props: { open: true, src: 'blob:photo', ...props }, attachTo: document.body, global: { plugins: [i18n] } })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  crop.cropSquareToFile.mockReset()
})
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

describe('ProfilePhotoDialog', () => {
  it('keeps "Usar esta foto" off until the picture has loaded, then hands over the cropped file', async () => {
    const file = new File(['x'], 'me.jpg', { type: 'image/jpeg' })
    crop.cropSquareToFile.mockResolvedValue(file)
    await mountIt()
    expect(dq('photo-confirm').disabled).toBe(true)
    document.querySelector('[data-testid=photo-preview] img').dispatchEvent(new Event('load'))
    await flushPromises()
    expect(dq('photo-confirm').disabled).toBe(false)
    dq('photo-confirm').click()
    await flushPromises()
    expect(wrapper.emitted('confirm')[0][0]).toBe(file)
  })

  it('reports an image that cannot be cropped or shown', async () => {
    crop.cropSquareToFile.mockRejectedValue(new Error('bad'))
    await mountIt()
    const img = document.querySelector('[data-testid=photo-preview] img')
    img.dispatchEvent(new Event('load'))
    await flushPromises()
    dq('photo-confirm').click()
    await flushPromises()
    expect(wrapper.emitted('unreadable')).toHaveLength(1)
    img.dispatchEvent(new Event('error'))
    expect(wrapper.emitted('unreadable')).toHaveLength(2)
  })

  it('"Cancelar" closes it, and nothing can close it while it is saving', async () => {
    await mountIt()
    const cancel = [...document.querySelectorAll('[role=dialog] button')].find(b => b.textContent.trim() === i18n.global.t('account.profile.photo.cancel'))
    cancel.click()
    await flushPromises()
    expect(wrapper.emitted('update:open')[0]).toEqual([false])
    await wrapper.setProps({ busy: true })
    const cancelBusy = [...document.querySelectorAll('[role=dialog] button')].find(b => b.textContent.trim() === i18n.global.t('account.profile.photo.cancel'))
    expect(cancelBusy.disabled).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.emitted('update:open')).toHaveLength(1)
  })

  it('goes back to "not ready" when another picture is chosen', async () => {
    await mountIt()
    document.querySelector('[data-testid=photo-preview] img').dispatchEvent(new Event('load'))
    await flushPromises()
    expect(dq('photo-confirm').disabled).toBe(false)
    await wrapper.setProps({ src: 'blob:other' })
    expect(dq('photo-confirm').disabled).toBe(true)
  })

  it('shows no picture while there is no source', async () => {
    await mountIt({ src: '' })
    expect(document.querySelector('[data-testid=photo-preview] img')).toBeNull()
    expect(dq('photo-confirm').disabled).toBe(true)
  })
})
