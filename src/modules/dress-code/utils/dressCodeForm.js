/** Rules of the dress code form; they mirror SaveDressCodeRequest in the API. */
export const TYPES = ['black-tie', 'formal', 'semi-formal', 'cocktail', 'smart-casual', 'thematic']
export const MAX_COLORS = 8
export const MAX_IMAGES = 6
export const MAX_FILE_BYTES = 2 * 1024 * 1024
export const FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const DESCRIPTION_MAX = 600

/** Quick picks for the color lists: names are translated in `app.dressCode.palette`. */
export const PALETTE = [
  { key: 'white', hex: '#ffffff' },
  { key: 'black', hex: '#1f1a17' },
  { key: 'gold', hex: '#c9a24e' },
  { key: 'silver', hex: '#c4c7cc' },
  { key: 'red', hex: '#c0242f' },
  { key: 'wine', hex: '#6d1f35' },
  { key: 'pink', hex: '#f0a6bb' },
  { key: 'fuchsia', hex: '#c2185b' },
  { key: 'lilac', hex: '#b79adf' },
  { key: 'navy', hex: '#1b2a4e' },
  { key: 'sky', hex: '#8ec5e8' },
  { key: 'emerald', hex: '#0f7a5a' },
  { key: 'sage', hex: '#9caf88' },
  { key: 'champagne', hex: '#ead9b8' }
]

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * One spelling for every colour: `#RRGGBB` in capitals. Accepts a missing `#`, `#RGB` and stray spaces; anything that is
 * not a colour gives null. Saved data reached the API as `#FFFFFF` while the palette holds `#ffffff`, so every comparison
 * (pressed swatch, name of a chip, the other group) goes through here.
 */
export function normalizeHex(value) {
  const match = HEX.exec(String(value ?? '').trim())
  if (!match) return null
  const digits = match[1].toUpperCase()
  return `#${digits.length === 3 ? [...digits].map(c => c + c).join('') : digits}`
}

/** Normalised colours of a list: junk dropped, repeats removed, order kept. */
export function normalizeColors(list) {
  const seen = new Set()
  return (Array.isArray(list) ? list : []).map(normalizeHex).filter(hex => hex && !seen.has(hex) && seen.add(hex))
}

/** Palette key (`white`, `fuchsia`...) of a colour, or null when it is a custom one. */
export const paletteKey = value => {
  const hex = normalizeHex(value)
  return hex ? (PALETTE.find(p => normalizeHex(p.hex) === hex)?.key ?? null) : null
}

/** Name of a palette colour in the current language, or null for a custom one. `t` is vue-i18n's. */
export const paletteName = (value, t) => {
  const key = paletteKey(value)
  return key ? t(`app.dressCode.palette.${key}`) : null
}

/** True when white text would not read on this colour (a check mark on it must be dark). */
export function isLightColor(value) {
  const hex = normalizeHex(value)
  if (!hex) return false
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

export const emptyForm = () => ({
  dressCodeType: '',
  description: '',
  reservedColors: [],
  suggestedColors: []
})

export function formFromApi(data) {
  return {
    dressCodeType: data?.dressCodeType ?? '',
    description: data?.description ?? '',
    reservedColors: normalizeColors(data?.reservedColors),
    suggestedColors: normalizeColors(data?.suggestedColors)
  }
}

/** `formal/vestido-largo.webp` becomes the key `formal/vestido-largo`. */
export const bankKeyFor = (type, file) => `${type}/${file.replace(/\.[^.]+$/, '')}`

/** Where the photo of a bank pick is served from, or null when the manifest does not list it. */
export function bankUrl(manifest, key) {
  const [type, name] = String(key).split('/')
  const entry = (manifest?.[type] ?? []).find(item => bankKeyFor(type, item.file) === key && name)
  return entry ? `/dress-code-bank/${type}/${entry.file}` : null
}

/** Bank entries for a type, with their key and url. */
export function bankFor(manifest, type) {
  return (Array.isArray(manifest?.[type]) ? manifest[type] : []).map(item => ({
    key: bankKeyFor(type, item.file),
    url: `/dress-code-bank/${type}/${item.file}`,
    credit: item.credit ?? ''
  }))
}

/** Why a file cannot be added, or null. */
export function fileProblem(file) {
  if (!FILE_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_FILE_BYTES) return 'size'
  return null
}

/**
 * Multipart body: the fields, the uploaded pictures to keep, the full set of bank picks and the new files.
 */
export function buildFormData(form, { keepImageIds = [], bankImages = [], files = [] } = {}) {
  const body = new FormData()
  body.append('dressCodeType', form.dressCodeType)
  body.append('description', form.description ?? '')
  normalizeColors(form.reservedColors).forEach(color => body.append('reservedColors[]', color))
  normalizeColors(form.suggestedColors).forEach(color => body.append('suggestedColors[]', color))
  keepImageIds.forEach(id => body.append('keepImageIds[]', String(id)))
  bankImages.forEach(key => body.append('bankImages[]', key))
  files.forEach(file => body.append('dressCodeImages[]', file))
  return body
}
