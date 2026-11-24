import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

const { saveRsvp } = vi.hoisted(() => ({ saveRsvp: vi.fn() }))
vi.mock('@/services/PublicEvents/InvitationService', () => ({ default: { saveRsvp: (...args) => saveRsvp(...args) } }))

import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationRsvp from '../components/InvitationRsvp.vue'
import PackageSection from '../package/PackageSection'
import { el, q } from '../package/__tests__/dsl'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

const rsvpData = (overrides = {}) => ({
  guest: { id: 1, name: 'Rosa', status: 'pending' },
  companions: [],
  deadline: null,
  isOpen: true,
  ...overrides
})

const COMMENTS = { type: 'comments', title: 'Deseos', text: null, data: { items: [] } }

function context(sections) {
  return {
    invitation: ref({ locale: 'es', sections }),
    locale: ref('es'),
    tt,
    formatDate: () => '10 de diciembre',
    slug: () => 'xv',
    code: () => 'AB1234',
    updateSection: vi.fn(),
    changeLanguage: () => {}
  }
}

const rsvpSection = data => ({ type: 'rsvp', title: 'RSVP', text: null, data })

function mountNative(sections, data) {
  return mount(InvitationRsvp, {
    props: { section: rsvpSection(data) },
    global: { provide: { [INVITATION_KEY]: context(sections) } }
  })
}

function mountPackage(sections, data) {
  const section = rsvpSection(data)
  return mount(PackageSection, {
    props: { ast: el('div', {}, q('rsvp')), section, position: 1, count: sections.length, base: 'https://a.test/p/' },
    global: { provide: { [INVITATION_KEY]: context(sections) } }
  })
}

async function answerYes(wrapper) {
  await wrapper.get('input[name="rsvp-1"][value="attending"]').setValue(true)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

beforeEach(() => {
  saveRsvp.mockReset()
  saveRsvp.mockResolvedValue({ data: { data: rsvpData({ guest: { id: 1, name: 'Rosa', status: 'attending' }, note: 'Guardada' }) } })
})

describe.each([
  ['native section', mountNative],
  ['package q-rsvp', mountPackage]
])('RSVP note with %s', (_label, mountIt) => {
  it('shows the note when the invitation has no comments section', () => {
    const wrapper = mountIt([rsvpSection(rsvpData())], rsvpData())
    expect(wrapper.find('textarea[name="note"]').exists()).toBe(true)
  })

  it('keeps the note when the module is active but the organizer switched the section off (no comments in payload)', async () => {
    const wrapper = mountIt([{ type: 'cover', data: {} }, rsvpSection(rsvpData())], rsvpData())
    expect(wrapper.find('textarea[name="note"]').exists()).toBe(true)
    await wrapper.get('textarea').setValue('Hola')
    await answerYes(wrapper)
    expect(saveRsvp.mock.calls[0][0].note).toBe('Hola')
  })

  it('hides the note when the comments wall is shown to the guest', () => {
    const wrapper = mountIt([rsvpSection(rsvpData()), COMMENTS], rsvpData())
    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(wrapper.find('[data-rsvp-note]').exists()).toBe(false)
  })

  it('sends no `note` key when hidden, so the saved note is left as it is', async () => {
    const wrapper = mountIt([rsvpSection(rsvpData({ note: 'Antigua' })), COMMENTS], rsvpData({ note: 'Antigua' }))
    await answerYes(wrapper)
    expect(saveRsvp).toHaveBeenCalledTimes(1)
    expect(saveRsvp.mock.calls[0][0]).not.toHaveProperty('note')
  })

  it('hides the saved note in the summary while the wall is shown', async () => {
    const answered = rsvpData({ guest: { id: 1, name: 'Rosa', status: 'attending' }, note: 'Guardada' })
    const wrapper = mountIt([rsvpSection(answered), COMMENTS], answered)
    expect(wrapper.text()).not.toContain(tt('rsvp.yourNote'))
  })

  it('shows the saved note in the summary when the wall is not shown', () => {
    const answered = rsvpData({ guest: { id: 1, name: 'Rosa', status: 'attending' }, note: 'Guardada' })
    const wrapper = mountIt([rsvpSection(answered)], answered)
    expect(wrapper.text()).toContain('Guardada')
  })
})

describe('RSVP of an unsaved sample guest (editor preview)', () => {
  const sample = () => rsvpData({ guest: { id: 1, name: 'Invitada/o', status: null }, companions: [{ id: 2, name: 'Luis', status: null }] })

  it('is a pending form, never a summary with a raw status key', () => {
    const wrapper = mountNative([rsvpSection(sample())], sample())
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('rsvp.status')
  })

  it('labels a missing status as no reply when the summary is shown (closed RSVP)', () => {
    const closed = { ...sample(), isOpen: false }
    const wrapper = mountNative([rsvpSection(closed)], closed)
    expect(wrapper.text()).not.toContain('rsvp.status')
    expect(wrapper.text()).toContain(tt('rsvp.status.noAnswer'))
  })
})
