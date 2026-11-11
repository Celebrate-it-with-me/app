import { describe, it, expect, vi, beforeEach } from 'vitest'

const setOptions = vi.fn()
const importLibrary = vi.fn(async name => ({ name }))
vi.mock('@googlemaps/js-api-loader', () => ({ setOptions, importLibrary }))

describe('loadGoogleLibraries (js-api-loader 2)', () => {
  beforeEach(() => {
    vi.resetModules()
    setOptions.mockClear()
    importLibrary.mockClear()
  })

  it('sets the api key once and imports the requested libraries', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
    const { loadGoogleLibraries } = await import('../googleMaps')

    const libs = await loadGoogleLibraries('maps', 'marker')

    expect(setOptions).toHaveBeenCalledTimes(1)
    expect(setOptions).toHaveBeenCalledWith({ key: 'test-key' })
    expect(importLibrary.mock.calls.map(c => c[0])).toEqual(['maps', 'marker'])
    expect(libs).toEqual([{ name: 'maps' }, { name: 'marker' }])
  })

  it('does not call setOptions again on later calls (it must be set before the first import)', async () => {
    const { loadGoogleLibraries } = await import('../googleMaps')

    await loadGoogleLibraries('maps')
    await loadGoogleLibraries('places')

    expect(setOptions).toHaveBeenCalledTimes(1)
    expect(importLibrary).toHaveBeenCalledTimes(2)
  })
})
