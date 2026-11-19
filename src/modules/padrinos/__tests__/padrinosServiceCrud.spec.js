import { describe, it, expect, vi, beforeEach } from 'vitest'

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: http }))

import PadrinosService from '../services/PadrinosService'
import routes from '../routes/padrinos.route'

describe('PadrinosService CRUD', () => {
  beforeEach(() => Object.values(http).forEach(fn => fn.mockReset()))

  it('lists with totals and currency as the API sends them', async () => {
    const body = { data: [{ id: 1 }], totals: { committed: 5 }, currency: 'USD' }
    http.get.mockResolvedValue({ data: body })
    expect(await PadrinosService.list(7)).toEqual(body)
    expect(http.get).toHaveBeenCalledWith('/event/7/padrinos')
  })

  it('creates and updates, returning the padrino resource', async () => {
    http.post.mockResolvedValue({ data: { data: { id: 2 } } })
    http.put.mockResolvedValue({ data: { data: { id: 2, name: 'B' } } })
    expect(await PadrinosService.create(7, { name: 'A' })).toEqual({ id: 2 })
    expect(http.post).toHaveBeenCalledWith('/event/7/padrinos', { name: 'A' })
    expect(await PadrinosService.update(7, 2, { name: 'B' })).toEqual({ id: 2, name: 'B' })
    expect(http.put).toHaveBeenCalledWith('/event/7/padrinos/2', { name: 'B' })
  })

  it('removes and lets the API refusal reach the caller', async () => {
    http.delete.mockResolvedValueOnce({})
    await expect(PadrinosService.remove(7, 2)).resolves.toBeUndefined()
    expect(http.delete).toHaveBeenCalledWith('/event/7/padrinos/2')
    http.delete.mockRejectedValueOnce({ response: { status: 422 } })
    await expect(PadrinosService.remove(7, 3)).rejects.toMatchObject({ response: { status: 422 } })
  })
})

describe('padrinos route', () => {
  it('is an authenticated dashboard page gated by the padrinos module', async () => {
    const [route] = routes
    expect(route).toMatchObject({ path: '/dashboard/padrinos', name: 'padrinos', meta: { requiresAuth: true, module: 'padrinos' } })
    expect((await route.component()).default).toBeDefined()
  })
})
