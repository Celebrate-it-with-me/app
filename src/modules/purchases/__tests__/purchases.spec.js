import { describe, it, expect, vi } from 'vitest'
import { purchaseState, shortDate } from '../utils/purchases'

const { get, put, post } = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: { get, put, post } }))

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

describe('billing utils', () => {
  it('turns an empty profile into form values with the account email', async () => {
    const { toFormValues } = await import('../utils/billing')
    expect(toFormValues(null, 'a@b.co')).toMatchObject({ name: '', billingEmail: 'a@b.co', country: 'US', taxId: '' })
  })

  it('sends empty optional fields as null and trims the rest', async () => {
    const { toPayload } = await import('../utils/billing')
    const body = toPayload({ name: ' Ana ', billingEmail: ' a@b.co ', address: '  ', city: 'Miami', state: '', postalCode: '', country: 'US', taxId: ' 12-345 ' })
    expect(body).toEqual({ name: 'Ana', billingEmail: 'a@b.co', address: null, city: 'Miami', state: null, postalCode: null, country: 'US', taxId: '12-345' })
  })

  it('accepts generic tax ids and rejects symbols', async () => {
    const { TAX_ID_PATTERN } = await import('../utils/billing')
    expect(TAX_ID_PATTERN.test('EIN 12-3456789')).toBe(true)
    expect(TAX_ID_PATTERN.test('<script>')).toBe(false)
  })

  it('lists the country names in the interface language', async () => {
    const { countryOptions } = await import('../utils/billing')
    expect(countryOptions('es').find(c => c.value === 'US').label).toMatch(/Estados Unidos/)
    expect(countryOptions('en').find(c => c.value === 'MX').label).toBe('Mexico')
  })
})

describe('PurchasesService billing and resend', () => {
  it('reads and saves the billing profile', async () => {
    const { default: service } = await import('../services/PurchasesService')
    get.mockResolvedValueOnce({ data: { data: { exists: false } } })
    expect(await service.billingProfile()).toEqual({ exists: false })
    expect(get).toHaveBeenLastCalledWith('account/billing-profile')
    put.mockResolvedValueOnce({ data: { data: { name: 'Ana' } } })
    expect(await service.saveBillingProfile({ name: 'Ana' })).toEqual({ name: 'Ana' })
    expect(put).toHaveBeenCalledWith('account/billing-profile', { name: 'Ana' })
  })

  it('resends to one of her own addresses by choice, never by free text', async () => {
    const { default: service } = await import('../services/PurchasesService')
    post.mockResolvedValueOnce({ data: { data: { sentTo: 'a@b.co' } } })
    expect(await service.resend('invoice', 7, 'billing')).toBe('a@b.co')
    expect(post).toHaveBeenLastCalledWith('account/invoices/7/resend', { to: 'billing' })
    post.mockResolvedValueOnce({ data: { data: { sentTo: 'a@b.co' } } })
    await service.resend('credit-note', 3, 'account')
    expect(post).toHaveBeenLastCalledWith('account/credit-notes/3/resend', { to: 'account' })
  })
})
