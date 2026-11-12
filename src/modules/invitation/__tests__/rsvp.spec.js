import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

// `saveRsvp` is a spy for the happy paths. Failures use a plain function (`failWith`) because
// vitest's spy tracking reports a rejected promise returned by a mock as an unhandled rejection
// even when the component awaits and handles it.
const { saveRsvp, failure } = vi.hoisted(() => ({ saveRsvp: vi.fn(), failure: { error: null } }))
vi.mock('@/services/PublicEvents/InvitationService', () => ({
  default: { saveRsvp: (...args) => (failure.error ? Promise.reject(failure.error) : saveRsvp(...args)) }
}))

import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationRsvp from '../components/InvitationRsvp.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

function rsvpData(overrides = {}) {
  return {
    guest: { id: 1, name: 'Rosa', status: 'pending' },
    companions: [{ id: 2, name: 'Jorge', status: 'pending' }],
    deadline: '2026-12-10T19:00:00',
    isOpen: true,
    ...overrides
  }
}

function mountRsvp(data) {
  const updateSection = vi.fn()
  const wrapper = mount(InvitationRsvp, {
    props: { section: { type: 'rsvp', title: '¿Me acompañas?', text: null, data } },
    global: {
      provide: {
        [INVITATION_KEY]: {
          invitation: ref({ locale: 'es' }),
          tt,
          formatDate: () => '10 de diciembre',
          slug: () => 'xv-de-valentina',
          code: () => 'AB1234',
          updateSection
        }
      }
    }
  })
  return { wrapper, updateSection }
}

const radios = (wrapper, name) => wrapper.findAll(`input[name="rsvp-${name}"]`)
const submit = wrapper => wrapper.get('button[type="submit"]')

beforeEach(() => {
  saveRsvp.mockReset()
  failure.error = null
})

describe('InvitationRsvp', () => {
  it('needs an answer for the guest and every companion before sending', async () => {
    const { wrapper } = mountRsvp(rsvpData())
    expect(submit(wrapper).attributes('disabled')).toBeDefined()

    await radios(wrapper, 1)[0].setValue(true) // attending
    expect(submit(wrapper).attributes('disabled')).toBeDefined()

    await radios(wrapper, 2)[0].setValue(true)
    expect(submit(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('locks companions as not attending when the guest declines', async () => {
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[1].setValue(true) // not attending

    expect(wrapper.findAll('fieldset')[1].attributes('disabled')).toBeDefined()
    expect(radios(wrapper, 2)[1].element.checked).toBe(true)
    expect(submit(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('sends the answers and shows the thank-you message', async () => {
    const saved = rsvpData({
      guest: { id: 1, name: 'Rosa', status: 'attending' },
      companions: [{ id: 2, name: 'Jorge', status: 'not-attending' }]
    })
    saveRsvp.mockResolvedValue({ data: { data: saved } })
    const { wrapper, updateSection } = mountRsvp(rsvpData())

    await radios(wrapper, 1)[0].setValue(true)
    await radios(wrapper, 2)[1].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(saveRsvp).toHaveBeenCalledWith({
      slug: 'xv-de-valentina',
      code: 'AB1234',
      guest: 'attending',
      companions: { 2: 'not-attending' }
    })
    expect(updateSection).toHaveBeenCalledWith('rsvp', saved)
    expect(wrapper.get('[role="status"]').text()).toBe(tt('rsvp.thanksYes'))
  })

  it('shows an error and keeps the form when saving fails', async () => {
    failure.error = Object.assign(new Error('Request failed'), { response: { status: 500 } })
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[1].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="status"]').text()).toBe(tt('rsvp.error'))
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('shows a read-only summary once answered, and lets the guest edit while open', async () => {
    const { wrapper } = mountRsvp(
      rsvpData({ guest: { id: 1, name: 'Rosa', status: 'attending' }, companions: [] })
    )
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain(tt('rsvp.status.attending'))

    await wrapper.get('button').trigger('click') // "Cambiar mi respuesta"
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('does not offer changes after the deadline', () => {
    const { wrapper } = mountRsvp(
      rsvpData({ isOpen: false, guest: { id: 1, name: 'Rosa', status: 'attending' }, companions: [] })
    )
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.text()).toContain(tt('rsvp.closed'))
  })
})
