import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import GuestLimitNotice from '../GuestLimitNotice.vue'
import GuestLimitBanner from '../GuestLimitBanner.vue'

vi.mock('@/modules/payments/services/PaymentsService', () => ({ default: { quote: vi.fn() } }))
import PaymentsService from '@/modules/payments/services/PaymentsService'

const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }

function setup(event) {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const store = useEventsStore()
  store.activeEvent = event
  // the banner refreshes the event on mount: keep it local
  store.fetchEvent = async () => event
  return { global: { plugins: [i18n, pinia], stubs } }
}

const text = wrapper => wrapper.text().replace(/\s+/g, ' ')

beforeEach(() => setLocale('es'))

describe('GuestLimitNotice', () => {
  const info = { limit: 30, total: 47, excess: 17 }

  it('as a banner: says how far over the list is and what to do, with the real numbers', () => {
    const wrapper = mount(GuestLimitNotice, { props: { info }, ...setup(null) })
    expect(text(wrapper)).toContain('Pasaste el límite del plan gratis')
    expect(text(wrapper)).toContain('Tienes 47 invitados y el plan gratis permite 30')
    expect(text(wrapper)).toContain('elimina 17 invitados')
    expect(wrapper.get('a').attributes('href')).toBe('/dashboard/unlock/guests-limit')
  })

  it('next to the publish button: the exact sentence, in the singular when only one guest is over', () => {
    const wrapper = mount(GuestLimitNotice, { props: { info: { limit: 30, total: 31, excess: 1 }, variant: 'publish', withListLink: true }, ...setup(null) })
    expect(text(wrapper)).toContain('Tu lista tiene 31 invitados y el plan gratis permite 30. Desbloquea tu evento completo o elimina 1 invitado para poder publicar.')
    expect(wrapper.findAll('a').map(a => a.attributes('href'))).toEqual(['/dashboard/unlock/guests-limit', '/dashboard/guests'])
  })

  it('puts the quoted price on the unlock button, and falls back to the plain label when the quote fails', async () => {
    PaymentsService.quote.mockResolvedValueOnce({ amountCents: 9900, currency: 'USD' })
    const priced = mount(GuestLimitNotice, { props: { info }, ...setup({ id: 5 }) })
    await flushPromises()
    expect(PaymentsService.quote).toHaveBeenCalledWith(5)
    expect(priced.get('a').text()).toBe('Desbloquear · $99')
    PaymentsService.quote.mockRejectedValueOnce(new Error('boom'))
    const plain = mount(GuestLimitNotice, { props: { info }, ...setup({ id: 5 }) })
    await flushPromises()
    expect(plain.get('a').text()).toBe('Desbloquear evento completo')
  })

  it('speaks English too', () => {
    setLocale('en')
    const wrapper = mount(GuestLimitNotice, { props: { info, variant: 'publish' }, ...setup(null) })
    expect(text(wrapper)).toContain('Your list has 47 guests and the free plan allows 30.')
    expect(text(wrapper)).toContain('remove 17 guests')
  })
})

describe('GuestLimitBanner', () => {
  it('shows only while the list is over the limit', () => {
    expect(mount(GuestLimitBanner, setup({ id: 1, guestLimit: 30, guestsCount: 47 })).text()).toContain('Pasaste el límite')
    expect(mount(GuestLimitBanner, setup({ id: 1, guestLimit: 30, guestsCount: 30 })).text()).toBe('')
    expect(mount(GuestLimitBanner, setup({ id: 1, guestLimit: null, guestsCount: 400 })).text()).toBe('')
    expect(mount(GuestLimitBanner, setup(null)).text()).toBe('')
  })
})

describe('GuestLimitNotice for someone who is not the owner', () => {
  const info = { limit: 30, total: 47, excess: 17 }

  it.each(['editor', 'viewer'])('replaces the unlock button with the ask-the-owner message for a %s', role => {
    const wrapper = mount(GuestLimitNotice, { props: { info, withListLink: true }, ...setup({ id: 1, userRole: role }) })
    expect(wrapper.get('[data-testid="owner-only"]').text()).toBe('Pídele a quien creó el evento que lo desbloquee.')
    expect(wrapper.findAll('a').map(a => a.attributes('href'))).toEqual(['/dashboard/guests'])
  })

  it('keeps the unlock button for the owner', () => {
    const wrapper = mount(GuestLimitNotice, { props: { info }, ...setup({ id: 1, userRole: 'owner' }) })
    expect(wrapper.find('[data-testid="owner-only"]').exists()).toBe(false)
    expect(wrapper.get('a').attributes('href')).toBe('/dashboard/unlock/guests-limit')
  })
})
