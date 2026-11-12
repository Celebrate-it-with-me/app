import { Church, GlassWater, Music2, PartyPopper, Sparkles, Utensils, Wine } from 'lucide-vue-next'

/** Kinds of moment, in the order the select shows them. The icon follows the kind. */
export const MOMENT_TYPES = [
  { value: 'ceremony', icon: Church },
  { value: 'reception', icon: GlassWater },
  { value: 'waltz', icon: Sparkles },
  { value: 'dinner', icon: Utensils },
  { value: 'dance', icon: Music2 },
  { value: 'toast', icon: Wine },
  { value: 'other', icon: PartyPopper }
]

export const iconFor = type => (MOMENT_TYPES.find(t => t.value === type) ?? MOMENT_TYPES.at(-1)).icon

const pad = n => String(n).padStart(2, '0')

/** `m/d/Y H:i` (as the events API sends it) to a Date, or null. */
export function parseEventDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(value ?? '')
  return match ? new Date(+match[3], +match[1] - 1, +match[2], +match[4], +match[5]) : null
}

/** `Y-m-d H:i:s` (local, no zone) to a Date. */
export const parseMoment = value => {
  const [d, t = '00:00:00'] = String(value).split(' ')
  const [y, mo, da] = d.split('-').map(Number)
  const [h, mi] = t.split(':').map(Number)
  return new Date(y, mo - 1, da, h, mi)
}

const toApi = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`

/** `HH:mm` of a moment's time. */
export const timeOf = value => {
  const date = parseMoment(value)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const emptyMoment = () => ({ title: '', type: 'other', startTime: '', endTime: '', description: '' })

export function formFromMoment(moment) {
  return {
    title: moment.title,
    type: moment.type,
    startTime: timeOf(moment.startTime),
    endTime: moment.endTime ? timeOf(moment.endTime) : '',
    description: moment.description ?? ''
  }
}

/**
 * The organizer only types times; the dates come from the event. A time earlier than three hours before
 * the event starts belongs to the next day (the party that ends after midnight).
 */
export function buildPayload(form, eventStart) {
  const anchor = eventStart ?? new Date()
  const at = time => {
    const [h, m] = time.split(':').map(Number)
    const date = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), h, m)
    if (date < new Date(anchor.getTime() - 3 * 3600 * 1000)) date.setDate(date.getDate() + 1)
    return date
  }
  const start = at(form.startTime)
  let end = form.endTime ? at(form.endTime) : null
  if (end && end <= start) end = new Date(end.getTime() + 24 * 3600 * 1000)

  return {
    title: form.title.trim(),
    type: form.type,
    description: form.description.trim() || null,
    startTime: toApi(start),
    endTime: end ? toApi(end) : null
  }
}

/** Why a form cannot be sent, as { field: i18n key }. */
export function momentErrors(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'app.timeline.errors.title'
  if (!/^\d{2}:\d{2}$/.test(form.startTime)) errors.startTime = 'app.timeline.errors.startTime'
  return errors
}
