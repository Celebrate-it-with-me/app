/**
 * In-memory stand-in for the template selector and cover photo endpoints, active when `VITE_INVITATION_PICKER_MOCK` is set.
 * It follows docs/plans/template-stage5-contract-draft.md so the screens can be built and photographed before the API exists.
 * Values of the variable (`localStorage['cwm.templatePickerMock']` overrides it at runtime), comma separated:
 *   1            free event, nothing published (default)
 *   unlocked     the event has the full plan: no template is locked
 *   published    the template is pinned: applying answers 409 template_locked
 *   error        the template list answers 500
 *   empty        the list is empty
 *   gone         applying answers 403 template_not_available (the list is stale)
 *   noplan       applying a premium answers 403 plan_required even if the list said unlocked
 *   impacterror  the impact answers 500
 *   nocover      the cover photo answers 409 package_no_cover_field
 *   cover:<code> the photo upload answers 422 with that code (not_an_image, too_large, too_small...)
 *   photo        the event starts with a cover photo
 *   count:<n>    only n templates (1, 2) or n in total with synthetic extras (6), to see the grid at every size
 *   longnames    the extra templates carry very long names
 */
const PORTRAIT = '/demo/valentina-portrait.webp'

export function mockFlags() {
  let value
  try {
    value = localStorage.getItem('cwm.templatePickerMock')
  } catch {
    value = null
  }
  return String(value || import.meta.env.VITE_INVITATION_PICKER_MOCK)
    .split(',')
    .map(item => item.trim())
}

function fail(status, data) {
  const error = new Error(`mock ${status}`)
  error.response = { status, data }
  return error
}

const wait = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms))

