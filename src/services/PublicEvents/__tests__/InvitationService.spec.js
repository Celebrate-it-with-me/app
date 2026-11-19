import { describe, it, expect, vi, beforeEach } from 'vitest'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('axios', () => ({ default: { create: () => ({ get, post }) } }))

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

describe('InvitationService saveRsvp', () => {
  beforeEach(() => post.mockReset())

  it('keeps the old body when no menu is sent', async () => {
    await InvitationService.saveRsvp({ slug: 'xv', code: 'A1', guest: 'attending', companions: { 2: 'attending' } })
    expect(post.mock.calls[0][1]).toEqual({ guest: { rsvpStatus: 'attending' }, companions: [{ id: 2, rsvpStatus: 'attending' }] })
  })

  it('maps the dishes to guest.menuItemIds and companions[].menuItemIds', async () => {
    await InvitationService.saveRsvp({
      slug: 'xv',
      code: 'A1',
      guest: 'attending',
      companions: { 2: 'attending', 3: 'not-attending' },
      menu: { guest: [1, 4], companions: { 2: [5], 3: [] } }
    })
    expect(post.mock.calls[0][1]).toEqual({
      guest: { rsvpStatus: 'attending', menuItemIds: [1, 4] },
      companions: [
        { id: 2, rsvpStatus: 'attending', menuItemIds: [5] },
        { id: 3, rsvpStatus: 'not-attending', menuItemIds: [] }
      ]
    })
  })
})
