import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'
import en from '@/locales/en'

const { quote } = vi.hoisted(() => ({ quote: vi.fn() }))
vi.mock('../services/PaymentsService', () => ({ default: { quote, checkout: vi.fn() } }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import PurchasePanel from '../components/PurchasePanel.vue'

const mountPanel = (locale = 'es') =>
  mount(PurchasePanel, { props: { eventId: 1 }, global: { plugins: [createI18n({ legacy: false, locale, messages: { es, en } })] } })
const list = { amountCents: 9900, listPriceCents: 9900, currency: 'USD', code: null, source: 'list', unlocked: false }
const open = { ...list, amountCents: 7900, source: 'offer', offer: { active: true, priceCents: 7900, listPriceCents: 9900, slotsLeft: 37, totalSlots: 100 } }
const soldOut = { ...list, offer: { active: false, priceCents: 7900, listPriceCents: 9900, slotsLeft: 0, totalSlots: 100 } }

beforeEach(() => {
  quote.mockReset()
  localStorage.clear()
})

describe('PurchasePanel with the launch offer', () => {
  it('shows the offer without a code: struck list price, $79, slots left and a plain "Pagar"', async () => {
    quote.mockResolvedValue(open)
    const wrapper = mountPanel()
    await flushPromises()
    expect(quote).toHaveBeenCalledWith(1, undefined)
    expect(wrapper.get('[data-testid=offer-banner]').text()).toContain('Oferta de lanzamiento')
    expect(wrapper.get('[data-testid=offer-slots]').text()).toBe('Quedan 37 cupos de 100')
    const summary = wrapper.get('[data-testid=purchase-summary]').text()
    expect(summary).toContain('$99')
    expect(summary).toContain('Oferta de lanzamiento')
    expect(summary).toContain('$20')
    expect(wrapper.get('[data-testid=purchase-total]').text()).toBe('$79')
    expect(wrapper.get('[data-testid=pay]').text()).toBe('Pagar $79')
    expect(wrapper.text()).not.toContain('hasta 300')
  })

  it('uses the singular for the last slot and omits the count when the API gives none', async () => {
    quote.mockResolvedValue({ ...open, offer: { ...open.offer, slotsLeft: 1 } })
    let wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.get('[data-testid=offer-slots]').text()).toBe('Queda 1 cupo de 100')
    quote.mockResolvedValue({ ...open, offer: { ...open.offer, slotsLeft: undefined } })
    wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.find('[data-testid=offer-slots]').exists()).toBe(false)
  })

  it('says the offer ended and charges the list price when it sold out', async () => {
    quote.mockResolvedValue(soldOut)
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.get('[data-testid=offer-ended]').text()).toContain('terminó')
    expect(wrapper.find('[data-testid=offer-banner]').exists()).toBe(false)
    expect(wrapper.get('[data-testid=pay]').text()).toBe('Pagar $99')
  })

  it('says nothing about the offer when there is none, and keeps the code behind "¿Tienes un código?"', async () => {
    quote.mockResolvedValue(list)
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.find('[data-testid=offer-banner]').exists()).toBe(false)
    expect(wrapper.find('[data-testid=offer-ended]').exists()).toBe(false)
    const toggle = wrapper.get('[data-testid=code-toggle]')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('form').attributes('style')).toContain('display: none')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('form').attributes('style') ?? '').not.toContain('display: none')
  })

  it('shows one trust line and the details (refund, fee, legal) behind "Ver detalles"', async () => {
    quote.mockResolvedValue(list)
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.get('[data-testid=trust]').text()).toBe(es.payments.trust)
    expect(wrapper.get('[data-testid=details] summary').text()).toBe('Ver detalles')
    expect(wrapper.get('[data-testid=details]').text()).toContain(es.payments.refundNote)
  })

  it('drops a code tied to the offer when the quote says the offer is over', async () => {
    localStorage.setItem('quinvite:pending-code', 'LANZAMIENTO79')
    quote.mockRejectedValueOnce({ response: { status: 422, data: { errors: { code: ['launch_offer_exhausted'] } } } }).mockResolvedValue(soldOut)
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.get('[data-problem=exhausted]').text()).toContain('$99')
    expect(wrapper.find('[data-testid=offer-ended]').exists()).toBe(false)
    expect(wrapper.get('[data-testid=pay]').text()).toBe('Pagar $99')
  })

  it('says "Aplicar y pagar" only when a code is applied', async () => {
    quote.mockResolvedValue({ ...open, code: 'LANZAMIENTO79', source: 'coupon' })
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.get('[data-testid=pay]').text()).toBe('Aplicar y pagar $79')
  })

  it('reads in English', async () => {
    quote.mockResolvedValue(open)
    const wrapper = mountPanel('en')
    await flushPromises()
    expect(wrapper.get('[data-testid=pay]').text()).toBe('Pay $79')
    expect(wrapper.get('[data-testid=offer-slots]').text()).toBe('37 spots left of 100')
  })

  it('shows the generic error when the quote fails for another reason', async () => {
    quote.mockRejectedValue(new Error('net'))
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.find('[data-testid=purchase-summary]').exists()).toBe(false)
    expect(wrapper.get('[data-testid=pay]').attributes('disabled')).toBeDefined()
  })
})

describe('PurchasePanel edge paths', () => {
  it('shows the generic error when the quote after an exhausted code also fails', async () => {
    localStorage.setItem('quinvite:pending-code', 'LANZAMIENTO79')
    quote.mockRejectedValueOnce({ response: { status: 422, data: { errors: { code: ['launch_offer_exhausted'] } } } }).mockRejectedValueOnce(new Error('net'))
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.find('[data-problem=exhausted]').exists()).toBe(false)
    expect(wrapper.get('[data-testid=pay]').attributes('disabled')).toBeDefined()
  })

  it('applies a typed code and clears the previous notice', async () => {
    quote.mockResolvedValue(open)
    const wrapper = mountPanel()
    await flushPromises()
    await wrapper.get('[data-testid=code-toggle]').trigger('click')
    await wrapper.get('input').setValue('LANZAMIENTO79')
    quote.mockResolvedValue({ ...open, code: 'LANZAMIENTO79', source: 'coupon' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(quote).toHaveBeenLastCalledWith(1, 'LANZAMIENTO79')
    expect(wrapper.get('[data-testid=pay]').text()).toBe('Aplicar y pagar $79')
  })
})
