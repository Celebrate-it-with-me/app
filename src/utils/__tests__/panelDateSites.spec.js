import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { shortDate } from '@/modules/purchases/utils/purchases'
import { formatPaidOn } from '@/modules/padrinos/utils/padrinos'
import { formatEstimatedEnd } from '@/modules/maintenance/utils/maintenance'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import EventCard from '@/modules/events/components/EventCard.vue'
import ItemRow from '@/modules/budget/components/ItemRow.vue'
import PlanTaskRow from '@/modules/assistant/components/PlanTaskRow.vue'
import DashboardHero from '@/views/internal/dashboard/DashboardHero.vue'
import CommentRow from '@/modules/comments/components/CommentRow.vue'
import CommentDetails from '@/modules/comments/components/CommentDetails.vue'

vi.mock('@/services/axios', () => ({ CWM_API: { get: vi.fn(), post: vi.fn() } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/dashboard' }), useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/modules/template-picker/components/InvitationPreviewSheet.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/modules/template-picker/components/InvitationMiniature.vue', () => ({ default: { template: '<div />' } }))

const NUMERIC = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/
const stubs = { RouterLink: { props: ['to'], template: '<a><slot /></a>' } }
const textOf = wrapper => wrapper.text().replace(/\s+/g, ' ')

function setup() {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const store = useEventsStore()
  store.eventTypes = [{ id: 1, slug: 'quinceanera', name: 'Quinceañera' }]
  return { store, global: { plugins: [i18n, pinia], stubs } }
}

beforeEach(() => setLocale('es'))

describe('account and admin helpers', () => {
  it('purchases: paidAt is an instant printed as a spelled-out date', () => {
    expect(shortDate('2026-11-13T15:00:00-05:00', 'es')).toMatch(/^13 nov 2026$/)
    expect(shortDate('2026-11-13T15:00:00-05:00', 'en')).toBe('Nov 13, 2026')
    expect(shortDate(null)).toBe('')
  })

  it('padrinos: a plain day never moves with the zone', () => {
    expect(formatPaidOn('2026-09-12', 'es')).toMatch(/^12 sept? 2026$/)
    expect(formatPaidOn('nope')).toBe('')
  })

  it('maintenance: the estimated end carries a 12 hour time', () => {
    expect(formatEstimatedEnd('2026-11-13T20:30:00Z', 'en')).toMatch(/Nov 13, \d{1,2}:30 [AP]M/)
  })
})

describe('event dates in the panel', () => {
  const event = { id: 7, eventName: 'Los XV de Valentina', eventType: 1, status: 'draft', startDate: '01/02/2027 18:00', timezone: 'America/New_York', guestsCount: 0, rsvpResponse: 0 }

  it('EventCard spells the date out, from startDate or from startsAt', () => {
    const options = setup()
    expect(textOf(mount(EventCard, { props: { event }, global: options.global }))).toContain('2 de enero de 2027')
    const iso = mount(EventCard, { props: { event: { ...event, startsAt: '2027-01-02T18:00:00-05:00' } }, global: options.global })
    expect(textOf(iso)).toContain('2 de enero de 2027')
    expect(textOf(iso)).not.toMatch(NUMERIC)
  })

  it('DashboardHero names the weekday and never prints 01/02/2027', () => {
    const options = setup()
    const wrapper = mount(DashboardHero, {
      props: { eventId: 7, name: 'x', startDate: '01/02/2027 18:00', plan: { done: 0, total: 1 }, published: false, canViewGuests: true, canEdit: false, editTo: '/x' },
      global: options.global
    })
    expect(textOf(wrapper)).toContain('sábado, 2 de enero de 2027')
    expect(textOf(wrapper)).not.toMatch(NUMERIC)
  })

  it('DashboardHero reads an ISO start in the zone it is given', () => {
    const options = setup()
    const wrapper = mount(DashboardHero, {
      props: { eventId: 7, name: 'x', startDate: '2027-01-03T02:30:00Z', timezone: 'America/New_York', plan: { done: 0, total: 1 }, published: false, canViewGuests: true, canEdit: false, editTo: '/x' },
      global: options.global
    })
    expect(textOf(wrapper)).toContain('sábado, 2 de enero de 2027')
  })

  it('ItemRow writes the due date and the payment dates spelled out', async () => {
    const options = setup()
    const wrapper = mount(ItemRow, {
      props: { item: { id: 1, title: 'Salón', dueDate: '2027-01-02', owed: 100, paid: 0, remaining: 100, estimatedCost: 100, agreedCost: null, padrinos: [], payments: [{ id: 1, amount: 10, paidOn: '2027-01-03' }], status: 'unpaid' }, currency: 'USD', canEdit: true },
      global: options.global
    })
    expect(textOf(wrapper)).toContain('2 ene 2027')
    wrapper.vm.open = true
    await wrapper.vm.$nextTick()
    expect(textOf(wrapper)).toContain('3 ene 2027')
    expect(textOf(wrapper)).not.toMatch(NUMERIC)
  })

  it('PlanTaskRow says when a snoozed task comes back, without a numeric date', () => {
    const options = setup()
    const wrapper = mount(PlanTaskRow, {
      props: {
        eventId: 7,
        task: { key: 'a', title: 'Tarea', status: 'snoozed', snoozedUntil: '2027-01-09T12:00:00Z', blockedBy: [], moduleKey: null, route: null, doneBy: null },
        titles: {}
      },
      global: options.global
    })
    expect(textOf(wrapper)).not.toMatch(NUMERIC)
  })
})

describe('comment moments', () => {
  const comment = { id: 1, comment: 'Hola', authorName: 'Ana', status: 'visible', created_at: '2027-01-02T21:30:00Z' }

  it('shows the time in the zone of the event, in 12 hours', () => {
    const options = setup()
    options.store.activeEvent = { id: 7, timezone: 'America/New_York' }
    expect(textOf(mount(CommentRow, { props: { comment }, global: options.global }))).toMatch(/4:30 p\.\s?m\./)
    expect(textOf(mount(CommentDetails, { props: { comment }, global: options.global }))).toMatch(/2 ene 2027, 4:30 p\.\s?m\./)
  })

  it('shows nothing when the API sends a phrase instead of a date', () => {
    const options = setup()
    const text = textOf(mount(CommentRow, { props: { comment: { ...comment, created_at: 'hace 2 horas' } }, global: options.global }))
    expect(text).not.toMatch(/\d:\d\d/)
  })
})
