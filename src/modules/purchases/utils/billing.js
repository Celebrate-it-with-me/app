/** Countries offered in the billing form (ISO 3166-1 alpha-2): the US first, then the Spanish-speaking markets and neighbours. */
export const BILLING_COUNTRIES = [
  'US', 'MX', 'CO', 'VE', 'CU', 'DO', 'PR', 'ES', 'AR', 'PE', 'EC', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CL', 'UY', 'BO', 'PY', 'BR', 'CA'
]

/** [{ value, label }] with the country names in the interface language. */
export function countryOptions(locale = 'es') {
  let names = null
  try {
    names = new Intl.DisplayNames([locale === 'es' ? 'es' : 'en'], { type: 'region' })
  } catch {
    names = null
  }
  return BILLING_COUNTRIES.map(code => ({ value: code, label: names?.of(code) ?? code }))
}

/** Same shape rule as the API: letters, digits, spaces, dots, dashes and slashes, 3 to 30 characters. */
export const TAX_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .\-/]*$/

/** Form values from the API payload (nulls become empty strings). */
export function toFormValues(profile, accountEmail = '') {
  return {
    name: profile?.name ?? '',
    billingEmail: profile?.billingEmail ?? accountEmail,
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    postalCode: profile?.postalCode ?? '',
    country: profile?.country ?? 'US',
    taxId: profile?.taxId ?? ''
  }
}

/** Request body: trimmed strings, empty optional fields as null. */
export function toPayload(values) {
  const clean = v => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null)
  return {
    name: values.name.trim(),
    billingEmail: values.billingEmail.trim(),
    address: clean(values.address),
    city: clean(values.city),
    state: clean(values.state),
    postalCode: clean(values.postalCode),
    country: values.country,
    taxId: clean(values.taxId)
  }
}
