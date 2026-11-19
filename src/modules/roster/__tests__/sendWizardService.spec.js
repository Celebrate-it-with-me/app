import { describe, it, expect, vi, beforeEach } from 'vitest'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: api }))
import service from '../services/SendWizardService'

beforeEach(() => Object.values(api).forEach(fn => fn.mockReset()))

describe('SendWizardService', () => {
  it('reads the audience', async () => {
    api.get.mockResolvedValue({ data: { data: { totalFamilies: 2 } } })
    expect(await service.audience(7)).toEqual({ totalFamilies: 2 })
    expect(api.get).toHaveBeenCalledWith('/event/7/whatsapp/audience', { params: { template: 'invitation' } })
  })

  it('walks the recipients pages', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [{ id: 1 }], meta: { perPage: 1, total: 2 } } })
      .mockResolvedValueOnce({ data: { data: [{ id: 2 }], meta: { perPage: 1, total: 2 } } })
    expect((await service.allRecipients(7, 'save_the_date')).map(r => r.id)).toEqual([1, 2])
    expect(api.get).toHaveBeenLastCalledWith('/event/7/whatsapp/recipients', { params: { template: 'save_the_date', category: 'all', page: 2, per_page: 100 } })
  })

  it('stops at once when the answer has no meta', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1 }] } })
    expect(await service.allRecipients(7)).toHaveLength(1)
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('walks the roster pages', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [{ id: 1 }], meta: { lastPage: 2 } } })
      .mockResolvedValueOnce({ data: { data: [{ id: 2 }], meta: { lastPage: 2 } } })
    expect(await service.allRoster(7)).toHaveLength(2)
    api.get.mockReset()
    api.get.mockResolvedValue({ data: { data: [{ id: 1 }] } })
    expect(await service.allRoster(7)).toHaveLength(1)
  })

  it('marks and unmarks a family as opened', async () => {
    api.post.mockResolvedValue({ data: { data: { id: 3 } } })
    api.delete.mockResolvedValue({ data: { data: { id: 3 } } })
    expect(await service.markShared(7, 3)).toEqual({ id: 3 })
    expect(api.post).toHaveBeenCalledWith('/event/7/roster/3/shared')
    expect(await service.unmarkShared(7, 3)).toEqual({ id: 3 })
    expect(api.delete).toHaveBeenCalledWith('/event/7/roster/3/shared')
  })
})
