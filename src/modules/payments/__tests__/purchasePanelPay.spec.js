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
    expect(wrapper.find('[data-testid=pay]').attributes('disabled')).toBeDefined()
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
    await wrapper.find('[data-testid=pay]').trigger('click')
    await flushPromises()
  }

  it('asks for the checkout with the applied code and sends the buyer to Stripe', async () => {
    quote.mockResolvedValue({ ...full, amountCents: 7900, code: 'FUND79' })
    checkout.mockResolvedValue({ purchaseId: 3, url: 'https://checkout.stripe.com/c/pay/s1' })
    localStorage.setItem(PENDING_CODE_KEY, 'FUND79')
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(checkout).toHaveBeenCalledWith(5, 'FUND79', 7900)
    expect(assign).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/s1')
    expect(localStorage.getItem(PENDING_CODE_KEY)).toBeNull()
  })

  it.each(['javascript:alert(1)', 'http://checkout.stripe.com/c/pay/x', 'https://evil.example/c/pay/x', 'https://[bad', undefined])(
    'does not navigate to an unsafe checkout url (%s) and shows the generic payment error',
    async url => {
      checkout.mockResolvedValue({ url })
      localStorage.setItem(PENDING_CODE_KEY, 'FUND79')
      const wrapper = mountPanel()
      await flushPromises()
      await pay(wrapper)
      expect(assign).not.toHaveBeenCalled()
      expect(showError).toHaveBeenCalledWith(es.payments.checkoutFailed)
      expect(localStorage.getItem(PENDING_CODE_KEY)).toBe('FUND79')
    }
  )

  it('follows the own success url when the amount is 0', async () => {
    checkout.mockResolvedValue({ url: `${window.location.origin}/dashboard/events/5/unlock/return` })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(assign).toHaveBeenCalledWith(`${window.location.origin}/dashboard/events/5/unlock/return`)
  })

  it('sends no code when there is none', async () => {
    checkout.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/s2' })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(checkout).toHaveBeenCalledWith(5, undefined, 9900)
  })

  it.each(['checkout_in_progress', 'payment_in_progress'])('409 %s: explains it and offers to see the payment instead of redirecting', async code => {
    reject(409, { code })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(wrapper.find('[data-problem=payment_in_progress]').text()).toContain(es.payments.problems.payment_in_progress)
    expect(wrapper.find('[data-problem=payment_in_progress]').attributes('aria-live')).toBe('assertive')
    expect(wrapper.find('[data-testid=pay]').exists()).toBe(false) // no second payment offered
    expect(push).not.toHaveBeenCalled()
    await wrapper.find('[data-testid=problem-continue]').trigger('click')
    expect(push).toHaveBeenCalledWith('/dashboard/events/5/unlock')
    expect(assign).not.toHaveBeenCalled()
    expect(showError).not.toHaveBeenCalled()
  })

  it('409 previous_session_open: explains the open attempt and offers to see it', async () => {
    reject(409, { code: 'previous_session_open' })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(wrapper.find('[data-problem=previous_session_open]').text()).toContain('sigue abierto')
    expect(wrapper.find('[data-testid=pay]').exists()).toBe(false)
    await wrapper.find('[data-testid=problem-continue]').trigger('click')
    expect(push).toHaveBeenCalledWith('/dashboard/events/5/unlock')
  })

  it('409 price_changed: reads the real price again, shows it and waits for a new confirmation', async () => {
    quote.mockResolvedValueOnce({ ...full, amountCents: 7900, source: 'offer', offer: { active: true, priceCents: 7900, slotsLeft: 3, totalSlots: 100 } })
    quote.mockResolvedValueOnce({ ...full, offer: { active: false, priceCents: 7900, slotsLeft: 0, totalSlots: 100 } })
    reject(409, { code: 'price_changed', data: { amountCents: 9900 } })
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.find('[data-testid=pay]').text()).toContain('Pagar $79')
    await pay(wrapper)
    expect(wrapper.find('[data-problem=price_changed]').text()).toContain('$99')
    expect(wrapper.find('[data-testid=purchase-total]').text()).toBe('$99')
    expect(wrapper.find('[data-testid=pay]').text()).toContain('Pagar $99')
    expect(assign).not.toHaveBeenCalled()
    checkout.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/s9' })
    await pay(wrapper)
    expect(checkout).toHaveBeenLastCalledWith(5, undefined, 9900)
    expect(assign).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/s9')
  })

  it('409 price_changed: falls back to the amount in the answer when the new quote fails', async () => {
    quote.mockResolvedValueOnce({ ...full, amountCents: 7900 }).mockRejectedValueOnce(new Error('net'))
    reject(409, { code: 'price_changed', data: { amountCents: 9900 } })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(wrapper.find('[data-testid=purchase-total]').text()).toBe('$99')
    expect(wrapper.find('[data-problem=price_changed]').exists()).toBe(true)
  })

  it('422 launch_offer_exhausted at checkout: drops the code and shows the list price with the reason', async () => {
    localStorage.setItem(PENDING_CODE_KEY, 'LANZAMIENTO79')
    quote.mockResolvedValueOnce({ ...full, amountCents: 7900, code: 'LANZAMIENTO79', source: 'coupon' }).mockResolvedValueOnce(full)
    reject(422, { errors: { code: ['launch_offer_exhausted'] } })
    const wrapper = mountPanel()
    await flushPromises()
    await pay(wrapper)
    expect(wrapper.find('[data-problem=exhausted]').text()).toContain('se agotó')
    expect(wrapper.find('[data-testid=purchase-total]').text()).toBe('$99')
    expect(wrapper.find('input').element.value).toBe('')
    expect(localStorage.getItem(PENDING_CODE_KEY)).toBeNull()
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
    expect(wrapper.find('[data-testid=pay]').attributes('disabled')).toBeUndefined()
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
