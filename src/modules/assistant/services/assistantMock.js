/**
 * In-memory stand-in for the assistant endpoints, active when `VITE_ASSISTANT_MOCK` is set. It follows the contract
 * (docs/plans/assistant-contract.md). Values of the variable (or of `localStorage['cwm.assistantMock']`, which wins):
 *   1 / normal   normal mode, a handful of tasks across phases (one overdue, one locked by plan, one done by data)
 *   compressed   same, mode `compressed`
 *   past         `event_past`, only the "after" phase
 *   nodate       `no_date`, no steps and no phases
 *   unsupported  `unsupported`
 *   allset       everything done, `allSet: true`
 *   error        every read fails (network error)
 *   writefail    writes answer 500
 *   limit        creating a custom task answers 409 `custom_task_limit`
 */
const overrides = new Map()
let custom = [
  { id: 1, title: 'Cotizar mariachi', notes: 'Pedir dos presupuestos.', dueDate: '2027-03-01', doneAt: null, createdAt: '2026-11-15T14:00:00Z' }
]
let nextId = 2

function mode() {
  try {
    return localStorage.getItem('cwm.assistantMock') || String(import.meta.env.VITE_ASSISTANT_MOCK)
  } catch {
    return String(import.meta.env.VITE_ASSISTANT_MOCK)
  }
}

const wait = ms => new Promise(r => setTimeout(r, ms))
function fail(status, data) {
  const error = new Error(`mock ${status}`)
  error.response = { status, data }
  return error
}
const t = (lang, es, en) => (lang === 'en' ? en : es)

const LABELS = {
  foundation: ['Primeros pasos', 'First steps'],
  planning: ['Reservas', 'Bookings'],
  details: ['Detalles', 'Details'],
  invitations: ['Invitaciones', 'Invitations'],
  final: ['Recta final', 'Final stretch'],
  after: ['Después', 'Afterwards']
}

function catalog(lang) {
  const task = (key, phase, es, en, state, extra = {}) => ({
    key, phase, title: t(lang, es, en), state,
    reason: state === 'done' ? '' : t(lang, 'Faltan 11 meses y este es el momento ideal. De aquí salen otras 4 cosas.', '11 months to go, and now is the ideal time. 4 other things depend on this.'),
    reasonCode: 'time_window', reasonParams: { months: 11, unlocks: 4 },
    route: '/dashboard/budget', moduleKey: 'budget', moduleLocked: false, doneBy: null, blockedBy: [], snoozedUntil: null,
    startMonths: 12, lateMonths: 8, ...extra
  })
  return [
    task('budget_cap', 'foundation', 'Define tu tope de presupuesto', 'Set your budget cap', 'done', { doneBy: 'data' }),
    task('book_venue', 'foundation', 'Reserva el salón', 'Book the venue', 'next'),
    task('guest_list', 'foundation', 'Arma tu lista de invitados', 'Build your guest list', 'overdue', {
      route: '/dashboard/guests', moduleKey: 'guests', reasonCode: 'overdue',
      reason: t(lang, 'Ya pasó el mejor momento (6 meses antes); mejor hoy que mañana.', 'The ideal time has passed (6 months out); better today than tomorrow.')
    }),
    task('add_locations', 'foundation', 'Agrega las ubicaciones', 'Add the locations', 'upcoming', { route: '/dashboard/locations', moduleKey: 'locations', blockedBy: ['book_venue'] }),
    task('book_photo_video', 'planning', 'Contrata foto y video', 'Book photo and video', 'available', { blockedBy: [] }),
    task('program', 'details', 'Arma el programa del día', 'Build the day\'s program', 'upcoming', { route: '/dashboard/program', moduleKey: 'timeline' }),
    task('publish_invitation', 'invitations', 'Publica tu invitación', 'Publish your invitation', 'upcoming', { route: '@edit-event', moduleKey: null, snoozedUntil: null }),
    task('seating_chart', 'final', 'Organiza las mesas', 'Plan the seating', 'upcoming', { route: '/dashboard/seating', moduleKey: 'seating', moduleLocked: true, reason: '' }),
    task('thank_guests', 'after', 'Agradece a tus invitados', 'Thank your guests', 'upcoming', { route: '/dashboard/guests', moduleKey: 'guests' })
  ]
}

function evaluate(lang) {
  const m = mode()
  const all = catalog(lang).map(base => {
    const o = overrides.get(base.key)
    if (m === 'allset') return { ...base, state: 'done', doneBy: 'user' }
    if (!o) return base
    if (o.kind === 'done') return { ...base, state: 'done', doneBy: 'user', reason: '' }
    if (o.kind === 'snooze') return { ...base, state: 'upcoming', snoozedUntil: o.until }
    return { ...base, state: o.kind === 'hide' ? 'hidden' : 'not_applicable' }
  })
  return m === 'past' ? all.filter(x => x.phase === 'after') : all
}

