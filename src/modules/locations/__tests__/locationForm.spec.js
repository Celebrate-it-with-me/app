import { describe, it, expect } from 'vitest'
import { emptyForm, formErrors, formFromLocation, formFromPlace, fileProblem, toPayload, MAX_FILE_BYTES } from '../utils/locationForm'

describe('location form helpers', () => {
  it('asks for name, address, city and country', () => {
    expect(Object.keys(formErrors({ ...emptyForm(), country: '' })).sort()).toEqual(['address', 'city', 'country', 'name'])
    expect(formErrors({ ...emptyForm(), name: 'Salón', address: '1 Main', city: 'Miami' })).toEqual({})
  })

  it('sends empty optional fields as null', () => {
    const payload = toPayload({ ...emptyForm(), name: ' Salón ', address: '1 Main', city: 'Miami' })
    expect(payload).toMatchObject({ type: 'ceremony', name: 'Salón', state: null, zipCode: null, placeId: null, directions: null, country: 'US' })
  })

  it('round-trips a location from the API', () => {
    const form = formFromLocation({ type: 'reception', name: 'Jardín', address: 'x', city: 'y', state: null, zipCode: null, country: 'US', latitude: 1, longitude: 2, placeId: null, directions: null })
    expect(form).toMatchObject({ type: 'reception', state: '', zipCode: '', placeId: '', directions: '' })
  })

  it('reads a Google place into form fields', () => {
    const place = {
      name: 'Salón Jardín',
      place_id: 'ChIJabc',
      address_components: [
        { long_name: '1200', short_name: '1200', types: ['street_number'] },
        { long_name: 'NW 7th Street', short_name: 'NW 7th St', types: ['route'] },
        { long_name: 'Miami', short_name: 'Miami', types: ['locality'] },
        { long_name: 'Florida', short_name: 'FL', types: ['administrative_area_level_1'] },
        { long_name: '33125', short_name: '33125', types: ['postal_code'] },
        { long_name: 'United States', short_name: 'US', types: ['country'] }
      ],
      geometry: { location: { lat: () => 25.7701234567, lng: () => -80.2 } }
    }
    expect(formFromPlace(place)).toEqual({
      name: 'Salón Jardín', address: '1200 NW 7th Street', city: 'Miami', state: 'FL', zipCode: '33125', country: 'US',
      latitude: 25.7701235, longitude: -80.2, placeId: 'ChIJabc'
    })
  })

  it('copes with a place that has no parts', () => {
    expect(formFromPlace({ name: 'X', formatted_address: '5 Elm St, Miami, FL' })).toMatchObject({ address: '5 Elm St', city: '', latitude: null })
  })

  it('rejects files by type and size', () => {
    expect(fileProblem({ type: 'image/gif', size: 1 })).toBe('type')
    expect(fileProblem({ type: 'image/jpeg', size: MAX_FILE_BYTES + 1 })).toBe('size')
    expect(fileProblem({ type: 'image/png', size: 1 })).toBeNull()
  })
})
