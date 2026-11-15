import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, ref } from 'vue'
import { INVITATION_KEY } from '../../composables/useInvitation'
import PackageLayout, { layoutIsValid } from '../PackageLayout'
import InvitationSections from '../../components/InvitationSections.vue'
import { el, q, text, tt, makeCtx } from './helpers'

const wrap = (...nodes) => ({ v: 1, kind: 'layout', nodes })
const SECTIONS = [
  { type: 'cover', title: 'Hola', text: null, render: 'package', data: { eventName: 'X' } },
  { type: 'itinerary', title: 'Programa', text: null, data: { items: [] } },
  { type: 'rsvp', title: 'RSVP', text: null, data: {} }
]
const provide = () => ({ [INVITATION_KEY]: { invitation: ref(makeCtx().invitation), locale: ref('es'), tt } })

describe('layout.html', () => {
  it('is valid with exactly one q-sections that is not under a condition', () => {
    expect(layoutIsValid(wrap(el('div', {}, q('sections'))))).toBe(true)
    expect(layoutIsValid(wrap(el('div', {}, text('x'))))).toBe(false)
    expect(layoutIsValid(wrap(q('sections'), q('sections')))).toBe(false)
    expect(layoutIsValid(wrap({ t: 'if', path: 'event.name', children: [q('sections')] }))).toBe(false)
    expect(layoutIsValid(wrap(el('header', {}, text('x')), el('main', {}, q('q-sections')), el('footer', {})))).toBe(true)
    expect(layoutIsValid(null)).toBe(false)
  })

  it('draws the frame of the page and the visible sections once, where q-sections is', () => {
    const ast = wrap(el('header', { class: 'pkg-head' }, text('Arriba')), el('div', { class: 'pkg-stack' }, q('sections')), el('footer', { class: 'pkg-foot' }, text('Abajo')))
    const w = mount(PackageLayout, {
      props: { ast, base: 'https://a.test/p/' },
      slots: { default: () => h('div', { class: 'the-sections' }, 'S') },
      global: { provide: provide() }
    })
    expect(w.findAll('.the-sections')).toHaveLength(1)
    expect(w.find('.pkg-stack .the-sections').exists()).toBe(true)
    expect(w.find('.pkg-head').exists() && w.find('.pkg-foot').exists()).toBe(true)
  })
})

describe('section stack', () => {
  const pkg = { base: 'https://a.test/p/', strings: undefined, templates: { cover: wrap(el('div', { class: 'pkg-cover' }, text('hola'))) } }

  it('draws package templates for render:package, position hooks for the rest, and plain components without a package', () => {
    const w = mount(InvitationSections, { props: { sections: SECTIONS.slice(0, 2), pkg }, global: { provide: provide(), stubs: { InvitationItinerary: { template: '<i class="native-itinerary" />' } } } })
    expect(w.find('.pkg-cover').exists()).toBe(true)
    expect(w.find('[data-inv-section=cover]').attributes('data-inv-position')).toBe('1')
    const second = w.find('[data-inv-section=itinerary]')
    expect(second.attributes('data-inv-position')).toBe('2')
    expect(second.attributes('data-inv-parity')).toBe('even')
    expect(second.find('.native-itinerary').exists()).toBe(true)
    const plain = mount(InvitationSections, { props: { sections: SECTIONS.slice(1, 2), pkg: null }, global: { provide: provide(), stubs: { InvitationItinerary: { template: '<i class="native-itinerary" />' } } } })
    expect(plain.find('[data-inv-section]').exists()).toBe(false)
  })

  it('a section that is switched off leaves no wrapper and the positions close the gap', () => {
    const w = mount(InvitationSections, { props: { sections: [SECTIONS[0], SECTIONS[2]], pkg }, global: { provide: provide(), stubs: { InvitationRsvp: { template: '<i />' } } } })
    expect(w.find('[data-inv-section=itinerary]').exists()).toBe(false)
    expect(w.find('[data-inv-section=rsvp]').attributes('data-inv-position')).toBe('2')
  })
})
