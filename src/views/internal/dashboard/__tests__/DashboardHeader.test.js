import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/locales/i18n'
import DashboardHeader from '../DashboardHeader.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' } }
const mountHeader = props => mount(DashboardHeader, { props: { name: 'Los XV', startDate: '12/01/2027 18:00', ...props }, global: { plugins: [i18n], stubs } })

describe('DashboardHeader', () => {
  it('offers Edit event when a route is given', () => {
    const wrapper = mountHeader({ editTo: { name: 'edit-event', params: { id: 7 } } })
    const link = wrapper.findAll('a').find(a => a.text().includes('Edit event'))
    expect(link).toBeTruthy()
    expect(JSON.parse(link.attributes('data-to')).name).toBe('edit-event')
  })
  it('hides it for roles that cannot edit (no route)', () => {
    expect(mountHeader({ editTo: null }).text()).not.toContain('Edit event')
  })
})
