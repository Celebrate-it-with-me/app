import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

const { saveRsvp, failure } = vi.hoisted(() => ({ saveRsvp: vi.fn(), failure: { error: null } }))
vi.mock('@/services/PublicEvents/InvitationService', () => ({
  default: { saveRsvp: (...args) => (failure.error ? Promise.reject(failure.error) : saveRsvp(...args)) }
}))

import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationRsvp from '../components/InvitationRsvp.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

const menu = (overrides = {}) => ({
  title: null,
  description: null,
  allowMultiple: false,
  editable: true,
  items: [
    { id: 1, name: 'Ensalada', type: 'starter', dietType: 'vegan', notes: 'Con nueces', imageUrl: null },
    { id: 2, name: 'Sopa', type: 'starter', dietType: 'regular', notes: null, imageUrl: 'https://cdn.test/sopa.jpg' },
    { id: 3, name: 'Pollo', type: 'main', dietType: 'keto', notes: null, imageUrl: null },
    { id: 4, name: 'Pasta', type: 'main', dietType: null, notes: null, imageUrl: null },
    { id: 5, name: 'Flan', type: 'dessert', dietType: null, notes: null, imageUrl: null },
    { id: 6, name: 'Rara', type: 'weird', dietType: null, notes: null, imageUrl: null }
  ],
  ...overrides
})

function data(overrides = {}) {
  return {
    guest: { id: 10, name: 'Rosa', status: 'pending', menuItemIds: [] },
    companions: [{ id: 20, name: 'Jorge', status: 'pending', menuItemIds: [] }],
    deadline: null,
    isOpen: true,
    menu: menu(),
    ...overrides
  }
}

function mountRsvp(d, { preview = false } = {}) {
  let wrapper
  const updateSection = (_type, next) => wrapper.setProps({ section: { type: 'rsvp', title: 'RSVP', text: null, data: next } })
  wrapper = mount(InvitationRsvp, {
    props: { section: { type: 'rsvp', title: 'RSVP', text: null, data: d } },
    global: {
      provide: {
        [INVITATION_KEY]: {
          invitation: ref({ locale: 'es' }),
          tt,
          formatDate: () => '10 de diciembre',
          slug: () => 'xv',
          code: () => 'AB1234',
          updateSection,
          preview
        }
      }
    }
  })
  return wrapper
}

const radios = (w, id) => w.findAll(`input[name="rsvp-${id}"]`)
const card = (w, id) => w.find(`[data-menu-person="${id}"]`)
const dish = (w, person, id) => card(w, person).get(`[data-dish="${id}"]`)
const attend = async (w, id, i = 0) => radios(w, id)[i].setValue(true)
const send = async w => {
  await w.get('form').trigger('submit')
  await flushPromises()
}

beforeEach(() => {
  saveRsvp.mockReset()
  failure.error = null
})

