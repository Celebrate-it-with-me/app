import { describe, it, expect, vi, beforeEach } from 'vitest'
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
