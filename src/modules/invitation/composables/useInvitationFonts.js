/**
 * Loads the theme's Google Fonts on demand. Fraunces and Figtree ship with the app; anything
 * else (the script face of the Clásica theme, premium fonts later) is added once. Names come
 * from the API, so only plain family names are accepted.
 */
const BUNDLED = new Set(['Fraunces', 'Figtree'])
const NAME = /^[\w -]{1,40}$/

export function loadThemeFonts(fonts = {}) {
  if (typeof document === 'undefined') return
  for (const name of new Set(Object.values(fonts))) {
    if (typeof name !== 'string' || !NAME.test(name) || BUNDLED.has(name)) continue
    const id = `inv-font-${name.replace(/\W+/g, '-').toLowerCase()}`
    if (document.getElementById(id)) continue
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${name.trim().replace(/\s+/g, '+')}&display=swap`
    document.head.appendChild(link)
  }
}
