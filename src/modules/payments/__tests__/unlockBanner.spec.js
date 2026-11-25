import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import i18n from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const { quote } = vi.hoisted(() => ({ quote: vi.fn() }))
vi.mock('../services/PaymentsService', () => ({ default: { quote } }))
vi.mock('@/services/axios', () => ({ CWM_API: {} }))

import UnlockBanner from '../components/UnlockBanner.vue'

const mountBanner = (props = { eventId: 3 }) => mount(UnlockBanner, { props, global: { plugins: [i18n] } })

beforeEach(() => {
  setActivePinia(createPinia())
  i18n.global.locale.value = 'es'
  quote.mockReset()
  quote.mockResolvedValue({ amountCents: 7900, currency: 'USD', unlocked: false })
})

describe('UnlockBanner', () => {
  it('is one button with the price the API quotes and tells the parent on click', async () => {
    const wrapper = mountBanner()
    await flushPromises()
    expect(wrapper.get('button').text()).toBe('Desbloquea todo por $79 · pago único')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('unlock')).toHaveLength(1)
  })

  it('reads in English with the list price when there is no offer', async () => {
    i18n.global.locale.value = 'en'
    quote.mockResolvedValue({ amountCents: 9900, currency: 'USD', unlocked: false })
    const wrapper = mountBanner()
    await flushPromises()
    expect(wrapper.get('button').text()).toBe('Unlock everything for $99 · one-time payment')
  })

  it('has no price when the quote fails, and is still usable', async () => {
    quote.mockRejectedValue(new Error('net'))
    const wrapper = mountBanner()
    await flushPromises()
    expect(wrapper.get('button').text()).toBe('Desbloquea todo · pago único')
  })

  it('does not ask for a quote without an event', async () => {
    const wrapper = mountBanner({ eventId: null })
    await flushPromises()
    expect(quote).not.toHaveBeenCalled()
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('is hidden once the event is unlocked', async () => {
    quote.mockResolvedValue({ amountCents: 0, currency: 'USD', unlocked: true })
    const wrapper = mountBanner()
    await flushPromises()
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('is hidden, and asks nothing, for someone who cannot pay (not the owner)', async () => {
    useEventsStore().activeEvent = { id: 3, userRole: 'editor' }
    const wrapper = mountBanner()
    await flushPromises()
    expect(quote).not.toHaveBeenCalled()
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
