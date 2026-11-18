import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'

const mocks = vi.hoisted(() => ({ preview: vi.fn() }))
vi.mock('../services/TemplatePickerService', () => ({ default: mocks }))

import InvitationMiniature from '../components/InvitationMiniature.vue'
import { coverOnly, useInvitationMiniature } from '../composables/useInvitationMiniature'
import { iframeSlots } from '../composables/useIframeSlots'

const payload = () => ({
  locale: 'es',
  theme: { colors: {} },
  sections: [
    { type: 'cover', title: 'Mis XV', data: {} },
    { type: 'story', title: 'Historia', data: {} },
    { type: 'rsvp', data: {} }
  ]
})

let wrapper
const instances = []
async function mountMini(props = {}) {
  wrapper = mount(InvitationMiniature, { props: { eventId: 5, width: 78, name: 'Valentina', ...props }, global: { plugins: [i18n] }, attachTo: document.body })
  instances.push(wrapper)
  await flushPromises()
  return wrapper
}
function handshake(w) {
  const frame = w.get('[data-testid=miniature-frame]').element
  const post = vi.spyOn(frame.contentWindow, 'postMessage')
  window.dispatchEvent(new MessageEvent('message', { data: { type: 'qv-preview-ready' }, origin: window.location.origin, source: frame.contentWindow }))
  return post
}

beforeEach(() => {
  i18n.global.locale.value = 'es'
  mocks.preview.mockReset()
  mocks.preview.mockResolvedValue(payload())
})
afterEach(() => {
  instances.splice(0).forEach(w => w.unmount())
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('coverOnly', () => {
  it('keeps only the cover section', () => {
    expect(coverOnly(payload()).sections).toEqual([{ type: 'cover', title: 'Mis XV', data: {} }])
  })
  it('returns null without cover, without theme or for junk', () => {
    expect(coverOnly({ theme: {}, sections: [{ type: 'story' }] })).toBeNull()
    expect(coverOnly({ sections: [{ type: 'cover' }] })).toBeNull()
    expect(coverOnly(null)).toBeNull()
    expect(coverOnly({ theme: {}, sections: 'x' })).toBeNull()
  })
})

describe('InvitationMiniature live view', () => {
  it('asks the API for the active template with the app language and shows a skeleton until the handshake', async () => {
    const w = await mountMini()
    expect(mocks.preview).toHaveBeenCalledWith(5, { templateId: null, locale: 'es', state: undefined, preset: undefined, fields: undefined })
    expect(w.find('[data-testid=miniature-skeleton]').exists()).toBe(true)
    expect(w.attributes('data-state')).toBe('loading')
  })

  it('passes an explicit template id', async () => {
    await mountMini({ templateId: 3 })
    expect(mocks.preview.mock.calls[0][1].templateId).toBe(3)
  })

  it('on the handshake posts only the cover to its own origin and then shows the frame', async () => {
    const w = await mountMini()
    const post = handshake(w)
    await flushPromises()
    expect(post).toHaveBeenCalledTimes(1)
    const [message, target] = post.mock.calls[0]
    expect(target).toBe(window.location.origin)
    expect(message.type).toBe('qv-preview')
    expect(message.payload.sections.map(item => item.type)).toEqual(['cover'])
    expect(w.attributes('data-state')).toBe('ready')
    expect(w.find('[data-testid=miniature-skeleton]').exists()).toBe(false)
  })

  it('ignores handshakes from other origins or other windows', async () => {
    const w = await mountMini()
    const frame = w.get('[data-testid=miniature-frame]').element
    const post = vi.spyOn(frame.contentWindow, 'postMessage')
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'qv-preview-ready' }, origin: 'https://evil.test', source: frame.contentWindow }))
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'qv-preview-ready' }, origin: window.location.origin, source: window }))
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'other' }, origin: window.location.origin, source: frame.contentWindow }))
    expect(post).not.toHaveBeenCalled()
  })

  it('scales the 390x844 frame to the width, inert and out of the tab order', async () => {
    const w = await mountMini({ width: 78 })
    const frame = w.get('[data-testid=miniature-frame]')
    expect(frame.attributes('style')).toContain('width: 390px')
    expect(frame.attributes('style')).toContain('height: 844px')
    expect(frame.attributes('style')).toContain('scale(0.2)')
    expect(frame.attributes('style')).toContain('left top')
    expect(frame.attributes('inert')).toBeDefined()
    expect(frame.attributes('tabindex')).toBe('-1')
    expect(frame.attributes('aria-hidden')).toBe('true')
    expect(frame.classes()).toContain('pointer-events-none')
    expect(w.attributes('style')).toContain('height: 169px')
    expect(w.attributes('role')).toBe('img')
    expect(w.attributes('aria-label')).toBe('Vista en miniatura de la invitación de Valentina')
  })

  it('measures its parent when no width is given', async () => {
    let observer
    vi.stubGlobal('ResizeObserver', class { constructor(cb) { observer = cb } observe() {} disconnect() {} })
    const w = await mountMini({ width: null })
    observer([{ contentRect: { width: 195 } }])
    await flushPromises()
    expect(w.get('[data-testid=miniature-frame]').attributes('style')).toContain('scale(0.5)')
  })

  it('is lazy: nothing loads until it is on screen', async () => {
    let notify
    vi.stubGlobal('IntersectionObserver', class { constructor(cb) { notify = cb } observe() {} disconnect() {} })
    const w = await mountMini()
    expect(mocks.preview).not.toHaveBeenCalled()
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(false)
    notify([{ isIntersecting: false }])
    await flushPromises()
    expect(mocks.preview).not.toHaveBeenCalled()
    notify([{ isIntersecting: true }])
    await flushPromises()
    expect(mocks.preview).toHaveBeenCalledTimes(1)
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(true)
  })

  it('limits simultaneous iframes and serves the waiting one when another goes away', async () => {
    const mounted = []
    for (let i = 0; i < 4; i++) mounted.push(await mountMini())
    expect(document.querySelectorAll('[data-testid=miniature-frame]')).toHaveLength(3)
    mounted[0].unmount()
    await flushPromises()
    expect(document.querySelectorAll('[data-testid=miniature-frame]')).toHaveLength(3)
    expect(mounted[3].find('[data-testid=miniature-frame]').exists()).toBe(true)
    expect(iframeSlots.stats().waiting).toBe(0)
  })
})

