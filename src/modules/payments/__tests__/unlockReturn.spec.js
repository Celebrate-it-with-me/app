import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'
import en from '@/locales/en'

const { status, cancel, query, push, fetchEvent } = vi.hoisted(() => ({
  status: vi.fn(),
  cancel: vi.fn(),
  query: {},
  push: vi.fn(),
  fetchEvent: vi.fn().mockResolvedValue()
}))
vi.mock('../services/PaymentsService', () => ({ default: { status, cancel } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { id: '5' }, query }), useRouter: () => ({ push }) }))
vi.mock('@/modules/events/stores/useEventsStore', () => ({ useEventsStore: () => ({ fetchEvent }) }))
vi.mock('../utils/money', async importOriginal => {
  const real = await importOriginal()
  return { ...real, waitForOutcome: check => real.waitForOutcome(check, { tries: 2, sleep: () => Promise.resolve() }) }
})

import UnlockReturnView from '../views/UnlockReturnView.vue'
import { REVIEW_CODES } from '../utils/money'

const i18n = createI18n({ legacy: false, locale: 'es', fallbackLocale: 'en', messages: { es, en } })
const stubs = { UiButton: { props: ['to', 'href'], template: '<a :data-to="to" :href="href"><slot /></a>' } }
const mountView = async () => {
  const w = mount(UnlockReturnView, { global: { plugins: [i18n], stubs } })
  await flushPromises()
  return w
}
const res = over => ({ unlocked: false, status: 'pending', purchaseId: 9, failureCode: null, invoiceId: null, ...over })

