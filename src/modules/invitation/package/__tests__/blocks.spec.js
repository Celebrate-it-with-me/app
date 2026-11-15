import { describe, it, expect } from 'vitest'
import { BLOCKS } from '../blocks'
import { SECTION_COMPONENTS } from '../../composables/sectionComponents'
import { el, q, text, v, when, renderToDom, renderVNode, SECTIONS } from './helpers'

const FULL = {
  'q-rsvp': 'rsvp', 'q-gallery': 'gallery', 'q-music': 'music', 'q-countdown': 'countdown', 'q-locations': 'locations',
  'q-itinerary': 'itinerary', 'q-dress-code': 'dress_code', 'q-padrinos': 'padrinos', 'q-closing': 'closing', 'q-save-the-date': 'save_the_date'
}
const all = type => ({ sections: [{ type: 'cover', title: null, data: {} }, { type, title: 't', text: null, data: {} }] })

describe('q-* → existing components', () => {
  it.each(Object.entries(FULL))('%s renders the real %s component with its section', (name, type) => {
    const { vnode } = renderVNode(q(name), all(type))
    const inner = vnode.children[0]
    expect(inner.type).toBe(SECTION_COMPONENTS[type])
    expect(inner.props.section.type).toBe(type)
  })

  it('every full-section component only takes the `section` prop (what a package can wire today)', () => {
    for (const type of Object.values(FULL)) expect(Object.keys(SECTION_COMPONENTS[type].props)).toEqual(['section'])
  })

  it('nothing the package passes reaches a component: props are closed lists', () => {
    const { vnode, warnings } = renderVNode(q('q-rsvp', { section: { evil: 1 }, onClick: 'x', variant: 'x' }), all('rsvp'))
    expect(Object.keys(vnode.children[0].props)).toEqual(['section'])
    expect(warnings.filter(w => w.includes('not allowed'))).toHaveLength(3)
  })

  it('an unknown block is ignored with a warning', () => {
    const { html, warnings } = renderToDom(el('div', {}, q('q-evil', {}), q('constructor', {}), q('__proto__')))
    expect(html).toBe('<div id="out"><div></div></div>')
    expect(warnings).toHaveLength(3)
  })

  it('a section that is off, not in the plan or absent draws nothing (and no orphan wrapper)', () => {
    const { html } = renderToDom(el('div', {}, q('q-rsvp'), q('q-gallery'), q('q-cta')), { sections: [{ type: 'cover', data: {} }] })
    expect(html).toBe('<div id="out"><div></div></div>')
  })

  it('q-cta only exists while the RSVP section does', () => {
    expect(renderToDom(el('div', {}, q('q-cta'))).html).toContain('inv-q--cta')
    expect(renderToDom(el('div', {}, q('q-cta')), { sections: SECTIONS.filter(s => s.type !== 'rsvp') }).html).not.toContain('inv-q--cta')
  })

  it('every documented block exists', () => {
    expect(Object.keys(BLOCKS).sort()).toEqual([...Object.keys(FULL), 'q-cover-photo', 'q-names', 'q-date', 'q-cta', 'q-language-switch'].sort())
  })
})

describe('own blocks', () => {
  it('q-cover-photo: photo with validated focus, never an unsafe URL', () => {
    const ok = renderToDom(el('div', {}, q('q-cover-photo', { focus: '50% 14%', shape: 'bleed', parallax: '0.06' })))
    expect(ok.html).toContain('src="/demo/valentina-portrait.webp"')
    expect(ok.html).toContain('object-position: 50% 14%')
    expect(ok.html).toContain('fetchpriority="high"')
    const bad = renderToDom(el('div', {}, q('q-cover-photo', { focus: 'url(javascript:1)', shape: 'x' })), { sections: [{ type: 'cover', data: { image: 'javascript:alert(1)' } }] })
    expect(bad.html).not.toContain('javascript')
    expect(bad.html).not.toContain('object-position')
    expect(bad.html).toContain('data-shape="rect"')
  })

  it('q-cover-photo without a photo shows the lettering of the event type (or nothing)', () => {
    const none = { sections: [{ type: 'cover', data: {} }] }
    expect(renderToDom(el('div', {}, q('q-cover-photo')), none).html).toContain('>XV<')
    expect(renderToDom(el('div', {}, q('q-cover-photo')), { ...none, invitation: { event: { typeSlug: 'wedding', name: 'A & B' } } }).html).toContain('>&amp;<')
    const quiet = renderToDom(el('div', {}, q('q-cover-photo', { fallback: 'none' })), none).html
    expect(quiet).not.toContain('emblem')
    expect(quiet).toContain('data-empty="true"')
  })

  it('q-names splits a couple on two lines and leaves other names alone', () => {
    const couple = renderToDom(el('div', {}, q('q-names', { split: true })), { sections: [{ type: 'cover', data: { eventName: 'Julieta & Camilo' } }] })
    expect(couple.root.querySelectorAll('.inv-q-names__line')).toHaveLength(2)
    expect(couple.root.querySelector('h1').textContent).toBe('Julieta &Camilo')
    const spanish = renderToDom(el('div', {}, q('q-names', { split: true })), { sections: [{ type: 'cover', data: { eventName: 'Ana y Luis' } }] })
    expect(spanish.root.querySelector('h1').textContent).toBe('Ana &Luis')
    const quince = renderToDom(el('div', {}, q('q-names', { split: true })))
    expect(quince.root.querySelectorAll('.inv-q-names__line')).toHaveLength(0)
    expect(quince.root.querySelector('h1').textContent).toBe('Los XV de Valentina')
  })

  it('q-names with a very long name and an empty one', () => {
    const long = 'María Guadalupe de los Ángeles Fernández-Sánchez & Juan Sebastián Rodríguez-Villanueva de la Cruz'
    const r = renderToDom(el('div', {}, q('q-names', { split: true, tag: 'h2' })), { sections: [{ type: 'cover', data: { eventName: long } }] })
    expect(r.root.querySelector('h2').textContent).toContain('Villanueva')
    expect(() => renderToDom(el('div', {}, q('q-names')), { sections: [{ type: 'cover', data: {} }], invitation: { event: {} } })).not.toThrow()
    expect(renderToDom(el('div', {}, q('q-names', { tag: 'script' })), {}).html).toContain('<h1')
  })

  it('q-date formats in the invitation language', () => {
    const es = renderToDom(el('div', {}, q('q-date', { format: 'long' })))
    expect(es.root.querySelector('time').textContent).toMatch(/28 de diciembre de 2026/)
    expect(es.root.querySelector('time').getAttribute('datetime')).toBe('2026-12-28T19:00:00')
    const en = renderToDom(el('div', {}, q('q-date', { format: 'month' })), { ctx: { locale: 'en' } })
    expect(en.root.querySelector('time').textContent).toBe('December')
  })

  it('conditional node draws only non-empty values', () => {
    const tree = el('div', {}, when('section.text', el('p', {}, v('section.text'))), when('section.description', el('p', {}, text('d'))))
    const withText = renderToDom(tree, { sections: [{ type: 'cover', text: 'hola', data: {} }] })
    expect(withText.html).toContain('<p>hola</p>')
    expect(withText.html).not.toContain('<p>d</p>')
  })
})
