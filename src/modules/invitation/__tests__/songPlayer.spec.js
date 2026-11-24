import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

const api = vi.hoisted(() => ({ listSongs: vi.fn(), searchSongs: vi.fn(), suggestSong: vi.fn(), removeSong: vi.fn(), voteSong: vi.fn() }))
vi.mock('@/services/PublicEvents/InvitationService', () => ({ default: api }))

import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import { AUDIO_EVENT } from '../composables/audioBus'
import { spotifyTrackId, spotifyEmbedSrc, spotifyOpenUrl } from '../composables/spotifyTrack'
import InvitationSongPlayer from '../components/InvitationSongPlayer.vue'
import InvitationSuggestedMusic from '../components/InvitationSuggestedMusic.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })
const ID1 = '4uLU6hMCjMI75M1A2tKUQC'
const ID2 = '3n3Ppam7vgaVa1iaRUc9Lp'
const song = (id, extra = {}) => ({ id, title: `Canción ${id}`, artist: `Artista ${id}`, thumbnailUrl: 'https://i.scdn.co/c.jpg', previewUrl: null, votes: 2, votedByMe: false, suggestedByMe: false, ...extra })
const page = data => ({ data: { data, meta: { currentPage: 1, lastPage: 1, total: data.length } } })
const sectionData = (extra = {}) => ({ heading: 'Música', usePreview: false, useVotes: true, maxSuggestions: 5, mySuggestions: 0, canWrite: true, ...extra })

let wrapper
function mountSongs({ data = sectionData(), preview = false } = {}) {
  wrapper = mount(InvitationSuggestedMusic, {
    attachTo: document.body,
    props: { section: { type: 'suggested_music', title: null, text: null, settings: {}, data } },
    global: { provide: { [INVITATION_KEY]: { invitation: ref({ locale: 'es' }), tt, slug: () => 'xv', code: () => 'AB1234', preview } } }
  })
  return wrapper
}
const frame = () => document.body.querySelector('iframe')
const dialog = () => document.body.querySelector('[role="dialog"]')
const listenButtons = () => wrapper.findAll('[data-testid="song-listen"]')

beforeEach(() => {
  Object.values(api).forEach(fn => fn.mockReset())
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  document.body.innerHTML = ''
  document.body.removeAttribute('style')
})

describe('spotifyTrackId', () => {
  it('accepts a 22-character id for Spotify (or no platform) and nothing else', () => {
    expect(spotifyTrackId({ platformId: ID1 })).toBe(ID1)
    expect(spotifyTrackId({ platform: 'spotify', platformId: ID1 })).toBe(ID1)
    expect(spotifyTrackId({ platform: 'youtube', platformId: ID1 })).toBeNull()
    expect(spotifyTrackId({ platformId: 'short' })).toBeNull()
    expect(spotifyTrackId({ platformId: `${ID1}/../x` })).toBeNull()
    expect(spotifyTrackId({ platform: null, platformId: ID1 })).toBe(ID1)
    expect(spotifyTrackId({ platformId: 123 })).toBeNull()
    expect(spotifyTrackId({})).toBeNull()
    expect(spotifyTrackId(null)).toBeNull()
  })
  it('builds the embed and open URLs', () => {
    expect(spotifyEmbedSrc(ID1)).toBe(`https://open.spotify.com/embed/track/${ID1}`)
    expect(spotifyOpenUrl(ID1)).toBe(`https://open.spotify.com/track/${ID1}`)
  })
})

