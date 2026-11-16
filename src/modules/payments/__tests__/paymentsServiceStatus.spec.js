import { describe, it, expect, vi } from 'vitest'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: { get, post } }))

import PaymentsService from '../services/PaymentsService'

describe('PaymentsService', () => {
  it('status sends ?purchase when given and omits it otherwise', async () => {
    get.mockResolvedValue({ data: { data: { status: 'paid' } } })
    await PaymentsService.status(4, 12)
    expect(get).toHaveBeenLastCalledWith('/event/4/purchase/status', { params: { purchase: 12 } })
    await PaymentsService.status(4)
    expect(get).toHaveBeenLastCalledWith('/event/4/purchase/status', { params: {} })
  })

  it('cancel posts to the purchase and returns the data', async () => {
    post.mockResolvedValue({ data: { data: { status: 'failed', failureCode: 'cancelled' } } })
    expect(await PaymentsService.cancel(4, 12)).toEqual({ status: 'failed', failureCode: 'cancelled' })
    expect(post).toHaveBeenCalledWith('/event/4/purchase/12/cancel')
  })
})
