/**
 * Client-side policy for template-package ASTs. The server already sanitised the package when it
 * was installed; this is the second wall (defence in depth): everything that is not on a closed
 * list is dropped here, whatever the payload says.
 */
import { safeHttpsUrl } from '../composables/safeUrl'

export const LIMITS = { depth: 24, nodes: 600, text: 2000, classes: 8, carouselSlides: 24 }

/** Plain markup only. No script/style/iframe/object/embed/form/input/svg: they are not here. */
export const TAGS = new Set([
  'div', 'section', 'header', 'footer', 'article', 'span', 'p', 'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'blockquote', 'em', 'strong', 'small',
  'br', 'hr', 'time', 'address'
])
export const VOID_TAGS = new Set(['img', 'br', 'hr'])

const ROLES = new Set(['presentation', 'none', 'list', 'listitem', 'group', 'img', 'separator', 'note'])
const REVEALS = new Set(['rise', 'fade', 'zoom'])

/** Attributes whose value may come from a `{t:'var'}` node. */
export const VAR_ATTRS = new Set(['src', 'alt', 'aria-label', 'href'])

const noCredentials = href => (href && !/^https:\/\/[^/]*@/.test(href) ? href : null)

/** Internal paths and fragments, or absolute https. Anything else (javascript:, data:, http:, //host) is null. */
export function safeLink(value) {
  if (typeof value !== 'string') return null
  const v = value.trim()
  if (/^#[\w-]{1,40}$/.test(v)) return v
  if (/^\/(?![/\\])[^\s\\]{0,300}$/.test(v)) return v
  return noCredentials(safeHttpsUrl(v))
}

/** Package files (`assets/…`, resolved against the package base URL), internal paths and https images. */
export function safeSrc(value, base) {
  if (typeof value !== 'string') return null
  const v = value.trim()
  if (/^assets\/[a-z0-9][a-z0-9._/-]{0,120}$/.test(v) && !v.includes('..') && !v.includes('//')) {
    return base ? base + v : null
  }
  if (/^\/(?![/\\])[^\s\\]{0,300}$/.test(v)) return v
  return noCredentials(safeHttpsUrl(v))
}

/** Classes must be the package's own (`pkg-*`): a Tailwind utility like `fixed inset-0` must never be reachable. */
export function safeClass(value) {
  if (typeof value !== 'string') return null
  const tokens = value.split(/\s+/).filter(Boolean)
  if (!tokens.length || tokens.length > LIMITS.classes) return null
  return tokens.every(t => /^pkg-[a-z0-9_-]{1,60}$/.test(t)) ? tokens.join(' ') : null
}

const int = (v, min, max) => (/^\d{1,4}$/.test(String(v)) && +v >= min && +v <= max ? String(+v) : null)

/**
 * Validates one attribute. Returns the value to render, or undefined to drop the attribute.
 * @param {string} tag
 * @param {string} name
 * @param {unknown} value already resolved to a string
 */
export function cleanAttr(tag, name, value, base) {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const v = String(value)
  switch (name) {
    case 'class': return safeClass(v) ?? undefined
    case 'aria-label': return v.slice(0, 200)
    case 'aria-hidden': return v === 'true' ? 'true' : undefined
    case 'role': return ROLES.has(v) ? v : undefined
    case 'lang': return /^[a-z]{2}(-[A-Z]{2})?$/.test(v) ? v : undefined
    case 'data-reveal': return REVEALS.has(v) ? v : undefined
    case 'data-parallax': return /^0?\.\d{1,2}$|^0$/.test(v) && +v <= 0.3 ? v : undefined
    case 'data-delay': return int(v, 0, 20) ?? undefined
    case 'data-carousel': return v === '' || v === 'true' ? 'true' : undefined
    case 'data-variant': return /^[a-z0-9-]{1,24}$/.test(v) ? v : undefined
    default:
  }
  if (tag === 'a' && name === 'href') return safeLink(v) ?? undefined
  if (tag === 'a' && name === 'target') return v === '_blank' ? '_blank' : undefined
  if (tag === 'img') {
    if (name === 'src') return safeSrc(v, base) ?? undefined
    if (name === 'alt') return v.slice(0, 200)
    if (name === 'width' || name === 'height') return int(v, 1, 4000) ?? undefined
    if (name === 'loading') return v === 'eager' || v === 'lazy' ? v : undefined
    if (name === 'decoding') return v === 'async' ? v : undefined
    if (name === 'fetchpriority') return ['high', 'low', 'auto'].includes(v) ? v : undefined
  }
  if (tag === 'time' && name === 'datetime') return /^[\d\-T:+.Z ]{4,40}$/.test(v) ? v : undefined
  return undefined
}
