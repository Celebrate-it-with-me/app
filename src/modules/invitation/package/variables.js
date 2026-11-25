/**
 * `{{path|filter}}` marks. The context is a closed list of getters: no expressions, no property
 * walking, no access to anything that is not listed here. Names, types and filters are the ones of
 * the server catalogue (BlockCatalog::VARS / FILTERS); the server is authoritative, this table is
 * the second wall.
 */
import { INTL, formatWallClock } from '../composables/wallClock'

/** Re-exported for the blocks: wall-clock formatting, always timeZone 'UTC' (see wallClock.js). */
export const formatInstant = formatWallClock

/** Engine strings a package may print (everything else must come from the package's own `strings`). */
export const ENGINE_STRINGS = new Set(['invitedFor', 'confirmCta', 'madeWith', 'language'])

/** Date filters. `time` is the hour; `upper_month` is the month in capitals. */
const DATE_FILTERS = {
  long: { dateStyle: 'long' },
  short: { dateStyle: 'short' },
  weekday: { weekday: 'long' },
  weekday_short: { weekday: 'short' },
  day: { day: 'numeric' },
  month: { month: 'long' },
  month_short: { month: 'short' },
  year: { year: 'numeric' },
  upper_month: { month: 'long' },
  time: { timeStyle: 'short' }
}
const TEXT_FILTERS = new Set(['upper', 'lower', 'capitalize'])

export const FILTERS = {
  string: [...TEXT_FILTERS],
  date: Object.keys(DATE_FILTERS),
  int: []
}

const cover = c => c.invitation.sections?.find(s => s.type === 'cover')
const rsvp = c => c.invitation.sections?.find(s => s.type === 'rsvp')?.data

/** @type {Record<string,{ type:'string'|'date'|'int', get:(ctx:object)=>unknown }>} */
const VARS = {
  'event.name': { type: 'string', get: c => c.invitation.event.name },
  'event.description': { type: 'string', get: c => c.invitation.event.description ?? cover(c)?.data?.description },
  'event.date': { type: 'date', get: c => c.invitation.event.startsAt },
  'event.time': { type: 'string', get: c => formatWallClock(c.invitation.event.startsAt, c.locale, DATE_FILTERS.time) },
  'guest.name': { type: 'string', get: c => c.invitation.guest?.name },
  'guest.first_name': { type: 'string', get: c => String(c.invitation.guest?.name ?? '').split(/\s+/)[0] },
  'rsvp.seats': { type: 'int', get: c => (rsvp(c) ? 1 + (rsvp(c).companions?.length ?? 0) : undefined) },
  'rsvp.deadline': { type: 'date', get: c => rsvp(c)?.deadline },
  'section.title': { type: 'string', get: c => c.section.title || c.section.data?.heading },
  'section.text': { type: 'string', get: c => c.section.text || c.section.data?.subHeading },
  'section.position': { type: 'int', get: c => c.position },
  'theme.slug': { type: 'string', get: c => c.invitation.theme?.package?.slug ?? c.invitation.theme?.name },
  'theme.preset': { type: 'string', get: c => c.invitation.theme?.preset }
}

export const VAR_PATHS = new Set(Object.keys(VARS))

function applyText(value, filter, locale) {
  const text = String(value)
  const tag = INTL[locale]
  if (filter === 'upper') return text.toLocaleUpperCase(tag)
  if (filter === 'lower') return text.toLocaleLowerCase(tag)
  if (filter === 'capitalize') return text.charAt(0).toLocaleUpperCase(tag) + text.slice(1)
  return text
}

/**
 * @param {string} path
 * @param {string|null|undefined} filter one filter, as the server allows (`{{event.date|day}}`)
 * @param {{ invitation:object, section:object, position:number, locale:string, tt:Function, strings?:object }} ctx
 * @param {(msg:string)=>void} [warn]
 */
export function resolveVar(path, filter, ctx, warn = () => {}) {
  let value
  let type = 'string'
  if (path.startsWith('t.')) {
    const key = path.slice(2)
    const table = ctx.strings && Object.hasOwn(ctx.strings, ctx.locale) ? ctx.strings[ctx.locale] : undefined
    const own = table && typeof table === 'object' && Object.hasOwn(table, key) && typeof table[key] === 'string' ? table[key] : undefined
    value = own ?? (ENGINE_STRINGS.has(key) ? ctx.tt(key) : undefined)
  } else if (Object.hasOwn(VARS, path)) {
    type = VARS[path].type
    value = VARS[path].get(ctx)
  } else {
    warn(`unknown variable "${path}"`)
    return ''
  }
  if (value === undefined || value === null || value === '') return ''
  const name = typeof filter === 'string' ? filter.trim() : ''
  if (name && !FILTERS[type].includes(name)) {
    warn(`filter "${name.slice(0, 20)}" is not allowed on ${path}`)
  }
  let out
  if (type === 'date') {
    const allowed = name && FILTERS.date.includes(name) ? name : 'long'
    out = formatWallClock(String(value), ctx.locale, DATE_FILTERS[allowed], ctx.invitation.event?.timezone)
    if (allowed === 'upper_month') out = applyText(out, 'upper', ctx.locale)
  } else if (type === 'int') {
    out = String(value)
  } else {
    out = applyText(value, FILTERS.string.includes(name) ? name : '', ctx.locale)
  }
  return out.slice(0, 2000)
}
