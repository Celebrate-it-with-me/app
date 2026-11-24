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

function mountRsvp(data, context = {}) {
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
          updateSection,
          ...context
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
  it('needs an answer for the guest and every companion before sending, without a disabled button', async () => {
    const { wrapper } = mountRsvp(rsvpData())
    expect(submit(wrapper).attributes('disabled')).toBeUndefined()
    expect(wrapper.find('[data-rsvp-problem]').exists()).toBe(false)

    await radios(wrapper, 1)[0].setValue(true) // attending
    await wrapper.get('form').trigger('submit')
    expect(saveRsvp).not.toHaveBeenCalled()
    expect(wrapper.get('[data-rsvp-problem]').text()).toBe(tt('rsvp.chooseFor', { names: 'Jorge' }))
    expect(wrapper.get('[data-rsvp-problem]').attributes('role')).toBe('alert')
    expect(wrapper.findAll('fieldset[data-unanswered]')).toHaveLength(1)

    await radios(wrapper, 2)[0].setValue(true)
    expect(wrapper.find('fieldset[data-unanswered]').exists()).toBe(false)
    expect(wrapper.find('[data-rsvp-problem]').exists()).toBe(false)
  })

  it('names people by first name in the unanswered message and rings the options, not the fieldset (R1-003, INV-005)', async () => {
    const { wrapper } = mountRsvp(rsvpData({ guest: { id: 1, name: 'Rosa Fernandez', status: 'pending' }, companions: [{ id: 2, name: 'Jorge Fernandez', status: 'pending' }] }))
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[data-rsvp-problem]').text()).toBe(tt('rsvp.chooseFor', { names: 'Rosa y Jorge' }))
    const fieldset = wrapper.get('fieldset[data-unanswered]')
    expect(fieldset.classes()).not.toContain('ring-2')
    expect(fieldset.get('legend').classes()).not.toContain('ring-2')
    expect(fieldset.get('div.grid').classes()).toContain('ring-danger-500')
  })

  it('joins the names with commas when Intl.ListFormat is unavailable', async () => {
    const original = Intl.ListFormat
    Intl.ListFormat = function () {
      throw new Error('unsupported')
    }
    try {
      const { wrapper } = mountRsvp(rsvpData())
      await wrapper.get('form').trigger('submit')
      expect(wrapper.get('[data-rsvp-problem]').text()).toBe(tt('rsvp.chooseFor', { names: 'Rosa, Jorge' }))
    } finally {
      Intl.ListFormat = original
    }
  })

  it('does not send nor flag anything in preview mode', async () => {
    const { wrapper } = mountRsvp(rsvpData(), { preview: true })
    await wrapper.get('form').trigger('submit')
    expect(saveRsvp).not.toHaveBeenCalled()
    expect(wrapper.find('[data-rsvp-problem]').exists()).toBe(false)
  })

  it('still shows the problem when there is nothing to focus', async () => {
    const { wrapper } = mountRsvp(rsvpData())
    const spy = vi.spyOn(HTMLFormElement.prototype, 'querySelector').mockReturnValue(null)
    try {
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      expect(wrapper.get('[data-rsvp-problem]').exists()).toBe(true)
    } finally {
      spy.mockRestore()
    }
  })

  it('names everyone who is missing and focuses the first one', async () => {
    const { wrapper } = mountRsvp(rsvpData())
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[data-rsvp-problem]').text()).toBe(tt('rsvp.chooseFor', { names: 'Rosa y Jorge' }))
    expect(wrapper.findAll('fieldset[data-unanswered]')).toHaveLength(2)
  })

  it('marks an invalid name with a distinct message instead of the save error', async () => {
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[0].setValue(true)
    await radios(wrapper, 2)[0].setValue(true)
    await wrapper.get('input[name="name"]').setValue('')
    const input = wrapper.get('input[name="name"]')
    const scroll = vi.fn()
    const focus = vi.fn()
    input.element.scrollIntoView = scroll
    input.element.focus = focus
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(saveRsvp).not.toHaveBeenCalled()
    expect(wrapper.get('[data-rsvp-problem]').text()).toBe(tt('rsvp.checkNames'))
    expect(wrapper.get('[role="status"]').text()).toBe('')
    expect(input.classes()).toContain('border-danger-500')
    expect(scroll).toHaveBeenCalled()
    expect(focus).toHaveBeenCalled()
  })

  it('shows a confirmed title and status chips in the summary', () => {
    const { wrapper } = mountRsvp(
      rsvpData({
        guest: { id: 1, name: 'Rosa', status: 'attending' },
        companions: [{ id: 2, name: 'Jorge', status: 'not-attending' }]
      })
    )
    expect(wrapper.get('[data-rsvp-confirmed]').text()).toBe(tt('rsvp.confirmedTitle'))
    expect(wrapper.get('[data-status="attending"]').text()).toBe(tt('rsvp.status.attending'))
    expect(wrapper.get('[data-status="not-attending"]').text()).toBe(tt('rsvp.status.not-attending'))
  })

  it('says "no reply" instead of "pending" once closed without an answer', () => {
    const { wrapper } = mountRsvp(rsvpData({ isOpen: false }))
    expect(wrapper.find('[data-rsvp-confirmed]').exists()).toBe(false)
    expect(wrapper.text()).toContain(tt('rsvp.status.noAnswer'))
    expect(wrapper.text()).not.toContain(tt('rsvp.status.pending'))
  })

  it('uses the validation message for server field errors, not the save error', async () => {
    failure.error = Object.assign(new Error('422'), {
      response: { status: 422, data: { errors: { 'companions.0.name': ['invalid_characters'] } } }
    })
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[0].setValue(true)
    await radios(wrapper, 2)[0].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe(tt('rsvp.checkNames'))
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

  it.each([[false, 'smooth'], [true, 'auto']])('after saving, scrolls to the outcome and moves the focus to the message (reduced motion: %s)', async (reduced, behavior) => {
    vi.stubGlobal('matchMedia', query => ({ matches: reduced && /reduce/.test(query), media: query }))
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    saveRsvp.mockResolvedValue({ data: { data: rsvpData({ guest: { id: 1, name: 'Rosa', status: 'attending' }, companions: [{ id: 2, name: 'Jorge', status: 'attending' }] }) } })
    const { wrapper } = mountRsvp(rsvpData(), {})
    document.body.appendChild(wrapper.element)
    await radios(wrapper, 1)[0].setValue(true)
    await radios(wrapper, 2)[0].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    const status = wrapper.get('[role="status"]')
    expect(scroll).toHaveBeenCalledWith({ behavior, block: 'start' })
    expect(document.activeElement).toBe(status.element)
    expect(status.attributes('tabindex')).toBe('-1')
    wrapper.element.remove()
    vi.unstubAllGlobals()
    delete Element.prototype.scrollIntoView
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

  it('sends the message and renamed companions only when they changed', async () => {
    saveRsvp.mockResolvedValue({ data: { data: rsvpData({ guest: { id: 1, name: 'Rosa', status: 'attending' }, note: 'Hola' }) } })
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[0].setValue(true)
    await radios(wrapper, 2)[0].setValue(true)
    await wrapper.get('input[name="name"]').setValue('  Jorge Pérez ')
    await wrapper.get('textarea').setValue('Hola')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(saveRsvp).toHaveBeenCalledWith({
      slug: 'xv-de-valentina',
      code: 'AB1234',
      guest: 'attending',
      companions: { 2: 'attending' },
      names: { 2: 'Jorge Pérez' },
      note: 'Hola'
    })
  })

  it('validates names and the message size before calling the API', async () => {
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[0].setValue(true)
    await radios(wrapper, 2)[0].setValue(true)
    await wrapper.get('input[name="name"]').setValue('J')
    await wrapper.get('textarea').setValue('x'.repeat(501))
    await wrapper.get('form').trigger('submit')

    expect(saveRsvp).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain(tt('rsvp.errors.too_short'))
    expect(wrapper.text()).toContain(tt('rsvp.errors.too_long'))
    expect(wrapper.text()).toContain('501/500')
  })

  it('shows server error codes next to the field', async () => {
    failure.error = Object.assign(new Error('422'), {
      response: { status: 422, data: { errors: { 'companions.0.name': ['invalid_characters'] } } }
    })
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[0].setValue(true)
    await radios(wrapper, 2)[0].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('input[name="name"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain(tt('rsvp.errors.invalid_characters'))
  })

  it('keeps the closed message for a closed window', async () => {
    failure.error = Object.assign(new Error('422'), { response: { status: 422, data: { errors: { rsvp: ['closed'] } } } })
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[1].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe(tt('rsvp.closedError'))
  })

  it('asks the guest to wait when the server throttles the answers (429)', async () => {
    failure.error = Object.assign(new Error('429'), { response: { status: 429 } })
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[1].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe(tt('rsvp.errors.too_many_attempts'))
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('tells to reload when the server rejects the companions as a whole', async () => {
    failure.error = Object.assign(new Error('422'), { response: { status: 422, data: { errors: { companions: ['invalid'] } } } })
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[1].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe(tt('rsvp.errors.invalid'))
  })

  it('falls back to the closed message for a 422 it cannot explain', async () => {
    failure.error = Object.assign(new Error('422'), { response: { status: 422, data: { errors: { other: ['x'] } } } })
    const { wrapper } = mountRsvp(rsvpData())
    await radios(wrapper, 1)[1].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe(tt('rsvp.closedError'))
  })

  it('throws petals only for a yes, and removes them when they finish', async () => {
    const saved = rsvpData({ guest: { id: 1, name: 'Rosa', status: 'attending' }, companions: [] })
    saveRsvp.mockResolvedValue({ data: { data: saved } })
    const { wrapper } = mountRsvp(rsvpData({ companions: [] }))
    await radios(wrapper, 1)[0].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    const petals = wrapper.findComponent({ name: 'InvitationPetals' })
    expect(petals.exists()).toBe(true)
    petals.vm.$emit('done')
    await flushPromises()
    expect(wrapper.findComponent({ name: 'InvitationPetals' }).exists()).toBe(false)
  })

  it('a decline gets no petals', async () => {
    saveRsvp.mockResolvedValue({ data: { data: rsvpData({ guest: { id: 1, name: 'Rosa', status: 'not-attending' }, companions: [] }) } })
    const { wrapper } = mountRsvp(rsvpData({ companions: [] }))
    await radios(wrapper, 1)[1].setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.findComponent({ name: 'InvitationPetals' }).exists()).toBe(false)
  })

  it('renders the saved message as plain text', () => {
    const { wrapper } = mountRsvp(
      rsvpData({ guest: { id: 1, name: 'Rosa', status: 'attending' }, companions: [], note: '<i>hola</i>' })
    )
    expect(wrapper.find('i').exists()).toBe(false)
    expect(wrapper.text()).toContain('<i>hola</i>')
  })
})
