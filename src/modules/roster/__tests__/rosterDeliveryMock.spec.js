import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const api = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))

const families = Array.from({ length: 21 }, (_, i) => ({
  id: i + 1, name: `Familia ${i + 1}`, phone: i + 1 === 4 ? null : '+1305555' + String(1000 + i), email: null, status: i % 2 ? 'pending' : 'attending', effectiveLocale: 'es', companions: []
}))

function serve(_url, { params }) {
  let list = families
  if (params.status) list = list.filter(f => f.status === params.status)
  const perPage = params.perPage
  const slice = list.slice((params.page - 1) * perPage, params.page * perPage)
  return Promise.resolve({ data: { data: slice, meta: { currentPage: params.page, lastPage: Math.ceil(list.length / perPage), total: list.length }, counts: { all: families.length } } })
}

let mock
let RosterService

async function load(value) {
  vi.stubEnv('VITE_WHATSAPP_MOCK', value)
  vi.resetModules()
  api.get.mockImplementation(serve)
  mock = await import('../services/whatsappMock')
  RosterService = (await import('../services/RosterService')).default
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllEnvs())

describe('mock roster with delivery', () => {
  it('decorates the families with invented states in demo mode, and counts them', async () => {
    await load('demo')
    const result = await RosterService.list(1, { perPage: 50 })
    expect(result.data).toHaveLength(21)
    expect(result.data.every(f => f.delivery && typeof f.delivery.state === 'string')).toBe(true)
    const failed = result.data.filter(f => f.delivery.state === 'failed')
    expect(failed.length).toBeGreaterThan(0)
    expect(failed[0].delivery).toMatchObject({ errorCode: '131026', retryCount: 0 })
    const c = result.counts.delivery
    expect(c.failed).toBe(failed.length)
    expect(c.unsent).toBe(result.data.filter(f => f.delivery.state === 'none').length)
    expect(c.noPhone).toBe(1)
    expect(result.counts.all).toBe(21)
  })

  it('has nothing sent in plain mock mode', async () => {
    await load('1')
    const result = await RosterService.list(1, { perPage: 50 })
    expect(result.counts.delivery).toMatchObject({ unsent: 21, failed: 0, delivered: 0, shared: 0 })
  })

  it('filters by delivery, status and search, and paginates', async () => {
    await load('demo')
    const unsent = await RosterService.list(1, { delivery: 'unsent', perPage: 5 })
    expect(unsent.data.length).toBeLessThanOrEqual(5)
    expect(unsent.data.every(f => f.delivery.state === 'none')).toBe(true)
    expect(unsent.meta.lastPage).toBeGreaterThan(0)
    const problem = await RosterService.list(1, { delivery: 'problem', perPage: 50 })
    expect(problem.data.every(f => f.delivery.state === 'failed')).toBe(true)
    const sent = await RosterService.list(1, { delivery: 'sent', perPage: 50 })
    expect(sent.data.some(f => f.delivery.state === 'read')).toBe(true)
    expect(sent.data.some(f => f.delivery.state === 'failed')).toBe(false)
    const pending = await RosterService.list(1, { status: 'pending', search: 'familia 4', perPage: 50 })
    expect(pending.data.map(f => f.name)).toEqual(['Familia 4'])
    const second = await RosterService.list(1, { page: 2 })
    expect(second.meta.currentPage).toBe(2)
  })

  it('marks every third family with a phone as opened by hand in manual mode', async () => {
    await load('modlocked')
    const result = await RosterService.list(1, { perPage: 50 })
    const manual = result.data.filter(f => f.delivery.state === 'manual')
    expect(manual.map(f => f.id)).toEqual([3, 6, 9, 12, 15, 18, 21])
    expect(manual[0].delivery.sharedAt).toBeTruthy()
    expect(result.counts.delivery.shared).toBe(7)
    expect(mock.mockModuleState()).toBe('locked')
  })

  it('shows the real mock messages over the invented ones after a send', async () => {
    await load('1')
    await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [1] })
    const result = await RosterService.list(1, { perPage: 50 })
    const first = result.data.find(f => f.id === 1)
    expect(first.delivery.state).toBe('queued')
    expect(first.delivery.lastMessageId).toBeGreaterThan(0)
    expect(result.counts.delivery.queued).toBe(1)
  })

  it('takes the first page of 15 when the request says nothing, and keeps the latest message of a guest', async () => {
    await load('1')
    await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [1] })
    await mock.mockWhatsapp.send(1, { template: 'invitation', audience: 'selected', guest_ids: [1], force: true })
    const result = await mock.mockWhatsapp.roster(1, {}, (id, params) => RosterService.listRaw(id, params))
    expect(result.data).toHaveLength(15)
    expect(result.meta).toMatchObject({ currentPage: 1, lastPage: 2, total: 21 })
    expect(result.data[0].delivery.lastMessageId).toBe(2)
    expect(result.counts.delivery.queued).toBe(1)
  })

  it('does not touch the real API path in production mode', async () => {
    vi.stubEnv('VITE_WHATSAPP_MOCK', '')
    vi.resetModules()
    api.get.mockResolvedValue({ data: { data: [], meta: {}, counts: {} } })
    const service = (await import('../services/RosterService')).default
    await service.list(3, { status: 'pending', delivery: 'unsent', search: 'x' })
    expect(api.get).toHaveBeenCalledWith('/event/3/roster', { params: { page: 1, perPage: 15, status: 'pending', search: 'x', delivery: 'unsent' } })
  })
})
