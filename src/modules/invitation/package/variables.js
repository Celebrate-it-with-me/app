/**
 * `{{path|filter}}` marks. The context is a closed list of getters: no expressions, no property
 * walking, no access to anything that is not listed here.
 */
const INTL = { es: 'es-US', en: 'en-US' }

/** Engine strings a package may print (everything else must come from the package's own `strings`). */
const ENGINE_STRINGS = new Set(['invitedFor', 'confirmCta', 'madeWith', 'language'])

const HAS_OFFSET = /(?:[zZ]|[+-]\d\d:?\d\d)$/

/**
 * The API sends wall-clock times of the event without offset. Read them as UTC and format with
 * timeZone 'UTC' so the browser's own zone (and DST) can never shift them. With an offset the
 * event's IANA zone is used.
 */
export function formatInstant(iso, locale, options, timezone) {
  if (typeof iso !== 'string' || !iso) return ''
  const withOffset = HAS_OFFSET.test(iso)
  const date = new Date(withOffset ? iso : `${iso.replace(' ', 'T')}Z`)
  if (Number.isNaN(date.getTime())) return ''
  let timeZone = 'UTC'
  if (withOffset && timezone) {
    try {
      new Intl.DateTimeFormat('en', { timeZone: timezone })
      timeZone = timezone
    } catch {
      timeZone = 'UTC'
    }
  }
  return new Intl.DateTimeFormat(INTL[locale] ?? 'es-US', { ...options, timeZone }).format(date)
}

const DATE_PARTS = {
  date: { dateStyle: 'long' },
  'date.weekday': { weekday: 'long' },
  'date.weekdayShort': { weekday: 'short' },
  'date.day': { day: 'numeric' },
  'date.month': { month: 'long' },
  'date.monthShort': { month: 'short' },
  'date.year': { year: 'numeric' },
  time: { timeStyle: 'short' }
}

export const FILTERS = new Set([...Object.keys(DATE_PARTS), 'upper', 'lower'])

/** @returns {Record<string,(ctx:object)=>unknown>} */
const GETTERS = {
  'event.name': c => c.invitation.event.name,
  'event.date': c => c.invitation.event.startsAt,
  'event.startsAt': c => c.invitation.event.startsAt,
  'event.timezone': c => c.invitation.event.timezone,
  'event.type': c => c.invitation.event.typeSlug,
  'section.title': c => c.section.title,
  'section.text': c => c.section.text,
  'section.position': c => c.position,
  'section.count': c => c.count,
  'section.image': c => c.section.data?.image,
  'section.eventName': c => c.section.data?.eventName,
  'section.description': c => c.section.data?.description,
  'guest.name': c => c.invitation.guest?.name,
  'guest.firstName': c => String(c.invitation.guest?.name ?? '').split(/\s+/)[0],
  'theme.name': c => c.invitation.theme?.name,
  'theme.preset': c => c.invitation.theme?.preset
}

export const VAR_PATHS = new Set([...Object.keys(GETTERS)])

/**
 * @param {string} path
 * @param {string|string[]|undefined} filter  'date.month|upper' or ['date.month','upper']
 * @param {{ invitation:object, section:object, position:number, count:number, locale:string, tt:Function, strings?:object }} ctx
 * @param {(msg:string)=>void} [warn]
 */
export function resolveVar(path, filter, ctx, warn = () => {}) {
  let value
  if (path.startsWith('t.')) {
    const key = path.slice(2)
    value = ctx.strings?.[ctx.locale]?.[key] ?? (ENGINE_STRINGS.has(key) ? ctx.tt(key) : undefined)
  } else if (Object.hasOwn(GETTERS, path)) {
    value = GETTERS[path](ctx)
  } else {
    warn(`unknown variable "${path}"`)
    return ''
  }
  if (value === undefined || value === null) return ''
  const filters = (Array.isArray(filter) ? filter : String(filter ?? '').split('|')).map(s => s.trim()).filter(Boolean).slice(0, 3)
  let out = value
  for (const name of filters) {
    if (!FILTERS.has(name)) {
      warn(`unknown filter "${name}"`)
      continue
    }
    if (name === 'upper') out = String(out).toLocaleUpperCase(INTL[ctx.locale])
    else if (name === 'lower') out = String(out).toLocaleLowerCase(INTL[ctx.locale])
    else out = formatInstant(String(out), ctx.locale, DATE_PARTS[name], ctx.invitation.event?.timezone)
  }
  return String(out).slice(0, 2000)
}
