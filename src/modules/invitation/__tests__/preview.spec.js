import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.stubEnv('VITE_ADMIN_URL', 'https://admin.example.test/dashboard')

// The preview must never reach the API: any call to the service fails the test.
vi.mock('@/services/PublicEvents/InvitationService', () => ({
  default: {
    get: vi.fn(() => {
      throw new Error('API called from preview')
    }),
    saveRsvp: vi.fn(() => {
      throw new Error('API called from preview')
    })
  }
}))

import i18n from '@/locales/i18n'
import InvitationPreviewView from '../views/InvitationPreviewView.vue'
import { isValidPayload, parseOrigin } from '../composables/previewMessage'

const ADMIN = 'https://admin.example.test'

const payload = () => ({
  locale: 'es',
  branding: { watermark: false },
  event: { name: 'Los XV de Valentina', typeSlug: 'quince' },
  theme: { colors: { primary: '#b04a62' }, fonts: {} },
  sections: [
    { type: 'closing', title: 'Gracias por acompañarme', text: '<b>texto</b>', data: {} },
    { type: 'unknown', title: 'ignored', data: {} }
  ]
})

function send(data, origin = ADMIN, source = window.parent) {
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

describe('InvitationPreviewView', () => {
  it('announces itself to the admin origin only and waits for content', () => {
    expect(parentPost).toHaveBeenCalledWith({ type: 'qv-preview-ready' }, ADMIN)
    expect(wrapper.text()).toContain('Esperando vista previa')
    expect(document.head.querySelector('meta[name="robots"][content="noindex"]')).not.toBeNull()
  })

  it('ignores messages from any other origin', async () => {
    await send({ type: 'qv-preview', payload: payload() }, 'https://evil.example.test')
    expect(wrapper.text()).toContain('Esperando vista previa')
    expect(wrapper.text()).not.toContain('Gracias por acompañarme')
  })

  it('ignores messages that do not come from the embedding admin window, even from the right origin', async () => {
    const stranger = document.createElement('iframe')
    document.body.appendChild(stranger)
    await send({ type: 'qv-preview', payload: payload() }, ADMIN, stranger.contentWindow)
    await send({ type: 'qv-preview', payload: payload() }, ADMIN, null)
    expect(wrapper.text()).toContain('Esperando vista previa')
    stranger.remove()
  })

  it('ignores messages of another type', async () => {
    await send({ type: 'other', payload: payload() })
    expect(wrapper.text()).toContain('Esperando vista previa')
  })

  it('rejects an invalid payload and keeps the last valid one', async () => {
    await send({ type: 'qv-preview', payload: { sections: 'nope', theme: {} } })
    expect(wrapper.text()).toContain('El contenido recibido no es válido')
    await send({ type: 'qv-preview', payload: payload() })
    expect(wrapper.text()).toContain('Gracias por acompañarme')
    await send({ type: 'qv-preview', payload: { sections: [] } })
    expect(wrapper.text()).toContain('Gracias por acompañarme')
    expect(wrapper.text()).toContain('Se mantiene la última vista previa válida')
  })

  it('renders the sections of a valid payload as text, never as HTML', async () => {
    await send({ type: 'qv-preview', payload: payload() })
    expect(wrapper.text()).toContain('Gracias por acompañarme')
    expect(wrapper.text()).not.toContain('ignored')
    expect(wrapper.find('b').exists()).toBe(false)
  })

  describe('template packages', () => {
    const packaged = () => ({
      locale: 'es',
      branding: { watermark: false },
      event: { name: 'Los XV de Valentina', typeSlug: 'quinceanera', startsAt: '2027-06-12T18:00:00', timezone: 'America/New_York' },
      guest: { name: 'Rosa Fernández' },
      stage: 'invitation',
      theme: {
        colors: { primary: '#b04a62' },
        fonts: {},
        package: {
          slug: 'draftpkg',
          version: '1.0.0',
          engineMin: 1,
          cssUrl: `${window.location.origin}/template-packages/_staging/01ARZ3NDEKTSV4RRFFQ69G5FAV/theme.css`,
          templates: { cover: { v: 1, kind: 'section', nodes: [{ t: 'el', tag: 'div', attrs: { class: 'pkg-draft' }, children: [{ t: 'text', v: 'Borrador del paquete' }] }] } }
        }
      },
      sections: [{ type: 'cover', render: 'package', title: 'Hola', text: null, data: { eventName: 'Los XV de Valentina' } }]
    })

    afterEach(() => document.head.querySelectorAll('link[rel="stylesheet"]').forEach(node => node.remove()))

    it('draws theme.package (a draft served from staging) with the package engine', async () => {
      await send({ type: 'qv-preview', payload: packaged() })
      expect(wrapper.find('.pkg-draft').exists()).toBe(true)
      expect(wrapper.text()).toContain('Borrador del paquete')
      expect(wrapper.get('.inv-root').attributes('data-inv-theme')).toBe('draftpkg')
      expect(document.head.querySelector('link[rel="stylesheet"][href*="_staging"]')).not.toBeNull()
    })

    it('ignores a package whose CSS is outside the allowed assets origin and shows the plain theme', async () => {
      const payload = packaged()
      payload.theme.package.cssUrl = 'https://evil.example.test/theme.css'
      await send({ type: 'qv-preview', payload })
      expect(wrapper.find('.pkg-draft').exists()).toBe(false)
      expect(wrapper.get('.inv-root').attributes('data-inv-theme')).toBe('classic')
      expect(document.head.querySelector('link[href*="evil.example"]')).toBeNull()
    })

    it('goes back to Clásica when the next payload has no package', async () => {
      await send({ type: 'qv-preview', payload: packaged() })
      await send({ type: 'qv-preview', payload: payload() })
      expect(wrapper.find('.pkg-draft').exists()).toBe(false)
      expect(wrapper.get('.inv-root').attributes('data-inv-theme')).toBe('classic')
    })

    it('carries the stage (save the date) of the payload to the root', async () => {
      await send({ type: 'qv-preview', payload: { ...packaged(), stage: 'save_the_date' } })
      expect(wrapper.get('.inv-root').attributes('data-inv-stage')).toBe('save_the_date')
    })
  })

  it('does not use v-html in the preview or its components', () => {
    const sources = import.meta.glob(
      ['../views/InvitationPreviewView.vue', '../components/*.vue'],
      { query: '?raw', import: 'default', eager: true }
    )
    expect(Object.keys(sources).length).toBeGreaterThan(5)
    for (const source of Object.values(sources)) expect(source).not.toContain('v-html')
  })
})

describe('preview helpers', () => {
  it('parses origins and validates the payload shape', () => {
    expect(parseOrigin('http://dev.admin.cwm.com/x')).toBe('http://dev.admin.cwm.com')
    expect(parseOrigin(undefined)).toBeNull()
    expect(parseOrigin('not a url')).toBeNull()
    expect(isValidPayload(payload())).toBe(true)
    expect(isValidPayload(null)).toBe(false)
    expect(isValidPayload({ sections: [], theme: [] })).toBe(false)
  })
})
