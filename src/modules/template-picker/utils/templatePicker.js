/** Pure helpers for the template picker and the cover photo (contract: docs/plans/template-stage5-contract-draft.md). */

/** Templates ordered for the picker: the one in use, then the free ones, then the premium ones (name order inside each group). */
export function sortTemplates(list) {
  const rank = template => (template.current ? 0 : template.tier === 'premium' ? 2 : 1)
  return [...(Array.isArray(list) ? list : [])].sort((a, b) => rank(a) - rank(b) || String(a.name).localeCompare(String(b.name)))
}

/** The `{ es, en }` text in the interface language, falling back to the other one; plain strings pass through. */
export function pickText(value, locale = 'es') {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[locale] || value.es || value.en || ''
}

/** The API error code of a failed request: `code` of 403/404/409, or the first code of a 422 field. */
export function errorCode(error, field) {
  const data = error?.response?.data
  if (!data) return null
  if (data.code) return String(data.code)
  const first = field ? data.errors?.[field]?.[0] : Object.values(data.errors ?? {})[0]?.[0]
  return first ? String(first) : null
}

// ---- unlock bridge (D-2): the person leaves for the payment screen and comes back to the selector ----

const RETURN_KEY = 'qv.templateReturn'
const RETURN_TTL = 2 * 60 * 60 * 1000

/** Where the unlock screen is opened from a premium template (the address the contract fixes). */
export function unlockLocation(templateId) {
  return { name: 'unlock', params: { module: 'full' }, query: { from: 'template', template: String(templateId) } }
}

/** Remembers which template she wanted, because Stripe's return address cannot carry it. Never throws. */
export function rememberTemplateReturn(eventId, templateId, now = Date.now()) {
  try {
    sessionStorage.setItem(RETURN_KEY, JSON.stringify({ eventId: String(eventId), templateId: String(templateId), at: now }))
  } catch {
    /* private mode: the paid screen just goes home */
  }
}

/** `{ eventId, templateId }` if she left for the payment from a template and it is still fresh, else null. */
export function readTemplateReturn(eventId, now = Date.now()) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RETURN_KEY) ?? 'null')
    if (!saved?.templateId || now - saved.at > RETURN_TTL) return null
    if (eventId != null && String(saved.eventId) !== String(eventId)) return null
    return { eventId: saved.eventId, templateId: saved.templateId }
  } catch {
    return null
  }
}

export function clearTemplateReturn() {
  try {
    sessionStorage.removeItem(RETURN_KEY)
  } catch {
    /* nothing to clear */
  }
}

/** Address of the selector coming back from the payment. */
export const pickerReturnPath = templateId => `/dashboard/invitation?template=${encodeURIComponent(templateId)}`

// ---- cover photo ----

export const COVER_MAX_BYTES = 10 * 1024 * 1024
export const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const COVER_ACCEPT = COVER_TYPES.join(',')
export const COVER_ERRORS = ['not_an_image', 'unsupported_type', 'too_large', 'too_small', 'too_many_pixels', 'corrupt']

const EXTENSION_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

/**
 * Cheap checks before uploading: empty file, type (the browser's, else the extension) and size.
 * Returns the API's error code or null. The server decides again with the real file signature.
 */
export function validateCoverFile(file) {
  if (!file || !file.size) return 'not_an_image'
  const extension = String(file.name ?? '').split('.').pop().toLowerCase()
  const type = file.type || EXTENSION_TYPES[extension] || ''
  if (/^image\/(heic|heif|gif|svg)/.test(type) || /^(heic|heif|gif|svg)$/.test(extension)) return 'unsupported_type'
  if (!type.startsWith('image/')) return 'not_an_image'
  if (!COVER_TYPES.includes(type)) return 'unsupported_type'
  if (file.size > COVER_MAX_BYTES) return 'too_large'
  return null
}

/** `too_small` when the photo is narrower than the field's `minWidth`; null when it fits or the width is unknown. */
export function validateCoverWidth(width, minWidth) {
  return minWidth && width && width < minWidth ? 'too_small' : null
}

/** Reads the pixel size of an image file in the browser (null when it cannot be decoded: the server will say). */
export function readImageSize(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    image.src = url
  })
}

const clamp = value => Math.min(100, Math.max(0, Math.round(value)))

/** `"40% 25%"` -> `{ x: 40, y: 25 }`; anything else is the centre. */
export function parseFocus(value) {
  const match = /^(\d{1,3})% (\d{1,3})%$/.exec(String(value ?? ''))
  return match ? { x: clamp(match[1]), y: clamp(match[2]) } : { x: 50, y: 50 }
}

/** `{ x, y }` -> `"40% 25%"`, the format the API validates (`object-position`). */
export function formatFocus({ x, y }) {
  return `${clamp(x)}% ${clamp(y)}%`
}

/** Focus from a tap inside a box: where the pointer is, as a percentage of the box. */
export function focusFromPoint(rect, clientX, clientY) {
  if (!rect?.width || !rect?.height) return { x: 50, y: 50 }
  return { x: clamp(((clientX - rect.left) / rect.width) * 100), y: clamp(((clientY - rect.top) / rect.height) * 100) }
}

/** `"4:5"` -> 0.8 (width / height); null when the field gives no usable ratio. */
export function parseAspect(value) {
  const match = /^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/.exec(String(value ?? ''))
  return match && Number(match[2]) > 0 ? Number(match[1]) / Number(match[2]) : null
}

/**
 * The part of the image that stays visible in a frame of aspect `frame` with `object-fit: cover` and the given focus,
 * as fractions (0..1) of the image: `{ left, top, width, height }`.
 */
export function visibleRect(imageAspect, frameAspect, focus) {
  if (!imageAspect || !frameAspect) return { left: 0, top: 0, width: 1, height: 1 }
  if (imageAspect > frameAspect) {
    const width = frameAspect / imageAspect
    return { left: (focus.x / 100) * (1 - width), top: 0, width, height: 1 }
  }
  const height = imageAspect / frameAspect
  return { left: 0, top: (focus.y / 100) * (1 - height), width: 1, height }
}

/** Keyboard step for the focus picker: arrows move 5 points (shift: 1), Home/End jump to the edges. */
export function nudgeFocus(focus, key, fine = false) {
  const step = fine ? 1 : 5
  const next = { ...focus }
  if (key === 'ArrowLeft') next.x -= step
  else if (key === 'ArrowRight') next.x += step
  else if (key === 'ArrowUp') next.y -= step
  else if (key === 'ArrowDown') next.y += step
  else return null
  return { x: clamp(next.x), y: clamp(next.y) }
}
