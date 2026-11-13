import { describe, it, expect } from 'vitest'
import {
  countGuestSuggested,
  filterAndSortSongs,
  formatNetScore,
  getNetScore,
  getTopSong,
  getTotalVotes,
  hasRealThumbnail,
  isTopVoted,
  mapSpotifyTracks,
  netTone,
  spotifyEmbedUrl,
  voterInitial
} from '../utils/music'

const song = (id, title, up, down, isOrganizer, extra = {}) => ({
  id,
  title,
  artist: 'Artist ' + id,
  album: 'Album ' + id,
  votes: { up, down },
  suggestedBy: { isOrganizer },
  ...extra
})

const songs = [
  song(1, 'Zeta', 2, 0, true),
  song(2, 'Alfa', 12, 1, false),
  song(3, 'Beta', 5, 5, false),
  song(4, 'Gamma', 0, 3, true)
]

describe('votes helpers', () => {
  it('computes net score and tolerates missing votes', () => {
    expect(getNetScore(songs[1])).toBe(11)
    expect(getNetScore({})).toBe(0)
    expect(getNetScore(null)).toBe(0)
  })

  it('flags top voted from net score 10', () => {
    expect(isTopVoted(songs[1])).toBe(true)
    expect(isTopVoted(songs[0])).toBe(false)
    expect(isTopVoted({})).toBe(false)
  })

  it('sums every vote and finds the top song', () => {
    expect(getTotalVotes(songs)).toBe(2 + 13 + 10 + 3)
    expect(getTopSong(songs).id).toBe(2)
    expect(getTopSong([])).toBeNull()
  })

  it('counts guest suggestions only when explicitly not organizer', () => {
    expect(countGuestSuggested(songs)).toBe(2)
    expect(countGuestSuggested([{ id: 9 }])).toBe(0)
  })
})

describe('filterAndSortSongs', () => {
  it('keeps API order for "recent" and does not mutate the input', () => {
    const copy = [...songs]
    expect(filterAndSortSongs(songs).map(s => s.id)).toEqual([1, 2, 3, 4])
    expect(songs).toEqual(copy)
  })

  it('searches title, artist and album, ignoring case and gaps', () => {
    expect(filterAndSortSongs(songs, { search: '  ALFA ' }).map(s => s.id)).toEqual([2])
    expect(filterAndSortSongs(songs, { search: 'artist 3' }).map(s => s.id)).toEqual([3])
    expect(filterAndSortSongs([{ id: 1, title: 'x' }], { search: 'y' })).toEqual([])
  })

  it('filters by origin and top voted', () => {
    expect(filterAndSortSongs(songs, { filterBy: 'admin' }).map(s => s.id)).toEqual([1, 4])
    expect(filterAndSortSongs(songs, { filterBy: 'guest' }).map(s => s.id)).toEqual([2, 3])
    expect(filterAndSortSongs(songs, { filterBy: 'topVoted' }).map(s => s.id)).toEqual([2])
  })

  it('sorts by popularity, volume and title', () => {
    expect(filterAndSortSongs(songs, { sortBy: 'popular' }).map(s => s.id)).toEqual([2, 1, 3, 4])
    expect(filterAndSortSongs(songs, { sortBy: 'mostVoted' }).map(s => s.id)).toEqual([2, 3, 4, 1])
    expect(filterAndSortSongs(songs, { sortBy: 'alphabetical' }).map(s => s.title)).toEqual(['Alfa', 'Beta', 'Gamma', 'Zeta'])
  })
})

describe('Spotify mapping', () => {
  it('maps tracks and fills the gaps', () => {
    const result = {
      tracks: {
        items: [
          { id: 'a', name: 'Song', artists: [{ name: 'X' }, { name: 'Y' }], album: { name: 'Alb', images: [{ url: 'u' }] }, preview_url: 'p' },
          { id: 'b', name: 'Bare', artists: [], album: { images: [] } }
        ]
      }
    }
    const [a, b] = mapSpotifyTracks(result)
    expect(a).toMatchObject({ platformId: 'a', artist: 'X, Y', album: 'Alb', thumbnailUrl: 'u', previewUrl: 'p' })
    expect(b.album).toBe('Unknown Album')
    expect(b.previewUrl).toBeNull()
    expect(hasRealThumbnail(b.thumbnailUrl)).toBe(false)
    expect(hasRealThumbnail('https://i.scdn.co/x')).toBe(true)
    expect(mapSpotifyTracks(null)).toEqual([])
  })

  it('builds the embed url', () => {
    expect(spotifyEmbedUrl('abc')).toBe('https://open.spotify.com/embed/track/abc')
    expect(spotifyEmbedUrl('')).toBe('')
  })
})

describe('display helpers', () => {
  it('formats net score and picks a tone', () => {
    expect(formatNetScore(3)).toBe('+3')
    expect(formatNetScore(-2)).toBe('-2')
    expect(formatNetScore(0)).toBe('0')
    expect(netTone(1)).toBe('success')
    expect(netTone(-1)).toBe('danger')
    expect(netTone(0)).toBe('neutral')
  })

  it('takes the voter initial', () => {
    expect(voterInitial(' ana')).toBe('A')
    expect(voterInitial('')).toBe('G')
    expect(voterInitial(undefined)).toBe('G')
  })
})