describe('InvitationRsvp menu step', () => {
  it('is hidden until someone attends, then shows one card per attendee', async () => {
    const w = mountRsvp(data())
    expect(w.find('[data-rsvp-menu]').exists()).toBe(false)
    await attend(w, 10)
    expect(card(w, 10).exists()).toBe(true)
    expect(card(w, 20).exists()).toBe(false)
    await attend(w, 20)
    expect(card(w, 20).exists()).toBe(true)
    expect(w.text()).toContain(tt('rsvp.menu.title'))
    expect(w.text()).toContain(tt('rsvp.menu.help'))
  })

  it('uses the menu title and description when given, and groups dishes by type', async () => {
    const w = mountRsvp(data({ menu: menu({ title: 'Cena', description: 'Elige' }) }))
    await attend(w, 10)
    expect(w.text()).toContain('Cena')
    expect(w.text()).toContain('Elige')
    expect(card(w, 10).text()).toContain(tt('rsvp.menu.types.starter'))
    expect(card(w, 10).text()).toContain(tt('rsvp.menu.types.dessert'))
    expect(card(w, 10).text()).not.toContain('Rara')
  })

  it('shows diet labels, notes and images; unknown diets fall back to the raw value', async () => {
    const w = mountRsvp(data())
    await attend(w, 10)
    expect(dish(w, 10, 1).text()).toContain(tt('rsvp.menu.diets.vegan'))
    expect(dish(w, 10, 1).text()).toContain('Con nueces')
    expect(dish(w, 10, 2).text()).not.toContain('Regular')
    expect(dish(w, 10, 2).find('img').attributes('src')).toBe('https://cdn.test/sopa.jpg')
    expect(dish(w, 10, 3).text()).toContain('keto')
    expect(dish(w, 10, 4).find('img').exists()).toBe(false)
  })

  it('allows a single dish per type and lets the guest unselect it', async () => {
    const w = mountRsvp(data())
    await attend(w, 10)
    await dish(w, 10, 1).trigger('click')
    await dish(w, 10, 2).trigger('click')
    expect(dish(w, 10, 1).attributes('aria-pressed')).toBe('false')
    expect(dish(w, 10, 2).attributes('aria-pressed')).toBe('true')
    await dish(w, 10, 3).trigger('click')
    expect(dish(w, 10, 2).attributes('aria-pressed')).toBe('true')
    await dish(w, 10, 2).trigger('click')
    expect(dish(w, 10, 2).attributes('aria-pressed')).toBe('false')
  })

  it('is optional: sends empty lists when nothing is chosen', async () => {
    saveRsvp.mockResolvedValue({ data: { data: data({ guest: { id: 10, name: 'Rosa', status: 'attending', menuItemIds: [] }, companions: [] }) } })
    const w = mountRsvp(data())
    await attend(w, 10)
    await attend(w, 20, 1)
    await send(w)
    expect(saveRsvp.mock.calls[0][0].menu).toEqual({ guest: [], companions: { 20: [] } })
  })

  it('sends the chosen dishes per person', async () => {
    const saved = data({
      guest: { id: 10, name: 'Rosa', status: 'attending', menuItemIds: [1, 4] },
      companions: [{ id: 20, name: 'Jorge', status: 'attending', menuItemIds: [5] }]
    })
    saveRsvp.mockResolvedValue({ data: { data: saved } })
    const w = mountRsvp(data())
    await attend(w, 10)
    await attend(w, 20)
    await dish(w, 10, 1).trigger('click')
    await dish(w, 10, 4).trigger('click')
    await dish(w, 20, 5).trigger('click')
    await send(w)
    expect(saveRsvp.mock.calls[0][0].menu).toEqual({ guest: [1, 4], companions: { 20: [5] } })
    // saved: back to a summary that lists the dishes
    expect(w.find('form').exists()).toBe(false)
    expect(w.text()).toContain('Ensalada · Pasta')
    expect(w.text()).toContain('Flan')
  })

  it('drops a companion\'s dishes when they stop attending, and everyone\'s when the guest declines', async () => {
    saveRsvp.mockResolvedValue({
      data: { data: data({ guest: { id: 10, name: 'Rosa', status: 'not-attending' }, companions: [{ id: 20, name: 'Jorge', status: 'not-attending' }] }) }
    })
    const w = mountRsvp(data())
    await attend(w, 10)
    await attend(w, 20)
    await dish(w, 10, 1).trigger('click')
    await dish(w, 20, 5).trigger('click')
    await attend(w, 20, 1)
    expect(card(w, 20).exists()).toBe(false)
    await attend(w, 20, 0)
    expect(dish(w, 20, 5).attributes('aria-pressed')).toBe('false')
    await dish(w, 20, 5).trigger('click')

    await attend(w, 10, 1) // main declines
    expect(w.find('[data-rsvp-menu]').exists()).toBe(false)
    await send(w)
    expect(saveRsvp.mock.calls[0][0].menu).toEqual({ guest: [], companions: { 20: [] } })
  })

  it('reopens a saved RSVP with the previous choices and can edit them', async () => {
    const saved = data({
      guest: { id: 10, name: 'Rosa', status: 'attending', menuItemIds: [1, 3, 999] },
      companions: []
    })
    saveRsvp.mockResolvedValue({ data: { data: { ...saved, guest: { ...saved.guest, menuItemIds: [2, 3] } } } })
    const w = mountRsvp(saved)
    expect(w.find('form').exists()).toBe(false)
    expect(w.text()).toContain('Ensalada · Pollo')
    await w.get('button').trigger('click')
    expect(dish(w, 10, 1).attributes('aria-pressed')).toBe('true')
    await dish(w, 10, 2).trigger('click')
    await send(w)
    expect(saveRsvp.mock.calls[0][0].menu.guest).toEqual([2, 3])
    expect(w.text()).toContain('Sopa · Pollo')
  })

  it('shows a readable message for a 422 on menu ids', async () => {
    failure.error = Object.assign(new Error('422'), {
      response: { status: 422, data: { errors: { 'guest.menuItemIds': ['invalid'] } } }
    })
    const w = mountRsvp(data())
    await attend(w, 10)
    await attend(w, 20, 1)
    await send(w)
    expect(w.get('[role="status"]').text()).toBe(tt('rsvp.menu.errors.invalid'))
    expect(w.get('[role="alert"]').text()).toBe(tt('rsvp.menu.errors.invalid'))
    expect(w.find('form').exists()).toBe(true)
  })

  it.each([
    ['no menu', { menu: undefined }],
    ['empty menu', { menu: menu({ items: [] }) }],
    ['read-only menu', { menu: menu({ editable: false }) }],
    ['closed window', { isOpen: false }]
  ])('does not offer the step or send dishes with %s', async (_label, overrides) => {
    const w = mountRsvp(data(overrides))
    if (!w.find('form').exists()) return expect(w.find('[data-rsvp-menu]').exists()).toBe(false)
    saveRsvp.mockResolvedValue({ data: { data: data({ ...overrides, guest: { id: 10, name: 'Rosa', status: 'attending' }, companions: [] }) } })
    await attend(w, 10)
    await attend(w, 20, 1)
    expect(w.find('[data-rsvp-menu]').exists()).toBe(false)
    await send(w)
    expect(saveRsvp.mock.calls[0][0]).not.toHaveProperty('menu')
  })

  it('works when the response omits menuItemIds (old API)', async () => {
    const old = data({ guest: { id: 10, name: 'Rosa', status: 'attending' }, companions: [] })
    const w = mountRsvp(old)
    await w.get('button').trigger('click')
    expect(dish(w, 10, 1).attributes('aria-pressed')).toBe('false')
  })

  it('falls back to the assigned name in a card and survives a response without that companion', async () => {
    saveRsvp.mockResolvedValue({ data: { data: data({ guest: { id: 10, name: 'Rosa', status: 'attending' }, companions: [] }) } })
    const w = mountRsvp(data())
    await attend(w, 10)
    await attend(w, 20)
    await w.get('input[name="name"]').setValue('')
    expect(card(w, 20).get('legend').text()).toBe('Jorge')
    await w.get('input[name="name"]').setValue('Jorge')
    await dish(w, 20, 5).trigger('click')
    await send(w)
    expect(saveRsvp).toHaveBeenCalledTimes(1)
    expect(w.find('form').exists()).toBe(false)
  })
})
