import { describe, it, expect, vi, beforeEach } from 'vitest'

const get = vi.hoisted(() => vi.fn())
vi.mock('axios', () => ({ default: { create: () => ({ get, post: vi.fn() }) } }))

import InvitationService from '../InvitationService'

describe('InvitationService prefetch', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue({ data: { data: { ok: true } } })
  })

  it('hands the early request to the first get for the same slug, code and language (one request)', async () => {
    InvitationService.prefetch({ slug: 'xv', code: 'A1', lang: 'en' })
    const result = await InvitationService.get({ slug: 'xv', code: 'A1', lang: 'en' })

    expect(result.data.data.ok).toBe(true)
    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith('invitation/xv/A1', { params: { lang: 'en' } })
  })

  it('serves the early request only once: a retry asks again', async () => {
    InvitationService.prefetch({ slug: 'xv', code: 'B2' })
    await InvitationService.get({ slug: 'xv', code: 'B2' })
    await InvitationService.get({ slug: 'xv', code: 'B2' })

    expect(get).toHaveBeenCalledTimes(2)
  })

  it('does not reuse it for another language or guest', async () => {
    InvitationService.prefetch({ slug: 'xv', code: 'C3', lang: 'es' })
    await InvitationService.get({ slug: 'xv', code: 'C3', lang: 'en' })
    await InvitationService.get({ slug: 'xv', code: 'ZZ', lang: 'es' })

    expect(get).toHaveBeenCalledTimes(3)
  })

  it('a failed early request fails where it is consumed, not as an unhandled rejection', async () => {
    get.mockRejectedValueOnce(Object.assign(new Error('nope'), { response: { status: 404 } }))
    InvitationService.prefetch({ slug: 'xv', code: 'D4' })

    await expect(InvitationService.get({ slug: 'xv', code: 'D4' })).rejects.toThrow('nope')
  })
})