/** A tiny two-tone poster as the template thumbnail, so the cards differ without shipping images. */
function poster(a, b, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="390" height="844" fill="url(#g)"/><ellipse cx="195" cy="300" rx="110" ry="150" fill="#fff" fill-opacity=".55"/><text x="195" y="620" font-family="serif" font-size="44" text-anchor="middle" fill="#2b2420">${label}</text><rect x="95" y="660" width="200" height="6" rx="3" fill="#2b2420" fill-opacity=".35"/><rect x="130" y="690" width="130" height="6" rx="3" fill="#2b2420" fill-opacity=".25"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const CATALOG = [
  { id: 1, slug: 'classic', name: 'Clásica', description: { es: 'Elegante y atemporal, con adornos dorados.', en: 'Elegant and timeless, with gold details.' }, tier: 'free', tags: ['elegante'], previewImage: poster('#f7ecdd', '#e9cfa7', 'XV'), hasPresets: false, color: '#b04a62' },
  { id: 2, slug: 'sage-roses', name: 'Rosas de salvia', description: { es: 'Verdes suaves y rosas de acuarela.', en: 'Soft greens and watercolor roses.' }, tier: 'free', tags: ['floral'], previewImage: poster('#e4ecdf', '#b9cdb0', 'XV'), hasPresets: false, color: '#566f52' },
  { id: 5, slug: 'ivory', name: 'Marfil', description: { es: 'Sencilla y luminosa, para cualquier fiesta.', en: 'Simple and bright, for any party.' }, tier: 'free', tags: ['minimal'], previewImage: null, hasPresets: false, color: '#8a7a5c' },
  {
    id: 3,
    slug: 'botanical-quinceanera',
    name: 'Botánica acuarela',
    description: { es: 'Follaje pintado a mano con tres paletas.', en: 'Hand-painted foliage in three palettes.' },
    tier: 'premium',
    tags: ['floral', 'elegante'],
    previewImage: poster('#dfe9d6', '#7f9c78', 'XV'),
    hasPresets: true,
    presets: [
      { value: 'salvia', key: 'salvia', name: 'Salvia', label: { es: 'Salvia', en: 'Sage' }, colors: ['#eef3e8', '#7f9c78', '#3f5a3a'], palette: { background: '#eef3e8', text: '#3f5a3a', accent: '#7f9c78' } },
      { value: 'rosa', key: 'rosa', name: 'Rosa', label: { es: 'Rosa', en: 'Rose' }, colors: ['#fbeff1', '#c9657c', '#7b2d3f'], palette: { background: '#fbeff1', text: '#7b2d3f', accent: '#c9657c' } },
      { value: 'noche', key: 'noche', name: 'Noche', label: { es: 'Noche', en: 'Night' }, colors: ['#232634', '#c9a24b', '#f5efe0'], palette: { background: '#232634', text: '#f5efe0', accent: '#c9a24b' } }
    ],
    color: '#7b2d5b'
  },
  { id: 4, slug: 'golden-night', name: 'Noche dorada', description: { es: 'Fondo oscuro con detalles en oro.', en: 'Dark background with gold details.' }, tier: 'premium', tags: ['moderna'], previewImage: poster('#3a2f4b', '#17121f', 'XV'), hasPresets: false, color: '#c9a24b' }
]

const MISSING = { 2: ['seating'], 3: ['comments', 'seating'], 4: ['seating'] }

const state = { current: 1, undo: null, cover: null }

const EXTRA_NAMES = ['Jardín de peonías', 'Minimal blanco', 'Gala dorada']
const LONG_NAME = 'Una plantilla con un nombre larguísimo que no cabe en una sola línea de la tarjeta'

/** The catalog the flags ask for: `count:1` keeps the current one; `count:6` adds synthetic extras. */
function catalog() {
  const flags = mockFlags()
  const wanted = Number(flags.find(item => item.startsWith('count:'))?.slice(6)) || CATALOG.length
  if (wanted <= CATALOG.length) return CATALOG.slice(0, wanted)
  const extras = Array.from({ length: wanted - CATALOG.length }, (_, index) => ({
    id: 100 + index,
    slug: `extra-${index}`,
    name: flags.includes('longnames') ? `${LONG_NAME} ${index + 1}` : (EXTRA_NAMES[index] ?? `Extra ${index + 1}`),
    description: { es: 'Plantilla de ejemplo para el mock.', en: 'Sample template for the mock.' },
    tier: index % 2 ? 'premium' : 'free',
    tags: [index % 2 ? 'moderna' : 'minimal'],
    previewImage: poster('#efe6f5', '#c4b0d8', 'XV'),
    hasPresets: false,
    color: '#6b4f8a'
  }))
  return [...CATALOG, ...extras]
}

function snapshot() {
  const flags = mockFlags()
  const unlocked = flags.includes('unlocked')
  if (flags.includes('photo') && !state.cover && !state.photoDismissed) state.cover = coverValue()
  return catalog().map(template => ({
    ...Object.fromEntries(Object.entries(template).filter(([key]) => key !== 'color')),
    eventTypes: ['quinceanera', 'wedding'],
    // Contract module-template-compat: slugs of the modules this template has no block for (native templates: none).
    missingModules: flags.includes('missingcurrent') && template.id === 1 ? ['comments', 'seating'] : (MISSING[template.id] ?? []), // flag `missingcurrent`: the one in use lacks both
    locked: template.tier === 'premium' && !unlocked,
    current: template.id === state.current
  }))
}

function coverValue(focus = '50% 50%') {
  return { url: PORTRAIT, thumbUrl: PORTRAIT, focus, width: 1440, height: 1800 }
}

export async function templates() {
  const flags = mockFlags()
  await wait()
  if (flags.includes('error')) throw fail(500, { message: 'Server error.' })
  if (flags.includes('empty')) return []
  return snapshot()
}

export async function impact(eventId, templateId) {
  const flags = mockFlags()
  await wait()
  if (flags.includes('impacterror')) throw fail(500, { message: 'Server error.' })
  const template = snapshot().find(item => item.id === Number(templateId))
  if (!template) throw fail(404, { message: 'Not found.', code: 'template_not_found' })
  const published = flags.includes('published')
  return {
    templateId: template.id,
    tier: template.tier,
    locked: template.locked,
    willPin: false,
    keeps: [{ kind: 'sections', detail: 'enabled,order,title,text' }, ...(state.cover ? [{ kind: 'cover_photo' }] : [])],
    resets: template.hasPresets || template.tier === 'premium' ? [{ kind: 'preset', from: 'rosa', to: 'salvia' }, { kind: 'options', count: 2 }] : [{ kind: 'options', count: 1 }],
    restoresFromStash: template.id === 2 && state.current !== 2 && state.undo !== null,
    changesPublishedLook: published
  }
}

export async function apply(eventId, { template_id: id }) {
  const flags = mockFlags()
  await wait(400)
  const template = snapshot().find(item => item.id === Number(id))
  if (!template) throw fail(404, { message: 'Not found.', code: 'template_not_found' })
  if (flags.includes('published')) throw fail(409, { message: 'Template locked.', code: 'template_locked' })
  if (flags.includes('gone')) throw fail(403, { message: 'Not available.', code: 'template_not_available' })
  if (template.locked || (flags.includes('noplan') && template.tier === 'premium')) throw fail(403, { message: 'Plan required.', code: 'plan_required' })
  const from = state.current
  state.current = template.id
  state.undo = { until: new Date(Date.now() + 10 * 60 * 1000).toISOString(), templateId: from }
  return { template: { id: template.id, slug: template.slug, name: template.name, tier: template.tier }, undo: state.undo }
}

const SECTION_COPY = {
  es: { phrase: 'Celebra conmigo', closing: 'Gracias por acompañarme' },
  en: { phrase: 'Celebrate with me', closing: 'Thank you for joining me' }
}

export async function preview(eventId, { template_id: id, locale = 'es', state: stage = 'invitation' }) {
  const flags = mockFlags()
  await wait(300)
  const template = snapshot().find(item => item.id === Number(id ?? state.current))
  if (!template) throw fail(404, { message: 'Not found.', code: 'template_not_found' })
  if (flags.includes('gone') && template.id !== state.current) throw fail(403, { message: 'Not available.', code: 'template_not_available' })
  const color = catalog().find(item => item.id === template.id).color
  const copy = SECTION_COPY[locale] ?? SECTION_COPY.es
  const std = stage === 'save_the_date'
  const photo = stage === 'no_photo' || std ? null : state.cover?.url ? PORTRAIT : null
  return {
    locale,
    stage: std ? 'save_the_date' : 'invitation',
    branding: { watermark: true },
    event: { name: 'Los XV de Valentina', typeSlug: 'quinceanera', startsAt: '2027-06-12T18:00:00', timezone: 'America/New_York' },
    guest: { name: locale === 'en' ? 'Guest' : 'Invitada/o' },
    theme: { colors: { primary: color }, fonts: {} },
    sections: [
      { type: 'cover', title: copy.phrase, text: null, data: { eventName: 'Los XV de Valentina', image: photo, focus: state.cover?.focus ?? null } },
      { type: 'closing', title: copy.closing, text: null, data: {} }
    ]
  }
}

export async function uploadCover(eventId, file, focus) {
  const flags = mockFlags()
  await wait(700)
  if (flags.includes('nocover')) throw fail(409, { message: 'No cover field.', code: 'package_no_cover_field' })
  const code = flags.find(item => item.startsWith('cover:'))?.slice(6)
  if (code) throw fail(422, { message: 'Invalid photo.', errors: { photo: [code] } })
  state.cover = coverValue(focus || '50% 50%')
  state.cover.bytes = file?.size ?? 0
  return state.cover
}

export async function removeCover() {
  await wait(300)
  state.cover = null
  state.photoDismissed = true
  return null
}

export async function saveFocus(eventId, focus) {
  await wait(250)
  if (state.cover) state.cover = { ...state.cover, focus }
  return { fields: [{ id: 'cover_photo', value: state.cover }], savedAt: new Date().toISOString() }
}

/** The cover photo field as GET invitation would give it, for the dev page. */
export function coverField() {
  mockFlags().includes('photo') && !state.cover && !state.photoDismissed && (state.cover = coverValue())
  return {
    id: 'cover_photo',
    type: 'image',
    group: 'cover',
    label: { es: 'Foto de portada', en: 'Cover photo' },
    help: { es: 'Vertical 4:5, mínimo 960 px de ancho.', en: 'Portrait 4:5, at least 960 px wide.' },
    plan: 'free',
    locked: false,
    aspect: '4:5',
    minWidth: 960,
    value: state.cover,
    isDefault: !state.cover
  }
}
