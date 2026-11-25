import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'

vi.mock('@/modules/template-picker/components/InvitationPreviewSheet.vue', () => ({
  default: { props: ['open', 'eventId'], template: '<div data-testid="preview-sheet" :data-open="open"></div>' }
}))

vi.mock('@/modules/template-picker/components/InvitationMiniature.vue', () => ({
  default: {
    props: ['eventId', 'live', 'fallbackImage', 'name', 'dateLabel'],
    template: '<div data-testid="mini" :data-event="eventId" :data-live="String(live)" :data-fallback="fallbackImage" :data-name="name"></div>'
  }
}))

import DashboardHero from '../DashboardHero.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' } }
const editTo = { name: 'edit-event', params: { id: 7 } }
const inDays = n => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} 18:00`
}
const mountHero = (props = {}) => {
  const pinia = createPinia()
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return mount(DashboardHero, {
    props: { eventId: 7, name: 'Los XV de Valentina', startDate: inDays(142), plan: { done: 4, total: 9 }, published: true, canViewGuests: true, canEdit: true, editTo, ...props },
    global: { plugins: [i18n, pinia], stubs }
  })
}
const button = (w, id) => w.find(`[data-testid=${id}]`)

beforeEach(() => setLocale('es'))

describe('DashboardHero countdown', () => {
  it('shows the days as the protagonist number', () => {
    const c = button(mountHero(), 'hero-countdown')
    expect(c.attributes('data-kind')).toBe('future')
    expect(c.text()).toContain('142')
    expect(c.text()).toContain('días')
  })
  it('uses the singular for one day', () => {
    expect(button(mountHero({ startDate: inDays(1) }), 'hero-countdown').text()).toMatch(/^1\s*día para/)
  })
  it('says it is today', () => {
    const c = button(mountHero({ startDate: inDays(0) }), 'hero-countdown')
    expect(c.attributes('data-kind')).toBe('today')
    expect(c.text()).toContain('hoy')
  })
  it('says it already happened', () => {
    const c = button(mountHero({ startDate: inDays(-5) }), 'hero-countdown')
    expect(c.attributes('data-kind')).toBe('past')
    expect(c.text()).toContain('Ya pasó')
  })
  it('without a date offers to set it (editors only)', () => {
    const w = mountHero({ startDate: '' })
    expect(button(w, 'hero-countdown').attributes('data-kind')).toBe('none')
    expect(button(w, 'hero-countdown').text()).toContain('Definir la fecha')
    expect(button(mountHero({ startDate: '', canEdit: false }), 'hero-countdown').text()).not.toContain('Definir la fecha')
  })
})

describe('DashboardHero published', () => {
  it('Share goes to the guest list, where each invitation is sent with its code', () => {
    const share = button(mountHero(), 'hero-share')
    expect(share.text()).toContain('Compartir')
    expect(JSON.parse(share.attributes('data-to'))).toBe('/dashboard/guests')
  })
  it('says Share in English', () => {
    setLocale('en')
    expect(button(mountHero(), 'hero-share').text()).toContain('Share')
  })
  it('hides Share from people who cannot see guests', () => {
    const w = mountHero({ canViewGuests: false })
    expect(button(w, 'hero-share').exists()).toBe(false)
    expect(button(w, 'hero-publish').exists()).toBe(false)
  })
  it('has no publish button and opens the preview', async () => {
    const w = mountHero()
    expect(button(w, 'hero-publish').exists()).toBe(false)
    expect(button(w, 'hero-draft-hint').exists()).toBe(false)
    await button(w, 'hero-view').trigger('click')
    expect(w.get('[data-testid=preview-sheet]').attributes('data-open')).toBe('true')
  })
})

describe('DashboardHero draft', () => {
  it('makes Publish the main action and hides sharing, with a short reason', () => {
    const w = mountHero({ published: false })
    expect(button(w, 'hero-publish').exists()).toBe(true)
    expect(JSON.parse(button(w, 'hero-publish').attributes('data-to')).name).toBe('edit-event')
    expect(button(w, 'hero-share').exists()).toBe(false)
    expect(button(w, 'hero-draft-hint').text()).toContain('borrador')
    expect(button(w, 'hero-status').text()).toContain('Borrador')
  })
})

describe('DashboardHero roles', () => {
  it('a viewer sees the event but no edit, publish or preview actions', () => {
    const w = mountHero({ canEdit: false, published: false })
    ;['hero-edit', 'hero-publish', 'hero-view', 'hero-share'].forEach(id => expect(button(w, id).exists()).toBe(false))
  })
  it('shows Edit event for editors', () => {
    expect(button(mountHero(), 'hero-edit').text()).toContain('Editar')
    expect(JSON.parse(button(mountHero(), 'hero-edit').attributes('data-to')).name).toBe('edit-event')
  })
})

describe('DashboardHero phone', () => {
  it('puts the real miniature of the event inside the phone frame', () => {
    const w = mountHero({ image: 'https://cdn.test/classic.webp' })
    const mini = w.find('[data-testid=hero-phone] [data-testid=mini]')
    expect(mini.exists()).toBe(true)
    expect(mini.attributes('data-event')).toBe('7')
    expect(mini.attributes('data-live')).toBe('true')
    expect(mini.attributes('data-fallback')).toBe('https://cdn.test/classic.webp')
    expect(mini.attributes('data-name')).toBe('Los XV de Valentina')
  })
  it('skips the live view for people who cannot edit', () => {
    expect(mountHero({ canEdit: false }).find('[data-testid=mini]').attributes('data-live')).toBe('false')
  })
})

describe('DashboardHero plan progress', () => {
  it('shows the plan as steps, never as "ready"', () => {
    const w = mountHero({ plan: { done: 7, total: 18 } })
    expect(w.get('[data-testid=hero-plan]').text()).toBe('Plan de organización · 7 de 18 pasos del plan')
    expect(w.get('[role=progressbar]').attributes('aria-valuenow')).toBe('39')
    expect(w.text()).not.toContain('listo')
  })
  it('says it in English', () => {
    setLocale('en')
    expect(mountHero({ plan: { done: 1, total: 2 } }).get('[data-testid=hero-plan]').text()).toBe('Organization plan · 1 of 2 plan steps')
  })
  it('hides the figure without assistant data or with an empty plan, instead of 0 % or 100 %', () => {
    expect(mountHero({ plan: null }).find('[data-testid=hero-plan]').exists()).toBe(false)
    expect(mountHero({ plan: { done: 0, total: 0 } }).find('[role=progressbar]').exists()).toBe(false)
  })
  it('caps the bar at 100 and ignores a negative count', () => {
    expect(mountHero({ plan: { done: 12, total: 9 } }).get('[role=progressbar]').attributes('aria-valuenow')).toBe('100')
    expect(mountHero({ plan: { done: -2, total: 9 } }).get('[role=progressbar]').attributes('aria-valuenow')).toBe('0')
  })
})
