export const ITEM_TYPES = ['starter', 'main', 'dessert']
export const DIET_TYPES = ['regular', 'vegan', 'vegetarian', 'gluten_free']
/** UiSelect cannot hold an empty value, so "no diet" travels as this sentinel. */
export const NO_DIET = 'none'
export const PER_PAGE_OPTIONS = [5, 10, 20]

/** The list endpoint answers a plain array; tolerate wrapped data and anything unexpected. */
export function normalizeMenus(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

/** Items of one course type; unknown types are ignored. */
export function itemsOfType(menu, type) {
  return (menu?.menu_items ?? []).filter(item => item.type === type)
}

/** Groups a menu's items by course, skipping empty courses. */
export function groupMenuItems(menu) {
  return ITEM_TYPES.map(type => ({ type, items: itemsOfType(menu, type) })).filter(g => g.items.length)
}

/** API payload for POST/PUT menus (note the plural `allowCustomRequests`). */
export function toMenuPayload(form) {
  return {
    title: form.title,
    description: form.description,
    allowMultipleChoices: !!form.allow_multiple_choices,
    allowCustomRequests: !!form.allow_custom_request,
    isDefault: !!form.main_menu
  }
}

/** API payload for POST menu-item; optional fields are left out when empty. */
export function toItemPayload(form) {
  const payload = { name: form.name.trim(), itemType: form.itemType }
  if (form.dietType && form.dietType !== NO_DIET) payload.dietType = form.dietType
  if (form.imagePath?.trim()) payload.imagePath = form.imagePath.trim()
  if (form.notes?.trim()) payload.notes = form.notes.trim()
  return payload
}

/** Returns an i18n key for the first problem, or '' when valid. */
export function menuTitleError(title) {
  return (title ?? '').trim().length < 3 ? 'app.menus.errors.title' : ''
}

export function itemNameError(name) {
  return (name ?? '').trim().length < 2 ? 'app.menus.errors.itemName' : ''
}

/** Flattens a 422 `{errors:{field:[msg]}}` into `{field: msg}` (first message). */
export function fieldErrors(error) {
  const raw = error?.response?.data?.errors
  if (!raw || typeof raw !== 'object') return {}
  return Object.fromEntries(
    Object.entries(raw).map(([field, msgs]) => [field, Array.isArray(msgs) ? msgs[0] : String(msgs)])
  )
}

/** The API answers "N/A" for a course the guest has not chosen. */
export function chosenName(value) {
  return !value || value === 'N/A' ? '' : value
}

export function totalPages(meta) {
  return Math.max(1, Number(meta?.last_page) || 1)
}