describe('Suggested music: Spotify popup', () => {
  async function ready(items) {
    api.listSongs.mockResolvedValue(page(items))
    mountSongs()
    await flushPromises()
  }

  it('shows "Listen" with and without previewUrl, and not without a valid Spotify id', async () => {
    await ready([
      song(1, { platformId: ID1 }),
      song(2, { platformId: ID2, previewUrl: 'https://p.scdn.co/a.mp3' }),
      song(3, { platformId: 'nope' }),
      song(4, { platform: 'youtube', platformId: ID1 }),
      song(5)
    ])
    expect(listenButtons()).toHaveLength(2)
    expect(listenButtons()[0].text()).toBe('Escuchar')
    expect(listenButtons()[0].attributes('aria-label')).toBe('Escuchar: Canción 1')
  })

  it('keeps the inline preview play when usePreview is on and a trusted previewUrl exists', async () => {
    api.listSongs.mockResolvedValue(page([song(1, { platformId: ID1, previewUrl: 'https://p.scdn.co/a.mp3' })]))
    mountSongs({ data: sectionData({ usePreview: true }) })
    await flushPromises()
    expect(wrapper.find('.inv-songs__play').exists()).toBe(true)
    expect(listenButtons()).toHaveLength(1)
  })

  it('does not request Spotify until the popup opens, then mounts the exact embed and unmounts on close', async () => {
    await ready([song(1, { platformId: ID1 })])
    expect(frame()).toBeNull()
    await listenButtons()[0].trigger('click')
    await flushPromises()
    expect(dialog()).not.toBeNull()
    expect(dialog().getAttribute('aria-modal')).toBe('true')
    const iframe = frame()
    expect(iframe.getAttribute('src')).toBe(`https://open.spotify.com/embed/track/${ID1}`)
    expect(iframe.getAttribute('allow')).toBe('encrypted-media')
    expect(iframe.getAttribute('loading')).toBe('lazy')
    expect(iframe.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin')
    expect(iframe.getAttribute('height')).toBe('152')
    expect(iframe.getAttribute('title')).toBe('Reproductor de Spotify: Canción 1')
    expect(dialog().textContent).toContain('Canción 1')
    expect(dialog().textContent).toContain('Artista 1')
    expect(dialog().querySelector('img').getAttribute('src')).toBe('https://i.scdn.co/c.jpg')
    const link = dialog().querySelector('[data-testid="song-player-open"]')
    expect(link.getAttribute('href')).toBe(`https://open.spotify.com/track/${ID1}`)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')

    dialog().querySelector('button[aria-label="Cerrar"]').click()
    await flushPromises()
    expect(frame()).toBeNull()
    expect(dialog()).toBeNull()
  })

  it('closes with Escape and returns the focus to the button that opened it', async () => {
    await ready([song(1, { platformId: ID1 })])
    const button = listenButtons()[0]
    button.element.focus()
    await button.trigger('click')
    await flushPromises()
    expect(dialog().contains(document.activeElement)).toBe(true)
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(frame()).toBeNull()
    expect(document.activeElement).toBe(button.element)
  })

  it('closes when the overlay is clicked', async () => {
    await ready([song(1, { platformId: ID1 })])
    await listenButtons()[0].trigger('click')
    await flushPromises()
    const overlay = document.body.querySelector('.inv-player__overlay')
    overlay.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }))
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(frame()).toBeNull()
  })

  it('locks the background scroll while open and releases it on close', async () => {
    await ready([song(1, { platformId: ID1 })])
    await listenButtons()[0].trigger('click')
    await flushPromises()
    expect(document.body.style.overflow).toBe('hidden')
    dialog().querySelector('button[aria-label="Cerrar"]').click()
    await flushPromises()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('has one popup at a time: another song replaces the first embed', async () => {
    await ready([song(1, { platformId: ID1 }), song(2, { platformId: ID2 })])
    await listenButtons()[0].trigger('click')
    await flushPromises()
    // while open the page behind is inert, so a second open can only come from code: simulate it directly
    wrapper.vm.openPlayer(song(2, { platformId: ID2 }))
    await flushPromises()
    expect(document.body.querySelectorAll('iframe')).toHaveLength(1)
    expect(document.body.querySelectorAll('[role="dialog"]')).toHaveLength(1)
  })

  it('announces itself on the audio bus so the background music steps aside', async () => {
    await ready([song(1, { platformId: ID1 })])
    const heard = vi.fn()
    window.addEventListener(AUDIO_EVENT, heard)
    await listenButtons()[0].trigger('click')
    window.removeEventListener(AUDIO_EVENT, heard)
    expect(heard).toHaveBeenCalledTimes(1)
    expect(heard.mock.calls[0][0].detail.source).toBe('suggested-music')
  })

  it('stops a running 30 s preview when the popup opens', async () => {
    const pause = vi.fn()
    const play = vi.fn().mockResolvedValue()
    vi.stubGlobal('Audio', function () {
      this.addEventListener = () => {}
      this.pause = pause
      this.play = play
      this.removeAttribute = () => {}
    })
    api.listSongs.mockResolvedValue(page([song(1, { platformId: ID1, previewUrl: 'https://p.scdn.co/a.mp3' })]))
    mountSongs({ data: sectionData({ usePreview: true }) })
    await flushPromises()
    await wrapper.get('.inv-songs__play').trigger('click')
    pause.mockClear()
    await listenButtons()[0].trigger('click')
    expect(pause).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('offers "Listen" on search results too', async () => {
    api.listSongs.mockResolvedValue(page([]))
    api.searchSongs.mockResolvedValue({ data: { data: [{ id: ID2, name: 'Pista', artists: [{ name: 'Grupo' }], album: { name: 'D', images: [] } }] } })
    mountSongs()
    await flushPromises()
    vi.useFakeTimers()
    await wrapper.get('input[type="search"]').setValue('pista')
    vi.advanceTimersByTime(400)
    vi.useRealTimers()
    await flushPromises()
    expect(listenButtons()).toHaveLength(1)
    await listenButtons()[0].trigger('click')
    await flushPromises()
    expect(frame().getAttribute('src')).toBe(`https://open.spotify.com/embed/track/${ID2}`)
  })

  it('shows the initial when the song has no cover and survives an opener that is gone', async () => {
    await ready([song(1, { platformId: ID1, thumbnailUrl: null, title: 'zeta' })])
    await listenButtons()[0].trigger('click')
    await flushPromises()
    expect(dialog().querySelector('img')).toBeNull()
    expect(dialog().textContent).toContain('Z')
    wrapper.vm.playerOpener = null
    dialog().querySelector('button[aria-label="Cerrar"]').click()
    await flushPromises()
    expect(frame()).toBeNull()
  })

  it('does nothing in the editor preview', async () => {
    mountSongs({ preview: true })
    await flushPromises()
    expect(listenButtons()).toHaveLength(0)
    wrapper.vm.openPlayer(song(1, { platformId: ID1 }))
    await nextTick()
    expect(frame()).toBeNull()
  })
})

describe('InvitationSongPlayer on its own', () => {
  const provide = { [INVITATION_KEY]: { invitation: ref({ locale: 'es' }), tt, slug: () => 'xv', code: () => 'AB1234', preview: false } }

  it('renders nothing without a song or with an unplayable one, and emits close only when it is dismissed', async () => {
    const closed = mount(InvitationSongPlayer, { attachTo: document.body, props: { song: null }, global: { provide } })
    expect(document.body.querySelector('iframe')).toBeNull()
    expect(closed.vm.initial).toBe('?')
    closed.vm.onOpenChange(true)
    expect(closed.emitted('close')).toBeUndefined()
    closed.vm.onOpenChange(false)
    expect(closed.emitted('close')).toHaveLength(1)
    await closed.setProps({ song: { title: 'x', artist: 'y', platformId: 'bad' } })
    expect(document.body.querySelector('iframe')).toBeNull()
    closed.unmount()
  })
})
