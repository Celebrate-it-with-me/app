export const TYPES = ['ceremony', 'reception', 'other']
export const MAX_IMAGES = 6
export const MAX_FILE_BYTES = 2 * 1024 * 1024
export const FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const emptyForm = () => ({
  type: 'ceremony',
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  latitude: null,
  longitude: null,
  placeId: '',
  directions: ''
})

export function formFromLocation(location) {
  return {
    type: location.type,
    name: location.name,
    address: location.address,
    city: location.city,
    state: location.state ?? '',
    zipCode: location.zipCode ?? '',
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    placeId: location.placeId ?? '',
    directions: location.directions ?? ''
  }
}

/** What the API takes: empty strings become null. */
export function toPayload(form) {
  const orNull = value => (value === '' || value === undefined ? null : value)
  return {
    type: form.type,
    name: form.name.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    state: orNull(form.state.trim()),
    zipCode: orNull(form.zipCode.trim()),
    country: form.country.trim(),
    latitude: form.latitude,
    longitude: form.longitude,
    placeId: orNull(form.placeId),
    directions: orNull(form.directions.trim())
  }
}

/** Why a form cannot be sent, as { field: i18n key }. */
export function formErrors(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'app.locations.errors.name'
  if (!form.address.trim()) errors.address = 'app.locations.errors.address'
  if (!form.city.trim()) errors.city = 'app.locations.errors.city'
  if (!form.country.trim()) errors.country = 'app.locations.errors.country'
  return errors
}

/**
 * A Google place (`address_components`, `geometry`, `name`, `place_id`) as form fields.
 * Works with the legacy PlaceResult; address parts that Google does not send stay empty.
 */
export function formFromPlace(place) {
  const part = (type, key = 'long_name') => place.address_components?.find(c => c.types.includes(type))?.[key] ?? ''
  const street = [part('street_number'), part('route')].filter(Boolean).join(' ')
  const location = place.geometry?.location
  const read = value => (typeof value === 'function' ? value() : value)

  return {
    name: place.name ?? '',
    address: street || (place.formatted_address ?? '').split(',')[0] || '',
    city: part('locality') || part('sublocality') || part('postal_town') || part('administrative_area_level_2'),
    state: part('administrative_area_level_1', 'short_name'),
    zipCode: part('postal_code'),
    country: part('country', 'short_name'),
    latitude: location ? Number(read(location.lat).toFixed?.(7) ?? read(location.lat)) : null,
    longitude: location ? Number(read(location.lng).toFixed?.(7) ?? read(location.lng)) : null,
    placeId: place.place_id ?? ''
  }
}

/** Why a file cannot be added, or null. */
export function fileProblem(file) {
  if (!FILE_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_FILE_BYTES) return 'size'
  return null
}
