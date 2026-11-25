import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardStats from '../DashboardStats.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' } }
const mountStats = (rsvp, canEdit = true) => mount(DashboardStats, { props: { rsvp, canEdit }, global: { plugins: [i18n], stubs } })

beforeEach(() => setLocale('es'))

describe('DashboardStats', () => {
  it('shows the four figures', () => {
    const w = mountStats({ attending: 12, pending: 7, declined: 2, people: 21 })
    const value = key => w.get(`[data-stat=${key}] dd`).text()
    expect(value('attending')).toBe('12')
    expect(value('pending')).toBe('7')
    expect(value('declined')).toBe('2')
    expect(value('total')).toBe('21')
    expect(w.find('[data-testid=stats-empty]').exists()).toBe(false)
  })
  it('turns into an invitation to add guests when the list is empty', () => {
    const w = mountStats({ attending: 0, pending: 0, declined: 0, people: 0 })
    expect(w.find('dl').exists()).toBe(false)
    expect(w.get('[data-testid=stats-empty]').text()).toContain('Aún no tienes invitados')
    expect(w.get('a').attributes('data-to')).toBe('"/dashboard/guests"')
  })
  it('does not offer to add guests to a viewer', () => {
    expect(mountStats({ attending: 0, pending: 0, declined: 0, people: 0 }, false).find('a').exists()).toBe(false)
  })
  it('paints every stat dot with a real colour class', () => {
    const w = mountStats({ attending: 12, pending: 7, declined: 2, people: 21 })
    const dots = w.findAll('dt span[aria-hidden=true], span.rounded-full[aria-hidden=true]')
    expect(dots.length).toBeGreaterThanOrEqual(4)
    expect(w.get('[data-stat=pending]').html()).toContain('bg-gold-500')
    expect(w.html()).not.toMatch(/bg-[a-z]+-\d+\/\d{3}/)
  })
})
