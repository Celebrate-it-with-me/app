export const TABLE_TYPES = ['vip', 'family', 'friends', 'general']
export const TABLE_LOCATIONS = ['front', 'center', 'back', 'side', 'entrance']
export const RSVP_FILTERS = ['all', 'attending', 'pending', 'not-attending']
/** UiSelect cannot hold an empty-string option, so "no location" travels as this sentinel. */
export const NO_LOCATION = 'none'

export const DEFAULT_PRIORITY = 5

/** Same limits as the API (StoreTableRequest / UpdateTableRequest). */
export const LIMITS = {
  nameMax: 50,
  reservedMax: 100,
  capacityMin: 1,
  capacityMax: 50,
  priorityMin: 1,
  priorityMax: 10
}

export function emptyTableForm() {
  return {
    name: '',
    capacity: '',
    type: 'general',
    priority: DEFAULT_PRIORITY,
    reserved_for: '',
    location: NO_LOCATION
  }
}

export function tableToForm(table) {
  return {
    name: table?.name ?? '',
    capacity: table?.capacity ?? '',
    type: table?.type || 'general',
    priority: Number(table?.priority) || DEFAULT_PRIORITY,
    reserved_for: table?.reserved_for ?? '',
    location: table?.location || NO_LOCATION
  }
}

/** Returns the API payload for a table form. */
export function formToPayload(form) {
  return {
    name: String(form.name ?? '').trim(),
    capacity: parseInt(form.capacity, 10),
    type: form.type,
    priority: Number(form.priority) || DEFAULT_PRIORITY,
    reserved_for: String(form.reserved_for ?? '').trim() || null,
    location: !form.location || form.location === NO_LOCATION ? null : form.location
  }
}

/**
 * Returns an object of error codes (empty when the form is valid), with the same rules as the API:
 * name 1-50, reserved_for up to 100, capacity an integer 1-50, priority an integer 1-10.
 */
export function validateTableForm(form) {
  const errors = {}
  const name = String(form?.name ?? '').trim()
  if (!name) errors.name = 'required'
  else if (name.length > LIMITS.nameMax) errors.name = 'tooLong'

  const raw = form?.capacity
  const capacity = Number(raw)
  if (raw === '' || raw == null || !Number.isInteger(capacity) || capacity < LIMITS.capacityMin) {
    errors.capacity = 'invalid'
  } else if (capacity > LIMITS.capacityMax) {
    errors.capacity = 'tooBig'
  }

  if (!TABLE_TYPES.includes(form?.type)) errors.type = 'invalid'

  const priority = Number(form?.priority)
  if (!Number.isInteger(priority) || priority < LIMITS.priorityMin || priority > LIMITS.priorityMax) {
    errors.priority = 'invalid'
  }

  if (String(form?.reserved_for ?? '').trim().length > LIMITS.reservedMax) errors.reserved_for = 'tooLong'
  return errors
}

/** i18n key suffix for a field error: `name` + `tooLong` -> `nameTooLong`; the common codes use the field name. */
export function errorMessageKey(field, code) {
  if (code === 'required' || code === 'invalid') return field
  return field + code.charAt(0).toUpperCase() + code.slice(1)
}

export function assignedCount(table) {
  if (!table) return 0
  if (Array.isArray(table.assigned_guests)) return table.assigned_guests.length
  const capacity = Number(table.capacity) || 0
  return Math.max(0, capacity - (Number(table.available_seats) || 0))
}

export function seatsLeft(table) {
  return Math.max(0, (Number(table?.capacity) || 0) - assignedCount(table))
}

export function isTableFull(table) {
  return !!table && (Number(table.capacity) || 0) > 0 && assignedCount(table) >= Number(table.capacity)
}

/** Occupancy as an integer percentage between 0 and 100. */
export function occupancyPercent(table) {
  const capacity = Number(table?.capacity) || 0
  if (capacity <= 0) return 0
  return Math.min(100, Math.round((assignedCount(table) / capacity) * 100))
}

/** success when full, warning when almost full, neutral otherwise. */
export function occupancyTone(table) {
  const pct = occupancyPercent(table)
  if (pct >= 100) return 'success'
  if (pct >= 75) return 'warning'
  return 'neutral'
}

