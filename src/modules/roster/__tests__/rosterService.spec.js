import { describe, it, expect, vi, beforeEach } from 'vitest'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))
import RosterService from '../services/RosterService'

beforeEach(() => {
  Object.values(api).forEach(fn => fn.mockReset())
})
describe('RosterService', () => {
  it('lists with defaults, leaving out the "all" tab, empty search and no delivery', async () => {
    api.get.mockResolvedValue({ data: { data: [], meta: {} } })
    const result = await RosterService.list(7)
    expect(api.get).toHaveBeenCalledWith('/event/7/roster', { params: { page: 1, perPage: 15 } })
    expect(result).toEqual({ data: [], meta: {} })
    await RosterService.list(7, { status: 'all' })
    expect(api.get).toHaveBeenLastCalledWith('/event/7/roster', { params: { page: 1, perPage: 15 } })
  })

  it('sends the tab, search, delivery and paging when given', async () => {
    api.get.mockResolvedValue({ data: {} })
    await RosterService.list(7, { status: 'pending', search: 'ana', delivery: 'unsent', page: 3, perPage: 50 })
    expect(api.get).toHaveBeenCalledWith('/event/7/roster', { params: { page: 3, perPage: 50, status: 'pending', search: 'ana', delivery: 'unsent' } })
  })

  it('updates, removes and adds companions, answering the data of the API', async () => {
    api.put.mockResolvedValue({ data: { data: { id: 2 } } })
    api.delete.mockResolvedValue({ data: { data: { ok: true } } })
    api.post.mockResolvedValue({ data: { data: { id: 3 } } })
    expect(await RosterService.update(7, 2, { name: 'A' })).toEqual({ id: 2 })
    expect(api.put).toHaveBeenCalledWith('/event/7/roster/2', { name: 'A' })
    expect(await RosterService.remove(7, 2)).toEqual({ ok: true })
    expect(api.delete).toHaveBeenCalledWith('/event/7/roster/2')
    expect(await RosterService.addCompanion(7, 2, { name: 'B' })).toEqual({ id: 3 })
    expect(api.post).toHaveBeenCalledWith('/event/7/roster/2/companions', { name: 'B' })
  })

  it('creates a main guest with named companions and no unnamed ones', async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1 } } })
    await RosterService.create(7, { guest: { name: 'A' }, companions: [{ name: 'B' }] })
    expect(api.post).toHaveBeenCalledWith('/event/7/guests', { guest: { name: 'A' }, namedCompanions: [{ name: 'B' }], unnamedCompanions: 0 })
  })

  it('confirms for the family, mapping each companion to the API shape', async () => {
    api.put.mockResolvedValue({ data: { ok: 1 } })
    const out = await RosterService.confirm(7, 4, { status: 'attending', companions: [{ id: 5, status: 'not-attending' }] })
    expect(out).toEqual({ ok: 1 })
    expect(api.put).toHaveBeenCalledWith('/event/7/organizer/rsvp/4/confirm', {
      guest: { rsvp_status: 'attending' },
      companions: [{ id: 5, rsvp_status: 'not-attending' }]
    })
  })

  it('reads the CSV template, previews a file as multipart and saves the rows', async () => {
    const blob = new Blob(['x'])
    api.get.mockResolvedValue({ data: blob })
    expect(await RosterService.importTemplate(7)).toBe(blob)
    expect(api.get).toHaveBeenCalledWith('/event/7/roster/import/template', { responseType: 'blob' })

    api.post.mockResolvedValue({ data: { data: { rows: [] } } })
    const file = new File(['a'], 'g.csv')
    expect(await RosterService.importPreview(7, file)).toEqual({ rows: [] })
    const [url, form, config] = api.post.mock.calls[0]
    expect(url).toBe('/event/7/roster/import/preview')
    expect(form.get('file')).toBeInstanceOf(File)
    expect(config.headers['Content-Type']).toBe('multipart/form-data')

    api.post.mockResolvedValue({ data: { data: { created: 2 } } })
    expect(await RosterService.importGuests(7, [{ name: 'A' }])).toEqual({ created: 2 })
    expect(api.post).toHaveBeenLastCalledWith('/event/7/roster/import', { rows: [{ name: 'A' }] })
  })

  it('downloads the list with the server file name, or a fallback', async () => {
    api.get.mockResolvedValue({ data: 'B', headers: { 'content-disposition': 'attachment; filename="lista final.xlsx"' } })
    expect(await RosterService.download(7, { status: 'pending', search: 'x', locale: 'es' })).toEqual({ blob: 'B', filename: 'lista final.xlsx' })
    expect(api.get).toHaveBeenCalledWith('/event/7/roster/export', { params: { locale: 'es', status: 'pending', search: 'x' }, responseType: 'blob' })

    api.get.mockResolvedValue({ data: 'B' })
    expect((await RosterService.download(7)).filename).toBe('invitados.xlsx')
    expect(api.get).toHaveBeenLastCalledWith('/event/7/roster/export', { params: { locale: undefined }, responseType: 'blob' })
    api.get.mockResolvedValue({ data: 'B', headers: { 'content-disposition': 'attachment; filename=plain.xlsx' } })
    expect((await RosterService.download(7, { status: 'all' })).filename).toBe('plain.xlsx')
  })

  it('downloads the venue list for confirmed people by default', async () => {
    api.get.mockResolvedValue({ data: 'V', headers: {} })
    expect(await RosterService.downloadVenue(7, { locale: 'en' })).toEqual({ blob: 'V', filename: 'salon.xlsx' })
    expect(api.get).toHaveBeenCalledWith('/event/7/roster/export/venue', { params: { scope: 'attending', locale: 'en' }, responseType: 'blob' })
    await RosterService.downloadVenue(7)
    expect(api.get).toHaveBeenLastCalledWith('/event/7/roster/export/venue', { params: { scope: 'attending', locale: undefined }, responseType: 'blob' })
  })

  it('sets the locale of a family (null follows the event) and reverts a confirmation', async () => {
    api.patch.mockResolvedValue({ data: { data: { locale: null } } })
    expect(await RosterService.setLocale(7, 2, null)).toEqual({ locale: null })
    expect(api.patch).toHaveBeenCalledWith('/event/7/roster/2/locale', { locale: null })
    api.post.mockResolvedValue({})
    expect(await RosterService.revert(7, 2)).toBeUndefined()
    expect(api.post).toHaveBeenCalledWith('/event/7/rsvp/guests/2/revert-confirmation')
  })

  it('lets API errors reach the caller', async () => {
    api.put.mockRejectedValue(new Error('403'))
    await expect(RosterService.update(7, 2, {})).rejects.toThrow('403')
  })
})
