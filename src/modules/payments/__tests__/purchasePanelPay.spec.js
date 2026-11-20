import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'

const { quote, checkout, push, toast, showError } = vi.hoisted(() => ({
  quote: vi.fn(),
  checkout: vi.fn(),
  push: vi.fn(),
  toast: vi.fn(),
  showError: vi.fn()
}))
vi.mock('../services/PaymentsService', () => ({ default: { quote, checkout } }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/ui', async importOriginal => ({ ...(await importOriginal()), useToast: () => ({ error: showError, toast }) }))

import PurchasePanel from '../components/PurchasePanel.vue'
import { PENDING_CODE_KEY } from '../utils/pendingCode'

const i18n = createI18n({ legacy: false, locale: 'es', messages: { es } })
const mountPanel = () => mount(PurchasePanel, { props: { eventId: 5 }, global: { plugins: [i18n] } })
const full = { amountCents: 9900, listPriceCents: 9900, currency: 'USD', maxGuests: 300, code: null, unlocked: false }

beforeEach(() => {
  for (const fn of [quote, checkout, push, toast, showError]) fn.mockReset()
  localStorage.clear()
  quote.mockResolvedValue(full)
})

describe('PurchasePanel when the event is already unlocked', () => {
  it('tells the parent when the quote says unlocked, and does not let her pay', async () => {
    quote.mockResolvedValue({ ...full, unlocked: true })
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.emitted('already-unlocked')).toHaveLength(1)
    expect(wrapper.findAll('button').at(-1).attributes('disabled')).toBeDefined()
  })

  it('says nothing for an event that is still locked', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.emitted('already-unlocked')).toBeUndefined()
  })

  it('also tells the parent after a spent code falls back to a plain quote that is unlocked', async () => {
    localStorage.setItem(PENDING_CODE_KEY, 'X')
    quote.mockReset()
    quote.mockRejectedValueOnce({ response: { status: 422, data: { errors: { code: ['x'] } } } }).mockResolvedValue({ ...full, unlocked: true })
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.emitted('already-unlocked')).toHaveLength(1)
  })
})

const reject = (status, data = {}) => checkout.mockRejectedValue({ response: { status, data } })

describe('PurchasePanel pay()', () => {
  let assign
  beforeEach(() => {
    assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign })
  })
  afterEach(() => vi.unstubAllGlobals())
  const pay = async wrapper => {
    await wrapper.findAll('button').at(-1).trigger('click')
    await flushPromises()
  }

  it('asks for the checkout with the applied code and sends the buyer to Stripe', async () => {
    quote.mockResolvedValue({ ...full, amountCents: 7900, code: 'FUND79' })
    checkout.mockResolvedValue({ purchaseId: 3, url: 'https://checkout.example/s/1' })
    localStorage.setItem(PENDING_CODE_KEY, 'FUND79')
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(checkout).toHaveBeenCalledWith(5, 'FUND79')
    expect(assign).toHaveBeenCalledWith('https://checkout.example/s/1')
    expect(localStorage.getItem(PENDING_CODE_KEY)).toBeNull()
  })

  it('sends no code when there is none', async () => {
    checkout.mockResolvedValue({ url: 'https://checkout.example/s/2' })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(checkout).toHaveBeenCalledWith(5, undefined)
  })

  it.each(['checkout_in_progress', 'payment_in_progress'])('409 %s: says it is processing and goes to the status screen', async code => {
    reject(409, { code })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(toast).toHaveBeenCalledWith({ title: es.payments.processing, tone: 'warning' })
    expect(push).toHaveBeenCalledWith('/dashboard/events/5/unlock')
    expect(assign).not.toHaveBeenCalled()
    expect(showError).not.toHaveBeenCalled()
  })

  it('422 event already_unlocked: tells the parent', async () => {
    reject(422, { errors: { event: ['already_unlocked'] } })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(wrapper.emitted('already-unlocked')).toHaveLength(1)
    expect(showError).not.toHaveBeenCalled()
  })

  it('422 code: shows the invalid-code error under the field', async () => {
    reject(422, { errors: { code: ['invalid_code'] } })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(wrapper.text()).toContain(es.payments.invalidCode)
  })

  it('429: asks her to wait a moment', async () => {
    reject(429)
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(showError).toHaveBeenCalledWith(es.payments.tooManyAttempts)
  })

  it.each([[502, { code: 'gateway_error' }], [500, { code: 'gateway_error' }]])('%s gateway_error: says the payment service is down and lets her retry', async (status, data) => {
    reject(status, data)
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(showError).toHaveBeenCalledWith(es.payments.gatewayError)
    // the button is usable again
    expect(wrapper.findAll('button').at(-1).attributes('disabled')).toBeUndefined()
  })

  it('any other failure: the generic checkout error', async () => {
    checkout.mockRejectedValue(new Error('network'))
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(showError).toHaveBeenCalledWith(es.payments.checkoutFailed)
  })

  it('unverified email: leaves it to the global dialog, no toast', async () => {
    reject(403, { code: 'email_not_verified' })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(showError).not.toHaveBeenCalled()
  })
})
