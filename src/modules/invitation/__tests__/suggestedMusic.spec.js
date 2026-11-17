import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

const api = vi.hoisted(() => ({ listSongs: vi.fn(), searchSongs: vi.fn(), suggestSong: vi.fn(), removeSong: vi.fn(), voteSong: vi.fn() }))
vi.mock('@/services/PublicEvents/InvitationService', () => ({ default: api }))

import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationSuggestedMusic from '../components/InvitationSuggestedMusic.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })
const song = (id, extra = {}) => ({ id, title: `Canción ${id}`, artist: `Artista ${id}`, thumbnailUrl: null, previewUrl: null, votes: 2, votedByMe: false, suggestedByMe: false, ...extra })
const page = (data, meta = {}) => ({ data: { data, meta: { currentPage: 1, lastPage: 1, total: data.length, ...meta } } })
const track = (id, extra = {}) => ({ id, name: `Pista ${id}`, artists: [{ name: 'Grupo' }], album: { name: 'Disco', images: [{ url: 'https://i.scdn.co/x.jpg' }] }, preview_url: null, ...extra })
const sectionData = (extra = {}) => ({ heading: 'Música', subHeading: null, usePreview: false, useVotes: true, maxSuggestions: 5, mySuggestions: 0, canWrite: true, ...extra })
const failWith = (status, body = {}) => Promise.reject({ response: { status, data: body } })

function mountSongs({ data = sectionData(), preview = false } = {}) {
  return mount(InvitationSuggestedMusic, {
    props: { section: { type: 'suggested_music', title: null, text: null, settings: {}, data } },
    global: { provide: { [INVITATION_KEY]: { invitation: ref({ locale: 'es' }), tt, slug: () => 'xv', code: () => 'AB1234', preview } } }
  })
}
async function type(wrapper, value) {
  await wrapper.get('input[type="search"]').setValue(value)
  vi.advanceTimersByTime(400)
  await flushPromises()
}

beforeEach(() => {
  vi.useFakeTimers()
  Object.values(api).forEach(fn => fn.mockReset())
})
afterEach(() => vi.useRealTimers())

