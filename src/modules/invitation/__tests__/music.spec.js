import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationMusic from '../components/InvitationMusic.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

const { play, pause } = vi.hoisted(() => ({ play: vi.fn(), pause: vi.fn() }))

beforeEach(() => {
  play.mockReset().mockImplementation(function () {
    Object.defineProperty(this, 'paused', { value: false, configurable: true })
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  })
  pause.mockReset().mockImplementation(function () {
    Object.defineProperty(this, 'paused', { value: true, configurable: true })
    this.dispatchEvent(new Event('pause'))
  })
  HTMLMediaElement.prototype.play = play
  HTMLMediaElement.prototype.pause = pause
})
afterEach(() => vi.restoreAllMocks())

function mountMusic({ preview = false, data = {} } = {}) {
  return mount(InvitationMusic, {
    props: {
      section: {
        type: 'music',
        title: null,
        settings: { title: 'Nuestra canción' },
        data: { url: 'https://x.test/a.mp3', title: 'Nuestra canción', mimeType: 'audio/mpeg', loop: true, ...data }
      }
    },
    global: { provide: { [INVITATION_KEY]: { invitation: ref({ locale: 'es' }), tt, preview } } }
  })
}

describe('InvitationMusic', () => {
  it('never plays on its own and creates no audio before the first tap', () => {
    const created = vi.spyOn(globalThis, 'Audio')
    const wrapper = mountMusic()
    expect(play).not.toHaveBeenCalled()
    expect(created).not.toHaveBeenCalled()
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false')
    expect(wrapper.get('button').attributes('aria-label')).toBe(`${tt('music.play')}: Nuestra canción`)
  })

  it('plays only after a tap with preload none, then pauses on the second tap', async () => {
    const wrapper = mountMusic()
    await wrapper.get('button').trigger('click')
    expect(play).toHaveBeenCalledTimes(1)
    expect(play.mock.contexts[0].preload).toBe('none')
    expect(play.mock.contexts[0].loop).toBe(true)
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
    await wrapper.get('button').trigger('click')
    expect(pause).toHaveBeenCalled()
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false')
  })

  it('pauses when the tab is hidden and does not resume by itself', async () => {
    const wrapper = mountMusic()
    await wrapper.get('button').trigger('click')
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false')
    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('disables itself and announces when playback fails', async () => {
    play.mockImplementation(() => Promise.reject(new Error('nope')))
    const wrapper = mountMusic()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[role="status"]').text()).toBe(tt('music.error'))
  })

  it('is disabled in the preview', () => {
    const wrapper = mountMusic({ preview: true })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('docks as a bar on phones with a 44px target, so it does not sit over the RSVP form', () => {
    const wrapper = mountMusic()
    const button = wrapper.get('[data-testid="invitation-music"]')
    expect(button.classes()).toEqual(expect.arrayContaining(['h-11', 'w-11']))
    expect(button.attributes('aria-label')).toContain('Nuestra canción')
    // the bar spans the width on phones and only floats from `sm` up
    expect(wrapper.html()).toContain('inset-x-0')
    expect(wrapper.html()).toContain('sm:right-4')
  })
})
