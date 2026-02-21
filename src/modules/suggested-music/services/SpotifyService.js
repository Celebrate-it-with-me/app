// services/SpotifyService.js
const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim()
const client_secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET?.trim()

/**
 * Get Spotify Authorization Token
 */
async function getToken() {
  const base64Credentials = btoa(`${client_id}:${client_secret}`)

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
    headers: {
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get Spotify token')
  }

  return response.json()
}

/**
 * Search songs on Spotify
 * @param {string} query - Search query
 * @param {number} limit - Number of results (default: 5)
 */
async function searchSongs(query, limit = 5) {
  try {
    const { access_token } = await getToken()

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to search songs on Spotify')
    }

    return response.json()
  } catch (error) {
    console.error('Spotify search error:', error)
    throw error
  }
}

export default {
  searchSongs,
  getToken
}