function build(lang) {
  const m = mode()
  if (m === 'error') throw new Error('Network Error')
  const modeName = { compressed: 'compressed', nodate: 'no_date', unsupported: 'unsupported', past: 'event_past' }[m] ?? 'normal'
  const meta = { mode: modeName, monthsLeft: 11.2, daysLeft: 340 }
  if (meta.mode === 'no_date' || meta.mode === 'unsupported') return { meta: { ...meta, monthsLeft: null, daysLeft: null }, tasks: [] }
  return { meta, tasks: evaluate(lang) }
}

function progress(tasks) {
  const counted = tasks.filter(x => !['hidden', 'not_applicable'].includes(x.state) && !x.moduleLocked)
  const done = counted.filter(x => x.state === 'done').length
  return { done, total: counted.length, ratio: counted.length ? +(done / counted.length).toFixed(2) : 0 }
}

export const mockAssistant = {
  async next(lang) {
    await wait(150)
    const { meta, tasks } = build(lang)
    const steps = tasks.filter(x => ['next', 'overdue'].includes(x.state) && !x.moduleLocked).slice(0, 3)
    const p = progress(tasks)
    return { ...meta, steps, allSet: !steps.length && p.done > 0 && meta.mode !== 'no_date', progress: p }
  },

  async plan(lang) {
    await wait(200)
    const { meta, tasks } = build(lang)
    const visible = tasks.filter(x => !['hidden', 'not_applicable'].includes(x.state))
    const phases = Object.keys(LABELS)
      .map(key => ({
        key,
        label: t(lang, LABELS[key][0], LABELS[key][1]),
        tasks: [...visible.filter(x => x.phase === key && x.state !== 'done'), ...visible.filter(x => x.phase === key && x.state === 'done')]
      }))
      .filter(p => p.tasks.length)
    return {
      ...meta,
      progress: progress(tasks),
      phases,
      overdue: visible.filter(x => x.state === 'overdue'),
      hidden: tasks.filter(x => ['hidden', 'not_applicable'].includes(x.state)),
      custom: meta.mode === 'unsupported' ? [] : custom
    }
  },

  async act(key, action, body, lang) {
    await wait(180)
    if (mode() === 'writefail') throw fail(500, { message: 'Server error.' })
    const base = catalog(lang).find(x => x.key === key)
    if (!base) throw fail(404, { message: 'Not found.', code: 'task_not_found' })
    if (action === 'reset') overrides.delete(key)
    else if (action === 'snooze') {
      const days = body?.days ?? 14
      if (!Number.isInteger(days) || days < 1 || days > 90) throw fail(422, { message: 'Invalid.', errors: { days: ['invalid_days'] } })
      overrides.set(key, { kind: 'snooze', until: new Date(Date.now() + days * 86_400_000).toISOString() })
    } else overrides.set(key, { kind: { done: 'done', hide: 'hide', 'not-applicable': 'na' }[action] })
    return evaluate(lang).find(x => x.key === key) ?? base
  },

  async createCustom(body) {
    await wait(180)
    if (mode() === 'writefail') throw fail(500, { message: 'Server error.' })
    if (mode() === 'limit') throw fail(409, { message: 'Limit.', code: 'custom_task_limit' })
    const title = String(body?.title ?? '').trim()
    if (!title) throw fail(422, { message: 'Invalid.', errors: { title: ['required'] } })
    const item = { id: nextId++, title, notes: body?.notes?.trim() || null, dueDate: body?.due_date || null, doneAt: null, createdAt: new Date().toISOString() }
    custom = [...custom, item]
    return item
  },

  async updateCustom(id, body) {
    await wait(150)
    if (mode() === 'writefail') throw fail(500, { message: 'Server error.' })
    const item = custom.find(x => x.id === id)
    if (!item) throw fail(404, { message: 'Not found.', code: 'custom_task_not_found' })
    const next = { ...item }
    if ('title' in body) next.title = String(body.title).trim()
    if ('notes' in body) next.notes = body.notes?.trim() || null
    if ('due_date' in body) next.dueDate = body.due_date || null
    if ('done' in body) next.doneAt = body.done ? new Date().toISOString() : null
    custom = custom.map(x => (x.id === id ? next : x))
    return next
  },

  async removeCustom(id) {
    await wait(120)
    if (mode() === 'writefail') throw fail(500, { message: 'Server error.' })
    if (!custom.some(x => x.id === id)) throw fail(404, { message: 'Not found.', code: 'custom_task_not_found' })
    custom = custom.filter(x => x.id !== id)
  }
}
