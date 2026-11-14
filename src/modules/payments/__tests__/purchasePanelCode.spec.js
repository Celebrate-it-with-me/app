import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'

const { quote } = vi.hoisted(() => ({ quote: vi.fn() }))
vi.mock('../services/PaymentsService', () => ({ default: { quote, checkout: vi.fn() } }))

import PurchasePanel from '../components/PurchasePanel.vue'
import { PENDING_CODE_KEY, LAUNCH_CODE } from '../utils/pendingCode'

const i18n = createI18n({ legacy: false, locale: 'es', messages: { es } })
const mountPanel = () => mount(PurchasePanel, { props: { eventId: 1 }, global: { plugins: [i18n] } })
const full = { amountCents: 9900, listPriceCents: 9900, currency: 'USD', maxGuests: 300, code: null }
const offer = { ...full, amountCents: 7900, code: LAUNCH_CODE }

describe('PurchasePanel with a code from the landing', () => {
  beforeEach(() => {
    quote.mockReset()
    localStorage.clear()
  })

  it('preloads the stored code, asks for the discounted quote and keeps the field editable', async () => {
    localStorage.setItem(PENDING_CODE_KEY, LAUNCH_CODE)
    quote.mockResolvedValue(offer)
    const wrapper = mountPanel()
    await flushPromises()
    expect(quote).toHaveBeenCalledWith(1, LAUNCH_CODE)
    const input = wrapper.find('input')
    expect(input.element.value).toBe(LAUNCH_CODE)
    await input.setValue('OTRO')
    expect(input.element.value).toBe('OTRO')
    expect(wrapper.text()).toContain('$79')
    expect(wrapper.text()).toContain('$99')
  })

  it('shows the usual error when the code is spent, drops it and falls back to $99', async () => {
    localStorage.setItem(PENDING_CODE_KEY, LAUNCH_CODE)
    quote.mockRejectedValueOnce({ response: { status: 422, data: { errors: { code: ['x'] } } } }).mockResolvedValue(full)
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.text()).toContain(es.payments.invalidCode)
    expect(wrapper.text()).toContain('$99')
    expect(localStorage.getItem(PENDING_CODE_KEY)).toBeNull()
  })

  it('asks for the plain quote when there is no code', async () => {
    quote.mockResolvedValue(full)
    mountPanel()
    await flushPromises()
    expect(quote).toHaveBeenCalledWith(1, undefined)
  })
})
