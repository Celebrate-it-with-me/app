import { describe, it, expect, vi } from 'vitest'
import { purchaseState, shortDate } from '../utils/purchases'

const get = vi.hoisted(() => vi.fn())
vi.mock('@/services/axios', () => ({ CWM_API: { get } }))

describe('purchaseState', () => {
  it('marks a refunded purchase as neutral', () => expect(purchaseState({ status: 'refunded' })).toEqual({ tone: 'neutral', key: 'refunded' }))
  it('marks a paid purchase as success', () => expect(purchaseState({ status: 'paid' })).toEqual({ tone: 'success', key: 'paid' }))
})

describe('shortDate', () => {
  it('is empty without a date', () => expect(shortDate(null)).toBe(''))
  it('writes the English month first', () => expect(shortDate('2026-11-13T12:00:00Z', 'en')).toBe('Nov 13, 2026'))
})

describe('PurchasesService', () => {
  it('asks for the list and unwraps data', async () => {
    const { default: service } = await import('../services/PurchasesService')
    get.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } })
    expect(await service.list()).toEqual([{ id: 1 }])
    expect(get).toHaveBeenCalledWith('account/purchases')
  })

  it('downloads an invoice as a blob from its own route', async () => {
    const { default: service } = await import('../services/PurchasesService')
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    get.mockResolvedValueOnce({ data: new Blob(['%PDF']) })
    await service.download('invoice', 7, 'QV-2026-000001.pdf')
    expect(get).toHaveBeenLastCalledWith('account/invoices/7/pdf', expect.objectContaining({ responseType: 'blob' }))
    get.mockResolvedValueOnce({ data: new Blob(['%PDF']) })
    await service.download('credit-note', 3, 'NC-2026-000001.pdf')
    expect(get).toHaveBeenLastCalledWith('account/credit-notes/3/pdf', expect.anything())
  })
})
