/**
 * Pure helpers of the "Tu invitación" editor. The API is the only one that interprets `bind` and decides what is valid
 * (docs/plans/template-stage5-contract-draft.md §2, §5): what lives here mirrors the rules only to answer fast on a phone.
 */

export const LOCALES = ['es', 'en']
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/** Warm swatches offered next to the free hex input (the person can still type any color). */
export const SWATCHES = ['#7b2d5b', '#b4456a', '#d98b9b', '#c9a24d', '#566f52', '#8fa68a', '#2f5d7c', '#3b2f2f', '#f3e3d3', '#ffffff']

/** A `{ es, en }` object (labels, helps, texts) in the interface language, falling back to the other one. */
export function pick(value, locale) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return value[locale] ?? value.es ?? value.en ?? ''
}

export function isHex(value) {
  return typeof value === 'string' && HEX.test(value.trim())
}

/** `abc` -> `#abc`, upper case -> lower case. Anything else is returned trimmed so the validator can reject it. */
export function normalizeHex(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return raw
  const withHash = raw.startsWith('#') ? raw : `#${raw}`
  return HEX.test(withHash) ? withHash.toLowerCase() : raw
}

/** `#rgb` / `#rrggbb` (alpha dropped) as a 6-digit hex for `<input type="color">`, or null. */
export function toSixDigit(value) {
  if (!isHex(value)) return null
  const hex = value.trim().slice(1).toLowerCase()
  if (hex.length === 3 || hex.length === 4) return `#${[...hex.slice(0, 3)].map(c => c + c).join('')}`
  return `#${hex.slice(0, 6)}`
}