describe('InvitationSuggestedMusic', () => {
  it('lists songs as text, never HTML, and shows empty and error states', async () => {
    api.listSongs.mockResolvedValue(page([song(1, { title: '<b>x</b>' })]))
    const wrapper = mountSongs()
    await flushPromises()
    expect(api.listSongs).toHaveBeenCalledWith({ slug: 'xv', code: 'AB1234', orderBy: 'popular', page: 1 })
    expect(wrapper.text()).toContain('<b>x</b>')
    expect(wrapper.find('b').exists()).toBe(false)

    api.listSongs.mockResolvedValue(page([]))
    const empty = mountSongs()
    await flushPromises()
    expect(empty.find('[data-testid="songs-empty"]').exists()).toBe(true)

    api.listSongs.mockImplementationOnce(() => failWith(500)).mockResolvedValueOnce(page([song(2)]))
    const broken = mountSongs()
    await flushPromises()
    expect(broken.find('[data-testid="songs-list-error"]').exists()).toBe(true)
    await broken.get('[data-testid="songs-list-error"] button').trigger('click')
    await flushPromises()
    expect(broken.text()).toContain('Canción 2')
  })

  it('debounces the search, needs 2 characters and suggests a result', async () => {
    api.listSongs.mockResolvedValue(page([]))
    api.searchSongs.mockResolvedValue({ data: { data: { tracks: { items: [track('t1')] } } } })
    api.suggestSong.mockResolvedValue({ data: { data: song(9, { title: 'Pista t1', suggestedByMe: true }) } })
    const wrapper = mountSongs()
    await flushPromises()
    await type(wrapper, 'a')
    expect(api.searchSongs).not.toHaveBeenCalled()
    await wrapper.get('input[type="search"]').setValue('gru')
    await wrapper.get('input[type="search"]').setValue('grupo')
    vi.advanceTimersByTime(399)
    expect(api.searchSongs).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    await flushPromises()
    expect(api.searchSongs).toHaveBeenCalledTimes(1)
    expect(api.searchSongs).toHaveBeenCalledWith({ slug: 'xv', code: 'AB1234', q: 'grupo', limit: 8 })
    await wrapper.get('.inv-songs__result button').trigger('click')
    await flushPromises()
    expect(api.suggestSong).toHaveBeenCalledWith({
      slug: 'xv',
      code: 'AB1234',
      song: { platformId: 't1', title: 'Pista t1', artist: 'Grupo', album: 'Disco', thumbnailUrl: 'https://i.scdn.co/x.jpg', previewUrl: undefined }
    })
    expect(wrapper.text()).toContain(tt('songs.suggested'))
    expect(wrapper.find('.inv-songs__item').text()).toContain('Pista t1')
    expect(wrapper.text()).toContain(tt('songs.remaining', { n: 4, max: 5 }))
  })

  it('keeps the typed text and offers a retry when Spotify is unavailable (503)', async () => {
    api.listSongs.mockResolvedValue(page([]))
    api.searchSongs.mockImplementationOnce(() => failWith(503, { message: 'spotify_unavailable' })).mockResolvedValueOnce({ data: { data: { tracks: { items: [track('t1')] } } } })
    const wrapper = mountSongs()
    await flushPromises()
    await type(wrapper, 'grupo')
    expect(wrapper.text()).toContain(tt('songs.errors.spotify_unavailable'))
    expect(wrapper.get('input[type="search"]').element.value).toBe('grupo')
    await wrapper.get('[data-testid="songs-search-error"] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.inv-songs__result').exists()).toBe(true)
  })

  it('shows "no results"', async () => {
    api.listSongs.mockResolvedValue(page([]))
    api.searchSongs.mockResolvedValue({ data: { data: { tracks: { items: [] } } } })
    const wrapper = mountSongs()
    await flushPromises()
    await type(wrapper, 'zzzz')
    expect(wrapper.text()).toContain(tt('songs.noResults'))
  })

  it('blocks suggesting at the limit of 5 and maps 422 limit / duplicate and 429', async () => {
    api.listSongs.mockResolvedValue(page([]))
    const full = mountSongs({ data: sectionData({ mySuggestions: 5 }) })
    await flushPromises()
    expect(full.find('[data-testid="songs-limit"]').exists()).toBe(true)

    api.searchSongs.mockResolvedValue({ data: { data: { tracks: { items: [track('t1')] } } } })
    for (const [fail, key] of [
      [() => failWith(422, { errors: { song: ['limit'] } }), 'limit'],
      [() => failWith(422, { errors: { platformId: ['duplicate'] } }), 'duplicate'],
      [() => failWith(429, {}), 'too_many_attempts'],
      [() => failWith(403, { message: 'module_locked' }), 'module_locked']
    ]) {
      api.suggestSong.mockImplementationOnce(fail)
      const wrapper = mountSongs()
      await flushPromises()
      await type(wrapper, 'grupo')
      await wrapper.get('.inv-songs__result button').trigger('click')
      await flushPromises()
      expect(wrapper.get('[data-testid="songs-notice"]').text()).toBe(tt(`songs.errors.${key}`))
      expect(wrapper.get('input[type="search"]').element.value).toBe('grupo')
    }
  })

  it('votes and removes the vote (one per song), and removes own suggestions', async () => {
    api.listSongs.mockResolvedValue(page([song(1), song(2, { suggestedByMe: true })]))
    api.voteSong.mockResolvedValueOnce({ data: { data: song(1, { votes: 3, votedByMe: true }) } }).mockResolvedValueOnce({ data: { data: song(1, { votes: 2 }) } })
    api.removeSong.mockResolvedValue({ status: 204 })
    const wrapper = mountSongs()
    await flushPromises()
    const first = () => wrapper.findAll('[data-testid="song-vote"]')[0]
    await first().trigger('click')
    await flushPromises()
    expect(api.voteSong).toHaveBeenLastCalledWith({ slug: 'xv', code: 'AB1234', id: 1, vote: true })
    expect(first().text()).toBe('3')
    expect(first().attributes('aria-pressed')).toBe('true')
    await first().trigger('click')
    await flushPromises()
    expect(api.voteSong).toHaveBeenLastCalledWith({ slug: 'xv', code: 'AB1234', id: 1, vote: false })
    expect(first().text()).toBe('2')

    expect(wrapper.findAll('[data-testid="song-remove"]')).toHaveLength(1)
    await wrapper.get('[data-testid="song-remove"]').trigger('click')
    await flushPromises()
    expect(api.removeSong).toHaveBeenCalledWith({ slug: 'xv', code: 'AB1234', id: 2 })
    expect(wrapper.findAll('.inv-songs__item')).toHaveLength(1)
  })

  it('maps votes_disabled and votes_exhausted', async () => {
    api.listSongs.mockResolvedValue(page([song(1)]))
    api.voteSong.mockImplementationOnce(() => failWith(422, { errors: { vote: ['votes_exhausted'] } })).mockImplementationOnce(() => failWith(403, { code: 'votes_disabled' }))
    const wrapper = mountSongs()
    await flushPromises()
    await wrapper.get('[data-testid="song-vote"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="songs-notice"]').text()).toBe(tt('songs.errors.votes_exhausted'))
    await wrapper.get('[data-testid="song-vote"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="songs-notice"]').text()).toBe(tt('songs.errors.votes_disabled'))
    expect(wrapper.find('[data-testid="song-vote"]').exists()).toBe(false)
  })

  it('is read only when it cannot write, and hides votes when the event has none', async () => {
    api.listSongs.mockResolvedValue(page([song(1, { suggestedByMe: true })]))
    const wrapper = mountSongs({ data: sectionData({ canWrite: false, useVotes: false }) })
    await flushPromises()
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.find('[data-testid="song-vote"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="song-remove"]').exists()).toBe(false)
    expect(wrapper.text()).toContain(tt('songs.readOnly'))
  })

  it('only shows a preview button when the API gave an https preview and use_preview is on', async () => {
    api.listSongs.mockResolvedValue(page([song(1, { previewUrl: 'https://p.scdn.co/a.mp3' }), song(2, { previewUrl: 'http://evil/a.mp3' })]))
    const on = mountSongs({ data: sectionData({ usePreview: true }) })
    await flushPromises()
    expect(on.findAll('.inv-songs__play')).toHaveLength(1)
    const off = mountSongs()
    await flushPromises()
    expect(off.findAll('.inv-songs__play')).toHaveLength(0)
  })

  it('never calls the API in the editor preview', async () => {
    const wrapper = mountSongs({ preview: true })
    await flushPromises()
    await wrapper.get('input[type="search"]').setValue('grupo')
    vi.advanceTimersByTime(1000)
    await flushPromises()
    expect(Object.values(api).every(fn => !fn.mock.calls.length)).toBe(true)
    expect(wrapper.text()).toContain(tt('previewNotice'))
  })
})
