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

describe('payments i18n', () => {
  it('es and en have the same failed codes', () => {
    expect(Object.keys(en.payments.failed.codes)).toEqual(Object.keys(es.payments.failed.codes))
  })
})
