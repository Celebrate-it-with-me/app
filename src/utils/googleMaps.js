import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

let configured = false

/**
 * Loads Google Maps JS API libraries (js-api-loader 2 functional API).
 * The API options are set once, before the first library is imported; after
 * that `google.maps.*` is available as a global, as with the old `Loader`.
 *
 * @param {...string} libraries Library names, e.g. 'maps', 'places', 'marker'
 */
export function loadGoogleLibraries(...libraries) {
  if (!configured) {
    setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY })
    configured = true
  }

  return Promise.all(libraries.map(name => importLibrary(name)))
}