describe('UnlockReturnView', () => {
  beforeEach(() => {
    status.mockReset()
    cancel.mockReset()
    fetchEvent.mockReset()
    fetchEvent.mockResolvedValue()
    for (const k of Object.keys(query)) delete query[k]
    query.purchase = '9'
    query.paid = '1'
  })

  it('asks about the purchase it came back from and shows success with the invoice link', async () => {
    status.mockResolvedValue(res({ unlocked: true, status: 'paid', invoiceId: 3 }))
    const w = await mountView()
    expect(status).toHaveBeenCalledWith('5', '9')
    expect(w.text()).toContain(es.payments.done.title)
    expect(w.find('[data-to="/settings/purchases"]').exists()).toBe(true)
    expect(fetchEvent).toHaveBeenCalledWith('5')
  })

  it('still shows success when refreshing the event fails', async () => {
    status.mockResolvedValue(res({ unlocked: true, status: 'paid' }))
    fetchEvent.mockRejectedValue(new Error('404'))
    expect((await mountView()).text()).toContain(es.payments.done.title)
  })

  it('has no invoice link until there is an invoice', async () => {
    status.mockResolvedValue(res({ unlocked: true, status: 'paid' }))
    const w = await mountView()
    expect(w.find('[data-to="/settings/purchases"]').exists()).toBe(false)
  })

  it('keeps polling while pending, then tells her it is late without asking to pay again', async () => {
    status.mockResolvedValue(res())
    const w = await mountView()
    expect(status).toHaveBeenCalledTimes(2)
    expect(w.text()).toContain(es.payments.late.title)
    expect(w.text()).toContain(es.payments.late.noRepay)
  })

  it('a late webhook turns late into done on refresh', async () => {
    status.mockResolvedValueOnce(res()).mockResolvedValueOnce(res()).mockResolvedValue(res({ unlocked: true, status: 'paid' }))
    const w = await mountView()
    await w.findAll('a').find(a => a.text().includes(es.payments.late.refresh)).trigger('click')
    await flushPromises()
    expect(w.text()).toContain(es.payments.done.title)
  })

  it.each([
    ['expired', es.payments.failed.codes.expired],
    ['payment_failed', es.payments.failed.codes.payment_failed],
    ['gateway_error', es.payments.failed.codes.gateway_error],
    ['superseded', es.payments.failed.codes.superseded],
    ['something_new', es.payments.failed.codes.other]
  ])('failed with %s shows its message', async (failureCode, text) => {
    status.mockResolvedValue(res({ status: 'failed', failureCode }))
    const w = await mountView()
    expect(status).toHaveBeenCalledTimes(1)
    expect(w.text()).toContain(es.payments.failed.title)
    expect(w.text()).toContain(text)
  })

  it('shows refunded and chargeback', async () => {
    status.mockResolvedValue(res({ status: 'refunded' }))
    expect((await mountView()).text()).toContain(es.payments.refunded.title)
    status.mockResolvedValue(res({ status: 'chargeback', unlocked: true }))
    expect((await mountView()).text()).toContain(es.payments.chargeback.title)
  })

  it.each([
    ['amount_mismatch', 'pending', false],
    ['duplicate_payment', 'refunded', false],
    ['reference_mismatch', 'pending', false]
  ])('%s is a review, never a failed payment: stops polling and says we will write', async (failureCode, st, unlocked) => {
    status.mockResolvedValue(res({ status: st, failureCode, unlocked }))
    const w = await mountView()
    expect(status).toHaveBeenCalledTimes(1)
    const review = w.get('[data-testid="payment-review"]').text()
    expect(review).toContain(es.payments.review.title)
    expect(review).toContain(es.payments.review.codes[failureCode])
    expect(review).toContain(es.payments.review.text)
    expect(w.text()).not.toContain(es.payments.failed.title)
    expect(w.text()).not.toContain(es.payments.refunded.title)
    expect(w.text()).not.toContain(es.payments.late.title)
    expect(w.find('[role="alert"]').exists()).toBe(false)
  })

  it('without ?purchase it asks about the latest one (the ?paid=1 return)', async () => {
    delete query.purchase
    status.mockResolvedValue(res({ unlocked: true, status: 'paid' }))
    const w = await mountView()
    expect(status).toHaveBeenCalledWith('5', undefined)
    expect(w.text()).toContain(es.payments.done.title)
  })

  it('a failed purchase whose code is cancelled reads as cancelled, not as a failure', async () => {
    status.mockResolvedValue(res({ status: 'failed', failureCode: 'cancelled' }))
    const w = await mountView()
    expect(w.text()).toContain(es.payments.cancelled.title)
  })

  it('?cancelled=1 cancels the purchase and says nothing was charged, without polling', async () => {
    query.cancelled = '1'
    delete query.paid
    cancel.mockResolvedValue({ status: 'failed', failureCode: 'cancelled' })
    const w = await mountView()
    expect(cancel).toHaveBeenCalledWith('5', '9')
    expect(status).not.toHaveBeenCalled()
    expect(w.text()).toContain(es.payments.cancelled.title)
  })

  it('cancel answers 409 not_pending: she may have paid, so it checks the status', async () => {
    query.cancelled = '1'
    cancel.mockRejectedValue({ response: { status: 409, data: { code: 'not_pending' } } })
    status.mockResolvedValue(res({ unlocked: true, status: 'paid' }))
    const w = await mountView()
    expect(status).toHaveBeenCalled()
    expect(w.text()).toContain(es.payments.done.title)
  })

  it('cancelled without a purchase id does not call the API', async () => {
    query.cancelled = '1'
    delete query.purchase
    const w = await mountView()
    expect(cancel).not.toHaveBeenCalled()
    expect(w.text()).toContain(es.payments.cancelled.title)
  })
})

const leaves = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? leaves(v, `${prefix}${k}.`) : [`${prefix}${k}`]))

describe('payments i18n', () => {
  it('es and en have the same failed codes', () => {
    expect(Object.keys(en.payments.failed.codes)).toEqual(Object.keys(es.payments.failed.codes))
  })

  it.each(['payments', 'unlock', 'limits'])('es and en have exactly the same keys in %s', section => {
    expect(leaves(en[section]).sort()).toEqual(leaves(es[section]).sort())
  })

  it('every flagged-for-review code has its own text, and no review code is left in failed', () => {
    for (const code of REVIEW_CODES) {
      expect(es.payments.review.codes[code]).toBeTruthy()
      expect(en.payments.review.codes[code]).toBeTruthy()
    }
    expect(Object.keys(es.payments.failed.codes)).not.toEqual(expect.arrayContaining(REVIEW_CODES))
  })
})
