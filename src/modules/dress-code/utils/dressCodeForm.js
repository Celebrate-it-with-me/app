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
    reservedColors: [...(data?.reservedColors ?? [])],
    suggestedColors: [...(data?.suggestedColors ?? [])]
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
  form.reservedColors.forEach(color => body.append('reservedColors[]', color))
  form.suggestedColors.forEach(color => body.append('suggestedColors[]', color))
  keepImageIds.forEach(id => body.append('keepImageIds[]', String(id)))
  bankImages.forEach(key => body.append('bankImages[]', key))
  files.forEach(file => body.append('dressCodeImages[]', file))
  return body
}
