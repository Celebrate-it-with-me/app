/** Tabs of the screen, in order. `value` is what the API takes as `status` ('all' sends none). */
export const TABS = [
  { value: 'all', count: 'all' },
  { value: 'attending', count: 'attending' },
  { value: 'pending', count: 'pending' },
  { value: 'not-attending', count: 'notAttending' }
]

export const STATUS_TONE = { attending: 'success', pending: 'warning', 'not-attending': 'neutral' }

export const emptyPerson = () => ({ name: '', email: '', phone: '', notes: '' })

/** What the API takes for a guest: empty strings become null. */
export function personPayload(person) {
  const orNull = value => (value && String(value).trim() ? String(value).trim() : null)
  return { name: person.name.trim(), email: orNull(person.email), phone: orNull(person.phone), notes: orNull(person.notes) }
}

export function personErrors(person) {
  const errors = {}
  if (!person.name.trim()) errors.name = 'app.roster.errors.name'
  if (person.email && !/^\S+@\S+\.\S+$/.test(person.email.trim())) errors.email = 'app.roster.errors.email'
  if (person.phone && !/^\+?[0-9][0-9 ().-]{5,19}$/.test(person.phone.trim())) errors.phone = 'app.roster.errors.phone'
  return errors
}

/** People in a family: the main guest plus companions. */
export const peopleIn = family => 1 + (family.companions?.length ?? 0)

/** `+1 (305) 555-0101` → `13055550101`, the form wa.me wants; null when there are too few digits. */
export function whatsappNumber(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  return digits.length >= 8 ? digits : null
}

/** A WhatsApp link with the invitation text; with no phone it opens the contact picker. */
export function whatsappUrl(phone, text) {
  const number = whatsappNumber(phone)
  return `https://wa.me/${number ?? ''}?text=${encodeURIComponent(text)}`
}

/** Counters of the tabs, with a safe default before the first answer. */
export const noCounts = () => ({ all: 0, attending: 0, pending: 0, notAttending: 0, families: 0, limit: null })

/** Languages an invitation can be in. `null` (the guest has none of her own) follows the event. */
export const INVITATION_LOCALES = ['es', 'en']

/** The language a family's invitation shows: her own, or the event's (Spanish when the event has none). */
export const effectiveLocale = (family, eventLocale) => family.locale || eventLocale || 'es'

/** Saves a Blob as a file the browser downloads. */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** One grid for the table's header, rows and companion rows, so the columns line up (Invitado, Asistencia, Envío, Personas, acciones). */
export const GUEST_GRID = 'grid grid-cols-[minmax(0,1fr)_130px_130px_80px_48px] items-center gap-x-4 pl-4 lg:pr-4 fab-safe'

/** The select/radio value of a guest's language: the string 'event' stands for "follow the event" (null in the API). */
export const localeValue = family => family.locale || 'event'
export const localeFromValue = value => (value === 'event' ? null : value)

/** The three choices of the invitation language, as `{ value, label }`. */
export const localeOptions = (t, eventLocale) => [
  { value: 'event', label: t('app.roster.locale.event', { lang: t(`app.roster.locale.${eventLocale || 'es'}`) }) },
  { value: 'es', label: t('app.roster.locale.es') },
  { value: 'en', label: t('app.roster.locale.en') }
]

/**
 * The actions of a guest's "⋯" menu, in order, as `{ key, label, icon?, disabled?, danger?, separator? }`. Both the desktop
 * menu and the phone sheet are built from this list; `key` is what the screen reacts to.
 */
export function guestMenuEntries(family, { canEdit, t }) {
  const answered = family.status !== 'pending' || family.companions.some(c => c.status !== 'pending')
  const list = []
  if (canEdit) {
    list.push({ key: 'edit', label: t('app.roster.menu.edit') }, { key: 'locale', label: t('app.roster.locale.label') })
  }
  list.push({ key: 'send', label: t('app.roster.menu.send'), disabled: !family.link }, { key: 'copy', label: t('app.roster.menu.copy'), disabled: !family.link })
  if (canEdit) {
    list.push({ key: 'confirm', label: t('app.roster.menu.confirm') })
    if (answered) list.push({ key: 'revert', label: t('app.roster.menu.revert') })
    list.push({ key: 'remove', label: t('app.roster.menu.remove'), danger: true, separator: true })
  }
  return list
}
