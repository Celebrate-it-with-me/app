import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardCard from '../DashboardCard.vue'
import DashboardAction from '../DashboardAction.vue'

const RouterLink = { props: ['to'], template: '<a :data-to="to"><slot /></a>' }

describe('DashboardCard', () => {
  it('is flat like the prototype: 24 px corners, cream-300 hairline, no shadow, Fraunces semibold h2', () => {
    const w = mount(DashboardCard, { props: { title: 'Confirmaciones' }, slots: { actions: '<a>Ver</a>', default: '<p>body</p>' } })
    expect(w.element.tagName).toBe('SECTION')
    expect(w.classes()).toEqual(expect.arrayContaining(['rounded-2xl', 'border-cream-300', 'bg-white', 'p-5', 'lg:p-6']))
    expect(w.classes().some(c => c.startsWith('shadow'))).toBe(false)
    const title = w.get('[data-testid=card-title]')
    expect(title.element.tagName).toBe('H2')
    expect(title.classes()).toEqual(expect.arrayContaining(['font-heading', 'font-semibold', 'text-xl', 'lg:text-[22px]']))
    expect(w.text()).toContain('Ver')
  })
  it('leaves the padding to the caller and draws no header without title nor actions', () => {
    const w = mount(DashboardCard, { props: { as: 'header', padded: false }, slots: { default: '<p>x</p>' } })
    expect(w.element.tagName).toBe('HEADER')
    expect(w.classes()).not.toContain('p-5')
    expect(w.find('header header').exists()).toBe(false)
  })
})

describe('DashboardAction', () => {
  it('is a router link with a destination and a button without one', () => {
    const link = mount(DashboardAction, { props: { to: '/x' }, slots: { default: 'Ir' }, global: { stubs: { RouterLink } } })
    expect(link.attributes('data-to')).toBe('/x')
    const button = mount(DashboardAction, { props: { variant: 'secondary', size: 'hero', block: true }, slots: { default: 'Ver' } })
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toEqual(expect.arrayContaining(['border-line-strong', 'sm:min-h-[46px]', 'w-full']))
  })
  it('uses rose-700 for primary and outline, and falls back to them for unknown values', () => {
    expect(mount(DashboardAction, { props: { variant: 'nope', size: 'nope' } }).classes()).toEqual(expect.arrayContaining(['bg-rose-700', 'min-h-12']))
    expect(mount(DashboardAction, { props: { variant: 'outline' } }).classes()).toEqual(expect.arrayContaining(['border-rose-700', 'text-rose-700']))
  })
})
