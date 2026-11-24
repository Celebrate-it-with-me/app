import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

vi.mock('@/services/PublicEvents/InvitationService', () => ({ default: { saveRsvp: vi.fn() } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { slug: 'xv-de-valentina', code: 'AB 12' } }) }))
vi.mock('@/services/axios', () => ({ CWM_API: { defaults: { baseURL: 'http://api.test/api/v1/app/' } } }))

import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import { icsUrl } from '../composables/calendarLinks'
import InvitationRsvp from '../components/InvitationRsvp.vue'
import InvitationRsvpCalendar from '../components/InvitationRsvpCalendar.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })
const calendar = (extra = {}) => ({
  title: 'Los XV de Valentina',
  startsAt: '2027-01-02T19:00:00',
  endsAt: '2027-01-02T23:00:00',
  timezone: 'America/New_York',
  location: { name: 'Salón Cristal', address: '1200 NW 7th Street', links: { google: 'https://maps.google.com/?q=x', apple: null, waze: null } },
  google: 'https://calendar.google.com/calendar/render?action=TEMPLATE',
  icsPath: 'calendar.ics',
  ...extra
})
const context = (sections = []) => ({
  invitation: ref({ sections }),
  tt,
  formatDate: () => '10 de diciembre',
  slug: () => 'xv-de-valentina',
  code: () => 'AB1234',
  updateSection: vi.fn()
})
const mountCard = (props, sections) => mount(InvitationRsvpCalendar, { props, global: { provide: { [INVITATION_KEY]: context(sections) } } })

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('InvitationRsvpCalendar', () => {
  it('joins the relative .ics path to the invitation address', () => {
    expect(icsUrl('s', 'c', { icsPath: 'calendar.ics' })).toBe('http://api.test/api/v1/app/invitation/s/c/calendar.ics')
    expect(icsUrl('s', 'c', { icsPath: '/x.ics' })).toBe('http://api.test/api/v1/app/invitation/s/c/x.ics')
    expect(icsUrl('s', 'c', null)).toBe('http://api.test/api/v1/app/invitation/s/c/calendar.ics')
  })

  it('offers Google Calendar and the .ics file, with the engine hooks', () => {
    const wrapper = mountCard({ calendar: calendar() }, [{ type: 'locations' }])
    expect(wrapper.get('.inv-rsvp-calendar').attributes('aria-label')).toBe(tt('rsvp.calendar.title'))
    const google = wrapper.get('.inv-rsvp-calendar__google')
    expect(google.attributes('href')).toBe('https://calendar.google.com/calendar/render?action=TEMPLATE')
    expect(google.attributes('target')).toBe('_blank')
    expect(wrapper.get('.inv-rsvp-calendar__ics').attributes('href')).toBe('http://api.test/api/v1/app/invitation/xv-de-valentina/AB%2012/calendar.ics')
    expect(wrapper.get('.inv-rsvp-calendar__ics').text()).toBe(tt('rsvp.calendar.download'))
  })

  it('drops a Google link that is not https', () => {
    const wrapper = mountCard({ calendar: calendar({ google: 'javascript:alert(1)' }) })
    expect(wrapper.find('.inv-rsvp-calendar__google').exists()).toBe(false)
  })

  it('scrolls to the locations section when there is one', async () => {
    document.body.innerHTML = '<section id="locations"></section>'
    const wrapper = mountCard({ calendar: calendar() }, [{ type: 'locations' }])
    const button = wrapper.get('.inv-rsvp-calendar__directions')
    expect(button.element.tagName).toBe('BUTTON')
    await button.trigger('click')
    expect(document.getElementById('locations').scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    document.body.innerHTML = ''
  })

  it('uses the map link of the main place when the invitation has no locations section', () => {
    const link = mountCard({ calendar: calendar() }, [{ type: 'rsvp' }]).get('.inv-rsvp-calendar__directions')
    expect(link.attributes('href')).toBe('https://maps.google.com/?q=x')
    expect(link.attributes('rel')).toBe('noopener')
  })

  it('has no directions at all without a section and without a map link', () => {
    expect(mountCard({ calendar: calendar({ location: null }) }, []).find('.inv-rsvp-calendar__directions').exists()).toBe(false)
  })
})

describe('InvitationRsvp and the calendar card', () => {
  const data = (guest, extra = {}) => ({
    guest: { id: 1, name: 'Rosa', status: guest },
    companions: [],
    deadline: null,
    isOpen: true,
    calendar: calendar(),
    ...extra
  })
  const mountRsvp = rsvp => mount(InvitationRsvp, { props: { section: { type: 'rsvp', title: 'x', text: null, data: rsvp } }, global: { provide: { [INVITATION_KEY]: context([{ type: 'locations' }]) } } })

  it('shows the card to a guest who said yes, even when the RSVP is closed', () => {
    expect(mountRsvp(data('attending')).find('[data-rsvp-calendar]').exists()).toBe(true)
    expect(mountRsvp(data('attending', { isOpen: false })).find('[data-rsvp-calendar]').exists()).toBe(true)
  })

  it('does not show it for a no, a pending guest or an answer without calendar', () => {
    expect(mountRsvp(data('not-attending')).find('[data-rsvp-calendar]').exists()).toBe(false)
    expect(mountRsvp(data('pending')).find('[data-rsvp-calendar]').exists()).toBe(false)
    expect(mountRsvp(data('attending', { calendar: undefined })).find('[data-rsvp-calendar]').exists()).toBe(false)
  })
})
