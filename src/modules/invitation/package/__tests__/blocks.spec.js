import { describe, it, expect } from 'vitest'
import { BLOCKS } from '../blocks'
import { SECTION_COMPONENTS } from '../../composables/sectionComponents'
import { FrameScope } from '../../composables/frame'
import { el, q, text, v, when, renderToDom, renderVNode, SECTIONS } from './helpers'

const FULL = {
  rsvp: 'rsvp', gallery: 'gallery', music: 'music', countdown: 'countdown', locations: 'locations',
  itinerary: 'itinerary', 'dress-code': 'dress_code', padrinos: 'padrinos', closing: 'closing', 'save-the-date': 'save_the_date',
  tables: 'tables', comments: 'comments', 'suggested-music': 'suggested_music'
}
const all = type => ({ sections: [{ type: 'cover', title: null, data: {} }, { type, title: 't', text: null, data: {} }] })

describe('q-* → existing components', () => {
  it.each(Object.entries(FULL))('q-%s renders the real %s component with its section, bare by default', (name, type) => {
    const { vnode } = renderVNode(q(name), all(type))
    const scope = vnode.children[0]
    expect(scope.type).toBe(FrameScope)
    expect(scope.props.frame).toBe('bare')
    const inner = scope.children.default()
    expect(inner.type).toBe(SECTION_COMPONENTS[type])
    expect(inner.props.section.type).toBe(type)
  })

  it('the 22 blocks of the catalogue exist, and a "q-" prefix is tolerated', () => {
    expect(Object.keys(BLOCKS).sort()).toEqual(
      [...Object.keys(FULL), 'cover-photo', 'names', 'date', 'cta', 'language-switch', 'seats', 'address', 'guest', 'sections'].sort()
    )
    expect(Object.keys(BLOCKS)).toHaveLength(22)
    expect(renderToDom(el('div', {}, q('q-cta'))).html).toContain('inv-q--cta')
  })

  it('variant props reach the component after validation; nothing else does', () => {
    const { vnode, warnings } = renderVNode(q('rsvp', { variant: 'paper', frame: 'no-title', section: { evil: 1 }, onClick: 'x' }), all('rsvp'))
    expect(vnode.children[0].props.frame).toBe('no-title')
    const inner = vnode.children[0].children.default()
    expect(Object.keys(inner.props).sort()).toEqual(['section', 'variant'])
    expect(inner.props.variant).toBe('paper')
    expect(warnings.filter(w => w.includes('not allowed'))).toHaveLength(2)
    const bad = renderVNode(q('rsvp', { variant: 'sparkly' }), all('rsvp')).vnode.children[0].children.default()
    expect(Object.keys(bad.props)).toEqual(['section'])
  })

  it('gallery props are typed (layout, columns 2-4, max 1-40, captions bool)', () => {
    const inner = renderVNode(q('gallery', { layout: 'carousel', columns: 3, max: '6', captions: 'false' }), all('gallery')).vnode.children[0].children.default()
    expect(inner.props).toMatchObject({ layout: 'carousel', columns: 3, max: 6, captions: false })
    const bad = renderVNode(q('gallery', { columns: 9, max: 99, layout: 'x' }), all('gallery')).vnode.children[0].children.default()
    expect(Object.keys(bad.props)).toEqual(['section'])
  })

  it('an unknown block is ignored with a warning', () => {
    const { html, warnings } = renderToDom(el('div', {}, q('evil', {}), q('constructor', {}), q('__proto__')))
    expect(html).toBe('<div id="out"><div></div></div>')
    expect(warnings).toHaveLength(3)
  })

  it('a section that is off, not in the plan or absent draws nothing (and no orphan wrapper)', () => {
    const { html } = renderToDom(el('div', {}, q('rsvp'), q('gallery'), q('cta')), { sections: [{ type: 'cover', data: {} }] })
    expect(html).toBe('<div id="out"><div></div></div>')
  })

  it('q-cta targets the section it points to and only exists while that section does', () => {
    expect(renderToDom(el('div', {}, q('cta'))).html).toContain('inv-q--cta')
    expect(renderToDom(el('div', {}, q('cta')), { sections: SECTIONS.filter(s => s.type !== 'rsvp') }).html).not.toContain('inv-q--cta')
    expect(renderToDom(el('div', {}, q('cta', { action: 'locations' }))).html).not.toContain('inv-q--cta')
    const withLocations = [...SECTIONS, { type: 'locations', data: { items: [] } }]
    expect(renderToDom(el('div', {}, q('cta', { action: 'locations', variant: 'outline' })), { sections: withLocations }).html).toContain('inv-button--outline')
  })

  it('block wrapper attributes go through the same closed policy', () => {
    const node = { ...q('cta'), attrs: { class: 'pkg-btn', 'data-reveal': 'rise', 'data-reveal-delay': '200', onclick: 'x()', style: 'position:fixed' } }
    const { html } = renderToDom(el('div', {}, node))
    expect(html).toContain('pkg-btn')
    expect(html).toContain('data-reveal="rise"')
    expect(html).toContain('--pk-delay: 200ms')
    expect(html).not.toContain('onclick')
    expect(html).not.toContain('position')
  })

  it('q-sections only draws what the layout hands it', () => {
    const { html } = renderToDom(el('div', {}, q('sections')), { ctx: { renderSections: () => [] } })
    expect(html).toBe('<div id="out"><div></div></div>')
  })
})

