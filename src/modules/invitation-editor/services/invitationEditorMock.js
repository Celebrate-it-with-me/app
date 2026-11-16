/**
 * In-memory stand-in for the invitation-editor endpoints, active when `VITE_INVITATION_EDITOR_MOCK` is set (DEV only).
 * It follows docs/plans/template-stage5-contract-draft.md §4.2, §4.6 (shapes and errors). Values of the variable:
 *   1 / free   free event: `plan: full` fields come locked (403 plan_required if saved anyway)
 *   full       unlocked event
 *   pinned     published and pinned: state.templateLocked = true (changing the template is support-only; fields stay editable)
 *   conflict   every save answers 409 template_locked
 *   fallback   the template is gone: template.fallbackToClassic = true
 *   empty      a template with no editable fields
 *   error      GET fails (network error)
 *   offline    every save fails as a network error (retry / offline banner)
 *   flaky      the first save of every ten fails with a 500
 *   saveerror  every save answers 500
 * `localStorage['cwm.invitationEditorMock']` overrides the variable at runtime (handy for screenshots).
 */
function mode() {
  try {
    return localStorage.getItem('cwm.invitationEditorMock') || String(import.meta.env.VITE_INVITATION_EDITOR_MOCK)
  } catch {
    return String(import.meta.env.VITE_INVITATION_EDITOR_MOCK)
  }
}

function fail(status, data) {
  const error = new Error(`mock ${status}`)
  error.response = { status, data }
  return error
}
const networkError = () => Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' })
const wait = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms))

let store = null
let writes = 0

function build() {
  const unlocked = mode() === 'full'
  const lockedByPlan = (plan) => plan === 'full' && !unlocked
  const field = (f) => ({ locked: lockedByPlan(f.plan), required: false, isDefault: true, ...f, default: f.default ?? f.value })
  const fields = [
    field({
      id: 'cover_photo', type: 'image', group: 'cover', plan: 'free',
      label: { es: 'Foto de portada', en: 'Cover photo' },
      help: { es: 'Vertical 4:5, mínimo 960 px de ancho.', en: 'Vertical 4:5, at least 960 px wide.' },
      aspect: '4:5', minWidth: 960, value: null
    }),
    field({
      id: 'cover_title', type: 'text', group: 'cover', plan: 'free', multiline: false,
      label: { es: 'Título de la portada', en: 'Cover title' },
      max: { es: 60, en: 60 }, value: { es: 'Mis XV años', en: 'My Sweet 15' }
    }),
    field({
      id: 'cover_text', type: 'text', group: 'cover', plan: 'free', multiline: true,
      label: { es: 'Mensaje de bienvenida', en: 'Welcome message' },
      help: { es: 'Se muestra bajo tu nombre.', en: 'Shown under your name.' },
      max: { es: 160, en: 160 }, value: { es: 'Celebra conmigo este día tan especial.', en: 'Celebrate this special day with me.' }
    }),
    field({
      id: 'preset', type: 'choice', group: 'look', plan: 'free',
      label: { es: 'Paleta', en: 'Palette' },
      choices: [
        { value: 'rosa', label: { es: 'Rosa', en: 'Rose' }, swatches: ['#d98b9b', '#7b2d5b', '#f3e3d3'] },
        { value: 'salvia', label: { es: 'Salvia', en: 'Sage' }, swatches: ['#8fa68a', '#566f52', '#f3e3d3'] },
        { value: 'dorado', label: { es: 'Dorado', en: 'Gold' }, swatches: ['#c9a24d', '#3b2f2f', '#fff7e6'] }
      ],
      value: 'salvia'
    }),
    field({ id: 'color_primary', type: 'color', group: 'look', plan: 'full', label: { es: 'Color principal', en: 'Primary color' }, value: '#566f52' }),
    field({ id: 'color_accent', type: 'color', group: 'look', plan: 'free', label: { es: 'Color de acento', en: 'Accent color' }, value: '#c9a24d' }),
    field({
      id: 'cover_layout', type: 'choice', group: 'look', plan: 'full',
      label: { es: 'Estilo de portada', en: 'Cover style' },
      choices: [
        { value: 'arch', label: { es: 'Arco', en: 'Arch' } },
        { value: 'bleed', label: { es: 'Foto a sangre', en: 'Full-bleed' } }
      ],
      value: 'bleed'
    }),
    field({ id: 'ornaments', type: 'toggle', group: 'extras', plan: 'free', label: { es: 'Adornos florales', en: 'Floral ornaments' }, help: { es: 'Muestra las flores en los bordes.', en: 'Shows flowers on the edges.' }, value: true })
  ]
  const groups = [
    { id: 'cover', label: { es: 'Portada', en: 'Cover' } },
    { id: 'look', label: { es: 'Estilo', en: 'Look' } },
    { id: 'extras', label: { es: 'Detalles', en: 'Details' } }
  ]
  const sections = [
    { type: 'cover', enabled: true, order: 1, required: true, title: { es: 'Portada', en: 'Cover' } },
    { type: 'countdown', enabled: true, order: 2, required: false, title: { es: 'Cuenta regresiva', en: 'Countdown' } },
    { type: 'program', enabled: true, order: 3, required: false, title: { es: 'Programa', en: 'Program' } },
    { type: 'gallery', enabled: false, order: 4, required: false, moduleState: unlocked ? 'active' : 'locked', title: { es: 'Galería', en: 'Gallery' } },
    { type: 'rsvp', enabled: true, order: 5, required: true, title: { es: 'Confirmación', en: 'RSVP' } }
  ]
  const pinned = mode() === 'pinned'
  return {
    template: {
      id: 12, slug: 'botanical-quinceanera', name: 'Botánica acuarela', tier: 'premium', level: 1, packageSlug: 'botanical',
      versionId: 340, versionSemver: '1.0.0', available: true, fallbackToClassic: mode() === 'fallback'
    },
    state: { status: pinned ? 'published' : 'draft', stage: 'invitation', pinned, templateLocked: pinned, unlocked, locale: 'es' },
    groups,
    fields: mode() === 'empty' ? [] : fields,
    sections,
    previewToken: null
  }
}

