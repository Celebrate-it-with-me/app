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
