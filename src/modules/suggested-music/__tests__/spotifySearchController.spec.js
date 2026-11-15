import { describe, it, expect, vi, beforeEach } from 'vitest'

const { searchSongs, toastError } = vi.hoisted(() => ({ searchSongs: vi.fn(), toastError: vi.fn() }))

vi.mock('vue', async importOriginal => ({ ...(await importOriginal()), onMounted: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('lodash.debounce', () => ({ default: fn => fn }))
vi.mock('@/ui', () => ({ useToast: () => ({ error: toastError, success: vi.fn() }) }))
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ activeEvent: 42 }) }))
vi.mock('@/composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@/modules/suggested-music/services/SpotifyService', () => ({ default: { searchSongs } }))
vi.mock('@/modules/suggested-music/services/SongsService', () => ({ default: {} }))
vi.mock('@/modules/suggested-music/stores/useSuggestedMusicStore', () => ({
  useSuggestedMusicStore: () => ({ selectedSongs: [] })
}))

import { useSuggestedMusicAdminController } from '../composables/useSuggestedMusicAdminController'

const apiError = (status, data = {}) => ({ response: { status, data } })

describe('useSuggestedMusicAdminController search', () => {
  let c
  beforeEach(() => {
    searchSongs.mockReset()
    toastError.mockReset()
    c = useSuggestedMusicAdminController()
  })

  it('passes the active event id and maps the tracks', async () => {
    searchSongs.mockResolvedValue({
      tracks: { items: [{ id: 's1', name: 'Song', artists: [{ name: 'A' }], album: { name: 'Al', images: [] }, external_urls: {} }] }
    })
    c.searchQuery.value = 'song'
    await c.searchSongs()
    expect(searchSongs).toHaveBeenCalledWith('song', 5, 42)
    expect(c.searchResults.value).toHaveLength(1)
    expect(toastError).not.toHaveBeenCalled()
  })

  it('does not call the API with an empty query', async () => {
    c.searchQuery.value = ''
    await c.searchSongs()
    expect(searchSongs).not.toHaveBeenCalled()
  })

  it('shows the unavailable message on 503 spotify_unavailable', async () => {
    searchSongs.mockRejectedValue(apiError(503, { code: 'spotify_unavailable' }))
    c.searchQuery.value = 'song'
    await c.searchSongs()
    expect(toastError).toHaveBeenCalledWith('app.music.searchUnavailable')
    expect(c.searchResults.value).toEqual([])
    expect(c.searching.value).toBe(false)
  })

  it('shows the invalid query message on 422', async () => {
    searchSongs.mockRejectedValue(apiError(422, { errors: { q: ['too_long'] } }))
    c.searchQuery.value = 'song'
    await c.searchSongs()
    expect(toastError).toHaveBeenCalledWith('app.music.searchInvalid')
  })

  it('adds no second toast on module_locked (the interceptor shows the upgrade notice)', async () => {
    searchSongs.mockRejectedValue(apiError(403, { code: 'module_locked', module: 'suggested_music' }))
    c.searchQuery.value = 'song'
    await c.searchSongs()
    expect(toastError).not.toHaveBeenCalled()
    expect(c.searchResults.value).toEqual([])
  })

  it('falls back to the generic message otherwise', async () => {
    searchSongs.mockRejectedValue(new Error('network'))
    c.searchQuery.value = 'song'
    await c.searchSongs()
    expect(toastError).toHaveBeenCalledWith('app.music.searchError')
  })
})
