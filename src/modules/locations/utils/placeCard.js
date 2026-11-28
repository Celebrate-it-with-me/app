import { minutesOf, rangeLabel } from '@/modules/timeline/utils/timeMath'

/** The country of every event for now: events carry none, and the product starts in the US. */
export const EVENT_COUNTRY = 'US'

/** The two lines of an address: the street, then "City, ST 12345" (plus the country only when it is not the event's). */
export function addressLines(place, eventCountry = EVENT_COUNTRY) {
  const region = [place.state, place.zipCode].filter(Boolean).join(' ')
  const line2 = [place.city, region].filter(Boolean).join(', ')
  const foreign = place.country && eventCountry && place.country.toUpperCase() !== eventCountry.toUpperCase()
  return [place.address ?? '', foreign ? [line2, place.country].filter(Boolean).join(', ') : line2]
}

/** The address in one line, as it is copied. */
export const fullAddress = (place, eventCountry) => addressLines(place, eventCountry).filter(Boolean).join(', ')

/** Google Maps search for the place: name and address, encoded. */
export const mapsUrl = (place, eventCountry) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${fullAddress(place, eventCountry)}`.trim())}`

/** Google Static Maps image of the place, or null without a key or without something to centre on. */
export function staticMapUrl(place, key) {
  if (!key) return null
  const center = place.latitude != null && place.longitude != null ? `${place.latitude},${place.longitude}` : fullAddress(place)
  if (!center) return null
  const params = new URLSearchParams({ center, zoom: '15', size: '360x300', scale: '2', markers: `color:0x9f1239|${center}`, key })
  return `https://maps.googleapis.com/maps/api/staticmap?${params}`
}

/** What fills the picture of a card, by priority: first uploaded photo, static map, CSS placeholder. */
export function imageFor(place, key, mapFailed = false) {
  const photo = place.images?.[0]?.path
  if (photo) return { kind: 'photo', src: photo }
  const map = mapFailed ? null : staticMapUrl(place, key)
  if (map) return { kind: 'map', src: map }
  return { kind: 'placeholder', src: null }
}

/** The earliest moment of the program of a kind (ceremony, reception), or null. */
export function momentOfType(moments, type) {
  return (
    (moments ?? [])
      .filter(moment => moment.type === type)
      .sort((a, b) => (minutesOf(a.startTime) ?? 0) - (minutesOf(b.startTime) ?? 0))[0] ?? null
  )
}

/** "7:00 p.m. – 1:00 a.m." for a place of a kind that the program has a moment for; '' otherwise. */
export function scheduleOf(place, moments, locale) {
  if (place.type === 'other') return ''
  const moment = momentOfType(moments, place.type)
  return moment ? rangeLabel(moment, locale).range : ''
}

/** The three sections of the page, each with the places of its type. */
export function groupPlaces(places) {
  return {
    ceremony: places.filter(p => p.type === 'ceremony'),
    reception: places.filter(p => p.type === 'reception'),
    other: places.filter(p => p.type !== 'ceremony' && p.type !== 'reception')
  }
}
