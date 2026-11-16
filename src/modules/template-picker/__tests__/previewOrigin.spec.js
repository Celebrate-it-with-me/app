import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

// No admin configured: the only window allowed to drive the preview is the app itself.
vi.stubEnv('VITE_ADMIN_URL', '')

import i18n from '@/locales/i18n'
import InvitationPreviewView from '@/modules/invitation/views/InvitationPreviewView.vue'

const payload = () => ({
  locale: 'es',
  branding: { watermark: false },
  event: { name: 'Los XV de Valentina', typeSlug: 'quince' },
  theme: { colors: { primary: '#b04a62' }, fonts: {} },
  sections: [{ type: 'closing', title: 'Gracias por acompañarme', text: null, data: {} }]
})
const send = (data, origin, source = window.parent) => {
  window.dispatchEvent(new MessageEvent('message', { data, origin, source }))
  return flushPromises()
}

let parentPost
let wrapper
beforeEach(() => {
  i18n.global.locale.value = 'es'
  parentPost = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
  wrapper = mount(InvitationPreviewView, { global: { plugins: [i18n] } })
})
afterEach(() => {
  wrapper.unmount()
  vi.restoreAllMocks()
})

describe('preview driven by the app itself (template selector)', () => {
  it('announces itself to its own origin and renders what the embedding app posts', async () => {
    expect(parentPost).toHaveBeenCalledWith({ type: 'qv-preview-ready' }, window.location.origin)
    await send({ type: 'qv-preview', payload: payload() }, window.location.origin)
    expect(wrapper.text()).toContain('Gracias por acompañarme')
  })

  it('still ignores any other origin, and own-origin messages from a window that is not the embedder', async () => {
    await send({ type: 'qv-preview', payload: payload() }, 'https://evil.example.test')
    const stranger = document.createElement('iframe')
    document.body.appendChild(stranger)
    await send({ type: 'qv-preview', payload: payload() }, window.location.origin, stranger.contentWindow)
    expect(wrapper.text()).not.toContain('Gracias por acompañarme')
    stranger.remove()
  })

  describe('cover photo in the native cover', () => {
    const cover = (image, focus) => ({
      ...payload(),
      event: { name: 'Los XV de Valentina', typeSlug: 'quinceanera', startsAt: '2027-06-12T18:00:00', timezone: 'America/New_York' },
      guest: { name: 'Invitada/o' },
      sections: [{ type: 'cover', title: 'Hola', text: null, data: { eventName: 'Los XV de Valentina', image, focus } }]
    })

    it('centres the photo on the chosen focus and ignores a malformed one', async () => {
      await send({ type: 'qv-preview', payload: cover('/demo/valentina-portrait.webp', '40% 25%') }, window.location.origin)
      expect(wrapper.get('.inv-cover img').attributes('style')).toContain('object-position: 40% 25%')
      await send({ type: 'qv-preview', payload: cover('/demo/valentina-portrait.webp', 'url(javascript:x)') }, window.location.origin)
      expect(wrapper.get('.inv-cover img').attributes('style')).toContain('object-position: 50% 50%')
    })

    it('falls back to the no-photo look when the file cannot be loaded', async () => {
      await send({ type: 'qv-preview', payload: cover('/gone.webp', '50% 50%') }, window.location.origin)
      await wrapper.get('.inv-cover img').trigger('error')
      expect(wrapper.find('.inv-cover img').exists()).toBe(false)
    })
  })
})
