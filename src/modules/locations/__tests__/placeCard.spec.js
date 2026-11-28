import { describe, it, expect } from 'vitest'
import { addressLines, fullAddress, mapsUrl, staticMapUrl, imageFor, momentOfType, scheduleOf, groupPlaces } from '../utils/placeCard'

const place = { name: 'Salón Palma', address: '100 Brickell Ave', city: 'Miami', state: 'FL', zipCode: '33131', country: 'US', latitude: 25.76, longitude: -80.19, images: [] }

describe('placeCard helpers', () => {
  it('writes the address in two lines and hides the event country', () => {
    expect(addressLines(place)).toEqual(['100 Brickell Ave', 'Miami, FL 33131'])
    expect(addressLines({ ...place, state: null, zipCode: null })).toEqual(['100 Brickell Ave', 'Miami'])
  })

  it('shows the country only when it differs from the event one', () => {
    expect(addressLines({ ...place, country: 'MX' })[1]).toBe('Miami, FL 33131, MX')
    expect(addressLines({ ...place, country: 'MX' }, 'MX')[1]).toBe('Miami, FL 33131')
    expect(fullAddress(place)).toBe('100 Brickell Ave, Miami, FL 33131')
  })

  it('builds an encoded Maps search with name and address', () => {
    const url = mapsUrl({ ...place, name: 'Salón & Jardín' })
    expect(url).toBe(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Salón & Jardín 100 Brickell Ave, Miami, FL 33131')}`)
    expect(url).not.toContain(' ')
  })

  it('builds a static map only with a key and something to centre on', () => {
    expect(staticMapUrl(place, '')).toBeNull()
    expect(staticMapUrl({ ...place, latitude: null, longitude: null, address: '', city: '', state: '', zipCode: '' }, 'K')).toBeNull()
    const url = new URL(staticMapUrl(place, 'K'))
    expect(url.searchParams.get('center')).toBe('25.76,-80.19')
    expect(url.searchParams.get('key')).toBe('K')
    expect(new URL(staticMapUrl({ ...place, latitude: null }, 'K')).searchParams.get('center')).toBe('100 Brickell Ave, Miami, FL 33131')
  })

  it('picks the image by priority: photo, map, placeholder', () => {
    expect(imageFor({ ...place, images: [{ path: 'a.jpg' }, { path: 'b.jpg' }] }, 'K')).toEqual({ kind: 'photo', src: 'a.jpg' })
    expect(imageFor(place, 'K').kind).toBe('map')
    expect(imageFor(place, 'K', true).kind).toBe('placeholder')
    expect(imageFor(place, '').kind).toBe('placeholder')
  })

  const moments = [
    { type: 'reception', title: 'Recepción', startTime: '2027-03-20 19:00:00', endTime: '2027-03-21 01:00:00' },
    { type: 'ceremony', title: 'Misa', startTime: '2027-03-20 17:00:00', endTime: '2027-03-20 18:00:00' },
    { type: 'ceremony', title: 'Otra', startTime: '2027-03-20 16:00:00', endTime: null }
  ]

  it('takes the schedule from the program by place type', () => {
    expect(momentOfType(moments, 'ceremony').title).toBe('Otra')
    expect(momentOfType([], 'ceremony')).toBeNull()
    expect(scheduleOf({ type: 'reception' }, moments, 'es')).toMatch(/7:00.*1:00/)
    expect(scheduleOf({ type: 'other' }, moments, 'es')).toBe('')
    expect(scheduleOf({ type: 'reception' }, [], 'es')).toBe('')
  })

  it('groups the places in three sections', () => {
    const g = groupPlaces([{ type: 'other' }, { type: 'ceremony' }, { type: 'reception' }, { type: 'weird' }])
    expect([g.ceremony.length, g.reception.length, g.other.length]).toEqual([1, 1, 2])
  })
})