export function rsvpTone(status) {
  if (status === 'attending') return 'success'
  if (status === 'not-attending') return 'danger'
  return 'warning'
}

/** Higher priority first, then name. Does not mutate the input. */
export function sortTables(tables) {
  return [...(tables || [])].sort((a, b) => {
    const byPriority = (Number(b.priority) || 0) - (Number(a.priority) || 0)
    if (byPriority !== 0) return byPriority
    return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' })
  })
}

/** Groups sorted tables by type, in TABLE_TYPES order, skipping empty groups. */
export function groupTablesByType(tables) {
  return TABLE_TYPES.map(type => ({
    type,
    tables: sortTables((tables || []).filter(t => (t.type || 'general') === type))
  })).filter(group => group.tables.length > 0)
}

export function filterUnassigned(guests, { search = '', status = 'all' } = {}) {
  const query = String(search).trim().toLowerCase()
  return (guests || []).filter(guest => {
    if (status !== 'all' && guest.rsvpStatus !== status) return false
    if (query && !String(guest.name || '').toLowerCase().includes(query)) return false
    return true
  })
}

export function countByStatus(guests) {
  const counts = { all: 0, attending: 0, pending: 0, 'not-attending': 0 }
  for (const guest of guests || []) {
    counts.all += 1
    if (counts[guest.rsvpStatus] != null) counts[guest.rsvpStatus] += 1
  }
  return counts
}

const MISSING_CODES = ['guest_not_seated', 'guest_not_at_table', 'table_not_in_event', 'guest_not_in_event', 'guest_not_found']

/**
 * Classifies an API error: 'full' | 'already' | 'same' | 'missing' | 'validation' | 'generic'.
 * Accepts the stable `table_full` code (data.code or errors.table) and the legacy `full` marker.
 */
export function errorKind(error) {
  const status = error?.response?.status
  const data = error?.response?.data
  const tableErrors = data?.errors?.table
  if (status === 422) {
    if (data?.code === 'table_full' || tableErrors?.includes?.('table_full') || tableErrors?.includes?.('full')) {
      return 'full'
    }
    if (data?.code === 'guest_already_seated' || /already/i.test(String(data?.message ?? ''))) return 'already'
    if (data?.code === 'same_table') return 'same'
    if (MISSING_CODES.includes(data?.code)) return 'missing'
    return 'validation'
  }
  if (status === 404 || MISSING_CODES.includes(data?.code)) return 'missing'
  return 'generic'
}

/** Looks a guest up by id across several lists. */
export function indexGuests(...lists) {
  const map = new Map()
  for (const list of lists) for (const guest of list || []) if (guest) map.set(guest.id, guest)
  return map
}

/** Name of the guest this one comes with: from the API (`companionOf`) or from `parentId` when the host is known. */
export function companionOfName(guest, index) {
  if (guest?.companionOf?.name) return guest.companionOf.name
  if (guest?.parentId && index?.get(guest.parentId)) return index.get(guest.parentId).name
  return ''
}

/** The guest plus everyone who travels with them (host and companions) among the given pool. */
export function groupOf(guest, pool) {
  if (!guest) return []
  const rootId = guest.companionOf?.id ?? guest.parentId ?? guest.id
  return (pool || []).filter(
    g => g.id === rootId || g.parentId === rootId || g.companionOf?.id === rootId
  )
}

/** Tables sorted for the "seat at..." sheet: the preferred one first, then those with room, fullest last. */
export function tablesForSheet(tables, { need = 1, preferredId = null, excludeId = null } = {}) {
  return sortTables(tables)
    .filter(table => table.id !== excludeId)
    .map(table => ({ table, left: seatsLeft(table), fits: seatsLeft(table) >= need }))
    .sort((a, b) => {
      if (a.table.id === preferredId) return -1
      if (b.table.id === preferredId) return 1
      return Number(b.fits) - Number(a.fits)
    })
}

/** Plain-text summary of names: "Ana, Luis y 2 más". */
export function namesPreview(names, max = 3, more = (n) => `+${n}`) {
  const list = (names || []).filter(Boolean)
  if (list.length <= max) return list.join(', ')
  return `${list.slice(0, max).join(', ')} ${more(list.length - max)}`
}