const clone = (v) => JSON.parse(JSON.stringify(v))

function current() {
  if (!store) store = build()
  return store
}

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

function guardWrite() {
  const m = mode()
  if (m === 'offline') throw networkError()
  if (m === 'saveerror') throw fail(500, { message: 'Server Error' })
  if (m === 'flaky' && writes++ % 10 === 0) throw fail(500, { message: 'Server Error' })
  if (m === 'conflict') {
    throw fail(409, { message: 'Tu invitación ya está publicada. Para cambiar de plantilla escríbenos y conservamos tus enlaces.', code: 'template_locked' })
  }
}

export const mockInvitationEditor = {
  /** Test/screenshot helper: forget everything so the next call rebuilds from the current mode. */
  reset() {
    store = null
    writes = 0
  },

  async get() {
    await wait()
    if (mode() === 'error') throw networkError()
    store = null
    return clone(current())
  },

  async saveFields(_eventId, body) {
    await wait()
    guardWrite()
    const data = current()
    const errors = {}
    for (const [id, value] of Object.entries(body ?? {})) {
      const f = data.fields.find(x => x.id === id)
      if (!f) throw fail(404, { message: 'Campo no encontrado.', code: 'field_not_found' })
      if (f.locked && value !== null) throw fail(403, { message: 'Este campo es parte del evento completo.', code: 'plan_required' })
      if (value === null) continue
      if (f.type === 'text') {
        for (const lang of ['es', 'en']) {
          const text = value?.[lang]
          if (typeof text !== 'string') errors[`fields.${id}.${lang}`] = ['invalid_type']
          else if (/<[^>]*>/.test(text)) errors[`fields.${id}.${lang}`] = ['invalid_type']
          else if (text.length > (f.max?.[lang] ?? 1000)) errors[`fields.${id}.${lang}`] = ['too_long']
        }
      } else if (f.type === 'color') {
        if (typeof value !== 'string' || !HEX.test(value)) errors[`fields.${id}`] = ['invalid_color']
      } else if (f.type === 'choice') {
        if (!f.choices.some(c => c.value === value)) errors[`fields.${id}`] = ['invalid_choice']
      } else if (f.type === 'toggle') {
        if (typeof value !== 'boolean') errors[`fields.${id}`] = ['invalid_type']
      } else if (f.type === 'image') {
        if (!value || typeof value.focus !== 'string' || !/^\d{1,3}% \d{1,3}%$/.test(value.focus)) errors[`fields.${id}`] = ['invalid_focus']
      }
    }
    if (Object.keys(errors).length) throw fail(422, { message: 'Hay campos con errores.', errors })
    const touched = []
    for (const [id, value] of Object.entries(body ?? {})) {
      const f = data.fields.find(x => x.id === id)
      f.value = value === null ? clone(f.default) : f.type === 'image' ? { ...(f.value ?? {}), ...value } : value
      f.isDefault = JSON.stringify(f.value) === JSON.stringify(f.default)
      touched.push(clone({ id: f.id, value: f.value, isDefault: f.isDefault }))
    }
    return { fields: touched, savedAt: new Date().toISOString() }
  },

  async saveSections(_eventId, sections) {
    await wait()
    guardWrite()
    const data = current()
    const errors = {}
    sections.forEach((s, i) => {
      const known = data.sections.find(x => x.type === s.type)
      if (!known) errors[`sections.${i}.type`] = ['invalid_type']
      else if (known.required && !s.enabled) errors[`sections.${i}.enabled`] = ['required_section']
      else if (s.enabled && known.moduleState === 'locked') errors[`sections.${i}.enabled`] = ['module_locked']
    })
    const cover = sections.find(s => s.type === 'cover')
    if (cover && cover.order !== Math.min(...sections.map(s => s.order))) errors[`sections.${sections.indexOf(cover)}.order`] = ['cover_first']
    if (Object.keys(errors).length) throw fail(422, { message: 'Hay secciones con errores.', errors })
    for (const s of sections) Object.assign(data.sections.find(x => x.type === s.type), { enabled: s.enabled, order: s.order })
    return { sections: clone(data.sections), savedAt: new Date().toISOString() }
  }
}
