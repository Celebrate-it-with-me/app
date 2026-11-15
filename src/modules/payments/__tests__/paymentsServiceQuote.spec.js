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