function luminance(hex) {
  const six = toSixDigit(hex)
  if (!six) return null
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(six.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio of two hex colors, or null when one is not a color. */
export function contrastRatio(a, b = '#ffffff') {
  const la = luminance(a)
  const lb = luminance(b)
  if (la == null || lb == null) return null
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** A warning (never a block) when a color has little contrast with the light page. */
export function lowContrast(value) {
  const ratio = contrastRatio(value)
  return ratio != null && ratio < 4.5
}

/** Max length of a text field in one language (the manifest allows <= 1000). */
export function maxFor(field, lang) {
  const max = field.max
  if (max == null) return 1000
  if (typeof max === 'number') return max
  return max[lang] ?? 1000
}

/** What the person typed -> what we send: text trimmed per language. */
export function cleanValue(field, value) {
  if (value === null) return null
  if (field.type === 'text') {
    return Object.fromEntries(LOCALES.map(lang => [lang, String(value?.[lang] ?? '').trim()]))
  }
  if (field.type === 'color') return normalizeHex(value)
  return value
}

/**
 * Mirror check before sending. Returns `{ code, lang? }` using the API's own codes, or null.
 * `null` (back to the template's value) is always fine.
 */
export function validateValue(field, value) {
  if (value === null) return null
  switch (field.type) {
    case 'text':
      for (const lang of LOCALES) {
        if (String(value?.[lang] ?? '').length > maxFor(field, lang)) return { code: 'too_long', lang }
      }
      return null
    case 'color':
      return isHex(value) ? null : { code: 'invalid_color' }
    case 'choice':
      return (field.choices ?? []).some(c => c.value === value) ? null : { code: 'invalid_choice' }
    case 'toggle':
      return typeof value === 'boolean' ? null : { code: 'invalid_type' }
    default:
      return null
  }
}

/** Same value? (objects by content, enough for `{ es, en }`). */
export function sameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * 422 body -> `{ [fieldId]: { code, lang? } }`. The API (InvitationEditor) sends FLAT dotted keys,
 * `errors["fields.<id>"][0]` and `errors["fields.<id>.es"][0]` for a language of a text; a nested `errors.fields.<id>`
 * is read too in case a validator ever sends it. Ids are matched against `known` so an id that contains a dot still resolves.
 */
export function fieldErrorsFrom(error, known = []) {
  const errors = error?.response?.data?.errors
  if (!errors || typeof errors !== 'object') return {}
  const out = {}
  const put = (id, lang, code) => {
    if (!out[id]) out[id] = { code, ...(lang ? { lang } : {}) }
  }
  const nested = errors.fields
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    for (const [id, value] of Object.entries(nested)) {
      if (Array.isArray(value)) put(id, null, value[0])
      else if (value && typeof value === 'object') for (const [lang, v] of Object.entries(value)) put(id, lang, Array.isArray(v) ? v[0] : v)
    }
  }
  for (const [key, value] of Object.entries(errors)) {
    if (!key.startsWith('fields.')) continue
    const rest = key.slice('fields.'.length)
    const code = Array.isArray(value) ? value[0] : value
    const id = known.find(k => rest === k || rest.startsWith(`${k}.`))
    if (id) put(id, rest === id ? null : rest.slice(id.length + 1), code)
    else {
      const [first, lang] = rest.split('.')
      put(first, lang ?? null, code)
    }
  }
  return out
}

/** The one list-level code of `errors.fields[0]` (config_too_large). */
export function generalFieldsError(error) {
  const list = error?.response?.data?.errors?.fields
  return Array.isArray(list) ? list[0] : null
}

/** 422 on sections -> first `{ index, field, code }`. Keys look like `sections.2.enabled`. */
export function sectionErrorFrom(error) {
  const errors = error?.response?.data?.errors
  if (!errors) return null
  for (const [key, value] of Object.entries(errors)) {
    const m = /^sections\.(\d+)\.(\w+)$/.exec(key)
    if (m) return { index: Number(m[1]), field: m[2], code: Array.isArray(value) ? value[0] : value }
    if (key === 'sections') return { index: null, field: null, code: Array.isArray(value) ? value[0] : value }
  }
  return null
}

/**
 * Classifies a failed request: 'network' | 'validation' | 'plan' | 'locked' | 'archived' | 'forbidden' | 'notfound' |
 * 'nocover' | 'server' | 'other'. `archived` is the 422 `errors.status = ['event_archived']` of every write, which is not
 * about any field; `notfound` is 404 `field_not_found` and `nocover` 409 `package_no_cover_field`.
 */
export function classify(error) {
  const res = error?.response
  if (!res) return 'network'
  const code = res.data?.code
  if (res.status === 422 && res.data?.errors?.status?.[0] === 'event_archived') return 'archived'
  if (res.status === 422) return 'validation'
  if (res.status === 403 && code === 'plan_required') return 'plan'
  if (res.status === 403) return 'forbidden'
  if (res.status === 404 && code === 'field_not_found') return 'notfound'
  if (res.status === 409 && code === 'template_locked') return 'locked'
  if (res.status === 409 && code === 'package_no_cover_field') return 'nocover'
  if (res.status >= 500 || res.status === 429 || res.status === 408) return 'server'
  return 'other'
}

/** The i18n code (`invitationEditor.errors.<code>`) that speaks for a failure `classify` knows by kind, or null. */
export const FAILURE_CODES = { archived: 'event_archived', forbidden: 'forbidden', notfound: 'field_not_found', nocover: 'package_no_cover_field' }

/**
 * What the form sends to `POST preview` to see the unsaved edits: `{ <fieldId>: value }` for every field that differs from
 * the template's value, skipping photos (they have their own endpoint), locked fields and the ones with an error.
 */
export function previewOverrides(fields, errors = {}) {
  const out = {}
  for (const f of fields ?? []) {
    if (f.type === 'image' || f.locked || f.isDefault || errors[f.id] || !['text', 'color', 'choice', 'toggle'].includes(f.type)) continue
    const value = cleanValue(f, f.value)
    if (!validateValue(f, value)) out[f.id] = value
  }
  return out
}

/** Sections in display order. */
export function orderedSections(sections) {
  return [...sections].sort((a, b) => a.order - b.order)
}

/** Body of `PATCH sections`: only type, enabled and order, order renumbered 1..n. */
export function sectionsPayload(sections) {
  return orderedSections(sections).map((s, i) => ({ type: s.type, enabled: s.enabled, order: i + 1 }))
}

/** Can this section move one place (`-1` up, `1` down)? The cover stays first; nothing goes above it. */
export function canMove(sections, type, direction) {
  const list = orderedSections(sections)
  const i = list.findIndex(s => s.type === type)
  if (i < 0) return false
  const target = i + direction
  if (target < 0 || target >= list.length) return false
  if (list[i].type === 'cover') return false
  if (list[target].type === 'cover') return false
  return true
}

export function moveSection(sections, type, direction) {
  if (!canMove(sections, type, direction)) return sections
  const list = orderedSections(sections)
  const i = list.findIndex(s => s.type === type)
  ;[list[i], list[i + direction]] = [list[i + direction], list[i]]
  return list.map((s, n) => ({ ...s, order: n + 1 }))
}
