import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: { get } }))

import SpotifyService from '../services/SpotifyService'

describe('SpotifyService.searchSongs', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it('calls the API endpoint of the event with q and limit and returns data', async () => {
    const body = { tracks: { items: [{ id: 't1' }] } }
    get.mockResolvedValue({ data: { data: body } })

    const result = await SpotifyService.searchSongs('luna', 5, 7)

    expect(get).toHaveBeenCalledWith('event/7/suggest-music/spotify-search', { params: { q: 'luna', limit: 5 } })
    expect(result).toEqual(body)
  })

  it('defaults the limit to 5', async () => {
    get.mockResolvedValue({ data: { data: {} } })
    await SpotifyService.searchSongs('luna', undefined, 1)
    expect(get.mock.calls[0][1].params.limit).toBe(5)
  })

  it('propagates API errors to the caller', async () => {
    const error = { response: { status: 503, data: { code: 'spotify_unavailable' } } }
    get.mockRejectedValue(error)
    await expect(SpotifyService.searchSongs('x', 5, 1)).rejects.toBe(error)
  })

  it('carries no Spotify credentials nor direct Spotify calls', () => {
    const src = readFileSync(resolve(__dirname, '../services/SpotifyService.js'), 'utf8')
    expect(src).not.toMatch(/VITE_SPOTIFY|client_secret|client_id|accounts\.spotify|api\.spotify|getToken/)
    expect(SpotifyService.getToken).toBeUndefined()
  })
})
