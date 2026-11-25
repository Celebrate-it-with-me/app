import { describe, it, expect, vi, beforeEach } from 'vitest'

const get = vi.hoisted(() => vi.fn())
vi.mock('@/services/axios', () => ({ CWM_API: { get } }))
const { default: PaymentsService } = await import('../services/PaymentsService')

describe('PaymentsService.quote', () => {
  beforeEach(() => get.mockReset().mockResolvedValue({ data: { data: { amountCents: 9900 } } }))

  it('shares one request between identical quotes asked at once', async () => {
    const [a, b] = await Promise.all([PaymentsService.quote(1), PaymentsService.quote(1)])
    expect(get).toHaveBeenCalledTimes(1)
    expect(a).toEqual(b)
  })

  it('asks again for another code, or once the first answer is back', async () => {
    await Promise.all([PaymentsService.quote(1, 'LANZAMIENTO79'), PaymentsService.quote(1)])
    expect(get).toHaveBeenCalledTimes(2)
    await PaymentsService.quote(1)
    expect(get).toHaveBeenCalledTimes(3)
  })
})

describe('PaymentsService.checkout', () => {
  it('sends the code and the amount the screen showed, and only what it has', async () => {
    const post = vi.fn().mockResolvedValue({ data: { data: { purchaseId: 1, url: 'u' } } })
    const { CWM_API } = await import('@/services/axios')
    CWM_API.post = post
    expect(await PaymentsService.checkout(5, 'X', 7900)).toEqual({ purchaseId: 1, url: 'u' })
    expect(post).toHaveBeenLastCalledWith('/event/5/purchase/checkout', { code: 'X', expectedAmountCents: 7900 })
    await PaymentsService.checkout(5)
    expect(post).toHaveBeenLastCalledWith('/event/5/purchase/checkout', {})
    await PaymentsService.checkout(5, undefined, 0)
    expect(post).toHaveBeenLastCalledWith('/event/5/purchase/checkout', { expectedAmountCents: 0 })
  })
})
