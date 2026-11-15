import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import EventMusicCard from '../EventMusicCard.vue'
import { useImpersonationStore } from '@/modules/impersonation/stores/useImpersonationStore'

const { api, play, pause } = vi.hoisted(() => ({
  api: { get: vi.fn(), upload: vi.fn(), remove: vi.fn() },
  play: vi.fn(),
  pause: vi.fn()
}))
vi.mock('../../services/BackgroundMusicService', () => ({ default: api }))

const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }
const song = { id: 1, eventId: 7, songUrl: 'https://x.test/a.mp3', title: 'Nuestro vals', mimeType: 'audio/mpeg', sizeBytes: 3 * 1024 * 1024 }
let pinia

function mountCard(props = {}) {
  return mount(EventMusicCard, {
    props: { eventId: 7, ...props },
    attachTo: document.body,
    global: { plugins: [i18n, pinia], stubs }
  })
}
const t = key => i18n.global.t(key)
const pickFile = async (wrapper, file) => {
  const input = wrapper.find('[data-test="music-input"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}
const mp3 = (size = 1000) => ({ name: 'a.mp3', type: 'audio/mpeg', size })

beforeEach(() => {
  setLocale('es')
  sessionStorage.clear() // a support session of an earlier test
  pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  Object.values(api).forEach(fn => fn.mockReset())
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
afterEach(() => document.body.replaceChildren())

describe('EventMusicCard', () => {
  it('shows the empty state and the upload button when there is no song', async () => {
    api.get.mockResolvedValue(null)
    const w = mountCard()
    await flushPromises()
    expect(w.text()).toContain(t('events.music.empty'))
    expect(w.text()).toContain(t('events.music.help'))
    expect(w.find('[data-test="music-pick"]').text()).toContain(t('events.music.upload'))
    expect(w.find('[data-test="music-remove"]').exists()).toBe(false)
  })

  it('uploads a valid file and shows the song', async () => {
    api.get.mockResolvedValue(null)
    api.upload.mockResolvedValue(song)
    const w = mountCard()
    await flushPromises()
    const file = mp3()
    await pickFile(w, file)
    expect(api.upload).toHaveBeenCalledWith(7, file, '')
    expect(w.text()).toContain('Nuestro vals')
    expect(w.find('[data-test="music-pick"]').text()).toContain(t('events.music.replace'))
  })

  it('sends the title with the file', async () => {
    api.get.mockResolvedValue(null)
    api.upload.mockResolvedValue(song)
    const w = mountCard()
    await flushPromises()
    await w.find('#music_title').setValue('Nuestro vals')
    const file = mp3()
    await pickFile(w, file)
    expect(api.upload).toHaveBeenCalledWith(7, file, 'Nuestro vals')
  })

  it('rejects wav and big files in the client, next to the field, without calling the API', async () => {
    api.get.mockResolvedValue(null)
    const w = mountCard()
    await flushPromises()
    await pickFile(w, { name: 'a.wav', type: 'audio/wav', size: 100 })
    expect(w.find('[role="alert"]').text()).toBe(t('events.music.errors.invalid_type'))
    await pickFile(w, mp3(11 * 1024 * 1024))
    expect(w.find('[role="alert"]').text()).toBe(t('events.music.errors.too_large'))
    expect(api.upload).not.toHaveBeenCalled()
  })

  it('maps the 422 codes of the contract to messages', async () => {
    api.get.mockResolvedValue(null)
    api.upload.mockRejectedValue({ response: { status: 422, data: { errors: { songFile: ['too_large'], title: ['too_long'] } } } })
    const w = mountCard()
    await flushPromises()
    await pickFile(w, mp3())
    const alerts = w.findAll('[role="alert"]').map(a => a.text())
    expect(alerts).toContain(t('events.music.errors.too_large'))
    expect(alerts).toContain(t('events.music.errors.title_too_long'))
  })

  it('shows the lock and the unlock link, with no way to upload, on the free plan', async () => {
    api.get.mockResolvedValue(null)
    const w = mountCard({ locked: true })
    await flushPromises()
    expect(w.find('[data-test="music-locked"]').exists()).toBe(true)
    expect(w.find('a').attributes('href')).toBe('/dashboard/unlock/background_music')
    expect(w.find('[data-test="music-input"]').exists()).toBe(false)
  })

  it('locks itself when the API answers 403 module_locked', async () => {
    api.get.mockResolvedValue(null)
    api.upload.mockRejectedValue({ response: { status: 403, data: { code: 'module_locked' } } })
    const w = mountCard()
    await flushPromises()
    await pickFile(w, mp3())
    expect(w.find('[data-test="music-locked"]').exists()).toBe(true)
  })

  it('only lets a viewer listen', async () => {
    api.get.mockResolvedValue(song)
    const w = mountCard({ readOnly: true })
    await flushPromises()
    expect(w.find('[data-test="music-play"]').exists()).toBe(true)
    expect(w.find('[data-test="music-pick"]').exists()).toBe(false)
    expect(w.find('[data-test="music-remove"]').exists()).toBe(false)
    expect(w.find('[data-test="music-input"]').exists()).toBe(false)
  })

  it('is disabled in a support session', async () => {
    api.get.mockResolvedValue(song)
    useImpersonationStore().begin({ token: 'tok', expires: null })
    const w = mountCard()
    await flushPromises()
    expect(w.find('[data-test="music-pick"]').exists()).toBe(false)
    expect(w.text()).toContain(t('events.music.supportSession'))
  })

  it('does not play by itself: the sound starts on the tap and pauses on the second one', async () => {
    api.get.mockResolvedValue(song)
    const w = mountCard()
    await flushPromises()
    expect(play).not.toHaveBeenCalled()
    const button = w.find('[data-test="music-play"]')
    await button.trigger('click')
    expect(play).toHaveBeenCalledTimes(1)
    expect(button.attributes('aria-pressed')).toBe('true')
    await button.trigger('click')
    expect(pause).toHaveBeenCalled()
    expect(button.attributes('aria-pressed')).toBe('false')
  })

  it('deletes after confirming', async () => {
    api.get.mockResolvedValue(song)
    api.remove.mockResolvedValue()
    const w = mountCard()
    await flushPromises()
    await w.find('[data-test="music-remove"]').trigger('click')
    await flushPromises()
    expect(api.remove).not.toHaveBeenCalled()
    document.querySelector('[data-test="music-confirm-remove"]').click()
    await flushPromises()
    expect(api.remove).toHaveBeenCalledWith(7)
    expect(w.find('[data-test="music-current"]').exists()).toBe(false)
  })
})
