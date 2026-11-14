/**
 * The API sends `avatar_url` as `<origin>/storage/<avatar>`. People who signed in with Google have an absolute URL in
 * `avatar`, so the API prefixes it too (`https://api/storage/https://lh3...`): give back the real address.
 * Anything that is not an http(s) URL (or an empty value) yields '' so the initials show instead.
 */
export function resolveAvatarUrl(value) {
  if (typeof value !== 'string') return ''
  const url = value.trim()
  if (!url) return ''
  const embedded = url.match(/\/storage\/(https?:\/\/.+)$/)
  const resolved = embedded ? embedded[1] : url
  return /^https?:\/\//i.test(resolved) ? resolved : ''
}
