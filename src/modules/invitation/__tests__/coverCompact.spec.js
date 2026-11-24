import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationCover from '../components/InvitationCover.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })
const formatDate = (at, options) => new Intl.DateTimeFormat('es', options).format(new Date(at))

function mountCover({ eventName = 'Los XV de Valentina', description = 'Celebra con nosotros.', text = 'Quiero compartir este día.', guest = 'Rosa Fernández', rsvp = true } = {}) {
  const invitation = ref({
    event: { typeSlug: 'quinceanera', startsAt: '2027-01-02T19:00:00' },
    guest: { name: guest },
    sections: rsvp ? [{ type: 'rsvp' }] : []
  })
  return mount(InvitationCover, {
    props: { section: { type: 'cover', title: 'Te invito a celebrar', text, data: { eventName, description, image: null, focus: null } } },
    global: { provide: { [INVITATION_KEY]: { invitation, tt, formatDate } } }
  })
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('InvitationCover compact phone layout', () => {
  it('shows one intro line: the description when there is one', () => {
    const wrapper = mountCover()
    const intro = wrapper.findAll('.inv-cover__description')
    expect(intro).toHaveLength(1)
    expect(intro[0].text()).toBe('Celebra con nosotros.')
    expect(wrapper.text()).not.toContain('Quiero compartir')
  })

  it('falls back to the section phrase, and to nothing when neither exists', () => {
    expect(mountCover({ description: null }).get('.inv-cover__description').text()).toBe('Quiero compartir este día.')
    expect(mountCover({ description: '', text: null }).find('.inv-cover__description').exists()).toBe(false)
  })

  it('steps the name and the guest down for long text so the button stays on the first screen', () => {
    const short = mountCover()
    expect(short.get('.inv-cover__name').classes()).toContain('text-[2.75rem]')
    expect(short.get('.inv-cover__guest p:last-child').classes()).toContain('text-[2.25rem]')
    const mid = mountCover({ eventName: 'Los XV de María Valentina Guadalupe' })
    expect(mid.get('.inv-cover__name').classes()).toContain('text-[2.25rem]')
    const long = mountCover({ eventName: 'Boda de María Guadalupe Fernández-Villaseñor y José Alejandro Rodríguez', guest: 'Rosa María del Carmen Fernández-Hernández' })
    expect(long.get('.inv-cover__name').classes()).toContain('text-[1.75rem]')
    expect(long.get('.inv-cover__guest p:last-child').classes()).toContain('text-[1.75rem]')
  })

  it('keeps the date lockup and the guest card, and the button goes to the RSVP', async () => {
    document.body.innerHTML = '<section id="rsvp"></section>'
    const wrapper = mountCover()
    expect(wrapper.get('.inv-cover__date').text()).toContain('2')
    expect(wrapper.get('.inv-cover__guest').text()).toContain(tt('invitedFor'))
    await wrapper.get('.inv-cover__cta').trigger('click')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    document.body.innerHTML = ''
  })

  it('draws no button when the invitation has no RSVP', () => {
    expect(mountCover({ rsvp: false }).find('.inv-cover__cta').exists()).toBe(false)
  })
})
