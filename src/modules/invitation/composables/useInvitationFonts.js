import pinyonLatin from '@/assets/fonts/pinyon-script-latin.woff2?url'

/**
 * Loads the theme's Google Fonts on demand. Fraunces, Figtree and Pinyon Script ship with the app
 * (see assets/fonts/fonts.css); anything else (premium fonts later) is added once. Names come
 * from the API, so only plain family names are accepted.
 */
const BUNDLED = new Set(['Fraunces', 'Figtree', 'Pinyon Script'])
const PRELOADS = { 'Pinyon Script': pinyonLatin }

function preload(name) {
  const href = PRELOADS[name]
  const id = `inv-preload-${name.replace(/\W+/g, '-').toLowerCase()}`
  if (!href || document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'preload'
  link.setAttribute('as', 'font')
  link.type = 'font/woff2'
  link.crossOrigin = 'anonymous'
  link.href = href
  document.head.appendChild(link)
}
const NAME = /^[\w -]{1,40}$/

export function loadThemeFonts(fonts = {}) {
  if (typeof document === 'undefined') return
  for (const name of new Set(Object.values(fonts))) {
    if (typeof name !== 'string' || !NAME.test(name)) continue
    if (BUNDLED.has(name)) {
      preload(name)
      continue
    }
    const id = `inv-font-${name.replace(/\W+/g, '-').toLowerCase()}`
    if (document.getElementById(id)) continue
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${name.trim().replace(/\s+/g, '+')}&display=swap`
    document.head.appendChild(link)
  }
}