describe('InvitationMiniature fallbacks', () => {
  it('falls back to the template image when the API fails', async () => {
    mocks.preview.mockRejectedValue({ response: { status: 500 } })
    const w = await mountMini({ fallbackImage: 'https://cdn.test/a.webp' })
    expect(w.attributes('data-state')).toBe('fallback')
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(false)
    expect(w.get('[data-testid=miniature-image]').attributes('src')).toBe('https://cdn.test/a.webp')
  })

  it('falls back on 429 and releases its slot', async () => {
    mocks.preview.mockRejectedValue({ response: { status: 429 } })
    const w = await mountMini()
    expect(w.attributes('data-state')).toBe('fallback')
    expect(iframeSlots.stats().active).toBe(0)
  })

  it('draws the stationery card without image, with the name when it is big enough', async () => {
    mocks.preview.mockRejectedValue(new Error('x'))
    const big = await mountMini({ width: 144, dateLabel: 'sábado 1 de mayo' })
    expect(big.get('[data-testid=miniature-card]').text()).toContain('Valentina')
    expect(big.get('[data-testid=miniature-card]').text()).toContain('sábado 1 de mayo')
    const small = await mountMini({ width: 56 })
    expect(small.get('[data-testid=miniature-card]').text()).toBe('')
  })

  it('goes from a broken fallback image to the card', async () => {
    mocks.preview.mockRejectedValue(new Error('x'))
    const w = await mountMini({ fallbackImage: 'https://cdn.test/broken.webp' })
    await w.get('[data-testid=miniature-image]').trigger('error')
    expect(w.find('[data-testid=miniature-card]').exists()).toBe(true)
  })

  it('falls back when the payload has no cover', async () => {
    mocks.preview.mockResolvedValue({ theme: {}, sections: [{ type: 'story' }] })
    expect((await mountMini()).attributes('data-state')).toBe('fallback')
  })

  it('does not call the API when live is off or there is no event', async () => {
    expect((await mountMini({ live: false })).attributes('data-state')).toBe('fallback')
    expect((await mountMini({ eventId: null })).attributes('data-state')).toBe('fallback')
    expect(mocks.preview).not.toHaveBeenCalled()
  })

  it('gives up after the timeout and ignores a late answer', async () => {
    vi.useFakeTimers()
    let resolve
    mocks.preview.mockReturnValue(new Promise(r => (resolve = r)))
    const w = mount(InvitationMiniature, { props: { eventId: 5, width: 78, timeout: 500 }, global: { plugins: [i18n] }, attachTo: document.body })
    instances.push(w)
    await flushPromises()
    expect(w.attributes('data-state')).toBe('loading')
    await vi.advanceTimersByTimeAsync(600)
    expect(w.attributes('data-state')).toBe('fallback')
    resolve(payload())
    await flushPromises()
    expect(w.attributes('data-state')).toBe('fallback')
    expect(w.find('[data-testid=miniature-frame]').exists()).toBe(false)
  })

  it('reloads and resends when the template changes', async () => {
    const w = await mountMini({ templateId: 1 })
    const post = handshake(w)
    await flushPromises()
    await w.setProps({ templateId: 2 })
    await flushPromises()
    expect(mocks.preview).toHaveBeenCalledTimes(2)
    expect(post).toHaveBeenCalledTimes(2)
  })
})

describe('useInvitationMiniature', () => {
  it('reports error codes and can be reset', async () => {
    mocks.preview.mockRejectedValue({ response: { status: 429 } })
    let api
    const Host = { setup() { api = useInvitationMiniature(5, { timeout: 1000 }); return () => null } }
    mount(Host)
    await api.load()
    expect(api.status.value).toBe('failed')
    expect(api.error.value).toBe('too_many_attempts')
    api.reset()
    expect(api.status.value).toBe('idle')
  })
})
