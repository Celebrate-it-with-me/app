export const SORT_OPTIONS = ['recent', 'popular', 'mostVoted', 'alphabetical']
export const FILTER_OPTIONS = ['all', 'admin', 'guest', 'topVoted']
/** A song counts as "top voted" from this net score on. */
export const TOP_VOTED_SCORE = 10
/** The API requires a thumbnail string, so songs without art travel with this one. */
export const THUMBNAIL_FALLBACK = 'https://via.placeholder.com/48'

export function getUpVotes(song) {
  return song?.votes?.up || 0
}

export function getDownVotes(song) {
  return song?.votes?.down || 0
}

export function getNetScore(song) {
  if (!song?.votes) return 0
  return getUpVotes(song) - getDownVotes(song)
}

export function isTopVoted(song) {
  if (!song?.votes) return false
  return getNetScore(song) >= TOP_VOTED_SCORE
}

export function getTotalVotes(songs) {
  return songs.reduce((total, song) => total + getUpVotes(song) + getDownVotes(song), 0)
}

/** Song with the best net score (first one wins a tie); null for an empty list. */
export function getTopSong(songs) {
  if (!songs.length) return null
  return songs.reduce((top, song) => (getNetScore(song) > getNetScore(top) ? song : top))
}

export function countGuestSuggested(songs) {
  return songs.filter(song => song.suggestedBy?.isOrganizer === false).length
}

/** Local search + filter + sort of the suggested list. Never mutates the input. */
export function filterAndSortSongs(songs, { search = '', filterBy = 'all', sortBy = 'recent' } = {}) {
  let list = [...songs]

  const term = search.trim().toLowerCase()
  if (term) {
    list = list.filter(
      song =>
        (song.title ?? '').toLowerCase().includes(term) ||
        (song.artist ?? '').toLowerCase().includes(term) ||
        (song.album ?? '').toLowerCase().includes(term)
    )
  }

  if (filterBy === 'admin') list = list.filter(song => song.suggestedBy?.isOrganizer === true)
  else if (filterBy === 'guest') list = list.filter(song => song.suggestedBy?.isOrganizer === false)
  else if (filterBy === 'topVoted') list = list.filter(isTopVoted)

  if (sortBy === 'popular') {
    list.sort((a, b) => getNetScore(b) - getNetScore(a))
  } else if (sortBy === 'mostVoted') {
    list.sort((a, b) => getUpVotes(b) + getDownVotes(b) - (getUpVotes(a) + getDownVotes(a)))
  } else if (sortBy === 'alphabetical') {
    list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''))
  }

  return list
}

/** Maps a Spotify search response to the shape the API stores. */
export function mapSpotifyTracks(result) {
  const items = result?.tracks?.items ?? []
  return items.map(track => ({
    platformId: track.id,
    title: track.name,
    artist: (track.artists ?? []).map(artist => artist.name).join(', '),
    album: track.album?.name || 'Unknown Album',
    thumbnailUrl: track.album?.images?.[0]?.url || THUMBNAIL_FALLBACK,
    previewUrl: track.preview_url || null
  }))
}

export function hasRealThumbnail(url) {
  return !!url && url !== THUMBNAIL_FALLBACK && !url.includes('via.placeholder.com')
}

export function spotifyEmbedUrl(platformId) {
  return platformId ? `https://open.spotify.com/embed/track/${platformId}` : ''
}

/** "+3", "-2", "0". */
export function formatNetScore(score) {
  return `${score > 0 ? '+' : ''}${score}`
}

export function netTone(score) {
  if (score > 0) return 'success'
  if (score < 0) return 'danger'
  return 'neutral'
}

/** First letter of a guest name, or "G". */
export function voterInitial(name) {
  return (name ?? '').trim().charAt(0).toUpperCase() || 'G'
}
