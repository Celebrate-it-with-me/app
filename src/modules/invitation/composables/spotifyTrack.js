/** A Spotify track id: 22 base-62 characters. Anything else never reaches an iframe `src`. */
const TRACK_ID = /^[A-Za-z0-9]{22}$/

/**
 * The Spotify track id of a song row, or null when the row cannot be played in the embedded player.
 * Rows from the guest search carry no `platform` (it is always Spotify); rows from the event list
 * may carry one, and anything other than `spotify` is left out.
 */
export function spotifyTrackId(song) {
  if (!song) return null
  if (song.platform !== undefined && song.platform !== null && song.platform !== 'spotify') return null
  const id = typeof song.platformId === 'string' ? song.platformId : ''
  return TRACK_ID.test(id) ? id : null
}

export const spotifyEmbedSrc = id => `https://open.spotify.com/embed/track/${id}`
export const spotifyOpenUrl = id => `https://open.spotify.com/track/${id}`
