export const TABLE_TYPES = ['vip', 'family', 'friends', 'general']
export const TABLE_LOCATIONS = ['front', 'center', 'back', 'side', 'entrance']
export const RSVP_FILTERS = ['all', 'attending', 'pending', 'not-attending']
/** UiSelect cannot hold an empty-string option, so "no location" travels as this sentinel. */
export const NO_LOCATION = 'none'

export const DEFAULT_PRIORITY = 5

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

/** Returns an object of error codes (empty when the form is valid). */
export function validateTableForm(form) {
  const errors = {}
  if (!String(form?.name ?? '').trim()) errors.name = 'required'
  const capacity = Number(form?.capacity)
  if (form?.capacity === '' || form?.capacity == null || !Number.isInteger(capacity) || capacity < 1) {
    errors.capacity = 'invalid'
  }
  if (!TABLE_TYPES.includes(form?.type)) errors.type = 'invalid'
  return errors
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

/** Extracts a human readable code from an API error: 'full' | 'validation' | 'generic'. */
export function errorKind(error) {
  const data = error?.response?.data
  if (error?.response?.status === 422) {
    if (data?.errors?.table?.includes?.('full')) return 'full'
    return 'validation'
  }
  return 'generic'
}
