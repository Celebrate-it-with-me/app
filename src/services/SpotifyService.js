// services/SpotifyService.js
const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const client_secret = import.meta.env.VITE_SPOTIFY_CLIEN_SECRET

// Get Authorization
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

  return response.json()
}

// Fetch Songs Based on Query
async function searchSongs(query) {
  const { access_token } = await getToken()
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  return response.json()
}

export default { searchSongs }