describe('own blocks', () => {
  it('q-cover-photo: photo with validated focus, never an unsafe URL', () => {
    const ok = renderToDom(el('div', {}, q('cover-photo', { focus: '50% 14%', aspect: '4:5', fit: 'cover', priority: true })))
    expect(ok.html).toContain('src="/demo/valentina-portrait.webp"')
    expect(ok.html).toContain('object-position: 50% 14%')
    expect(ok.html).toContain('aspect-ratio: 4 / 5')
    expect(ok.html).toContain('fetchpriority="high"')
    const bad = renderToDom(el('div', {}, q('cover-photo', { focus: 'url(javascript:1)', aspect: 'x' })), { sections: [{ type: 'cover', data: { image: 'javascript:alert(1)' } }] })
    expect(bad.html).not.toContain('javascript')
    expect(bad.html).not.toContain('object-position')
    expect(bad.html).not.toContain('aspect-ratio')
  })

  it('q-cover-photo without a photo shows the lettering of the event type', () => {
    const none = { sections: [{ type: 'cover', data: {} }] }
    expect(renderToDom(el('div', {}, q('cover-photo')), none).html).toContain('>XV<')
    expect(renderToDom(el('div', {}, q('cover-photo')), { ...none, invitation: { event: { typeSlug: 'wedding', name: 'A & B' } } }).html).toContain('>&amp;<')
    expect(renderToDom(el('div', {}, q('cover-photo')), none).html).toContain('data-empty="true"')
  })

  it('q-names: tag from a closed list, script flag, long and empty names', () => {
    const r = renderToDom(el('div', {}, q('names', { tag: 'h2', script: true })))
    expect(r.root.querySelector('h2').className).toContain('inv-q--script')
    expect(r.root.querySelector('h2').textContent).toBe('Los XV de Valentina')
    expect(renderToDom(el('div', {}, q('names', { tag: 'script' }))).html).toContain('<h1')
    expect(() => renderToDom(el('div', {}, q('names')), { invitation: { event: {} } })).not.toThrow()
  })

  it('q-date: three formats, in the invitation language', () => {
    const es = renderToDom(el('div', {}, q('date', { format: 'inline' })))
    expect(es.root.querySelector('time').textContent).toMatch(/lunes, 28 diciembre 2026/)
    expect(es.root.querySelector('time').getAttribute('datetime')).toBe('2026-12-28T19:00:00')
    const en = renderToDom(el('div', {}, q('date', { format: 'ring', month: 'short', weekday: 'none', time: false })), { ctx: { locale: 'en' } })
    expect(en.root.querySelector('.inv-date__month').textContent).toBe('Dec')
    expect(en.root.querySelector('.inv-date__weekday')).toBeNull()
    expect(en.root.querySelector('.inv-date__sub').textContent).toBe('2026')
    const columns = renderToDom(el('div', {}, q('date')))
    expect(columns.root.querySelector('[data-format=columns] .inv-date__day').textContent).toBe('28')
  })

  it('q-seats, q-address, q-guest', () => {
    const rsvp = { type: 'rsvp', data: { companions: [{ id: 1 }, { id: 2 }] } }
    expect(renderToDom(el('div', {}, q('seats')), { sections: [rsvp] }).root.querySelector('p').textContent).toBe('3 lugares')
    expect(renderToDom(el('div', {}, q('seats')), { sections: [] }).html).not.toContain('seats')
    const place = { type: 'locations', data: { items: [{ name: 'Salón Real', address: 'Calle 8', city: 'Miami', state: 'FL', zipCode: '33101' }] } }
    expect(renderToDom(el('div', {}, q('address', { line: 'full' })), { sections: [place] }).root.textContent).toContain('Calle 8Miami, FL, 33101')
    expect(renderToDom(el('div', {}, q('address')), { sections: [] }).html).not.toContain('address')
    const guest = renderToDom(el('div', {}, q('guest', { greeting: false })))
    expect(guest.root.querySelector('.inv-guest__label')).toBeNull()
    expect(guest.root.querySelector('.inv-guest__name').textContent).toBe('Rosa Fernández')
  })

  it('conditional node draws only non-empty values', () => {
    const tree = el('div', {}, when('section.text', el('p', {}, v('section.text'))), when('event.description', el('p', {}, text('d'))))
    const withText = renderToDom(tree, { sections: [{ type: 'cover', text: 'hola', data: {} }], ctx: { section: { type: 'cover', text: 'hola', data: {} } } })
    expect(withText.html).toContain('<p>hola</p>')
    expect(withText.html).not.toContain('<p>d</p>')
  })
})
