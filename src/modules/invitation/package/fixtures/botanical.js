import { el, q, v, when } from './dsl'

/**
 * Botanical cover, inspired by a reference card (photo with torn-paper edge, paper grain, soft
 * washes, calligraphy names, ornamental date, eucalyptus garland). All art is generated code/SVG.
 */
export const botanicalCover = el(
  'div',
  { class: 'pkg-bot' },
  el(
    'div',
    { class: 'pkg-bot-card' },
    el('div', { class: 'pkg-bot-photo' }, q('q-cover-photo', { shape: 'bleed', focus: '50% 14%', parallax: '0.06' })),
    el(
      'div',
      { class: 'pkg-bot-body' },
      el('span', { class: 'pkg-bot-wash pkg-bot-wash--a', 'aria-hidden': 'true' }),
      el('span', { class: 'pkg-bot-wash pkg-bot-wash--b', 'aria-hidden': 'true' }),
      when('section.text', el('p', { class: 'pkg-bot-phrase', 'data-reveal': 'rise' }, v('section.text'))),
      el('div', { class: 'pkg-bot-names', 'data-reveal': 'rise', 'data-delay': '2' }, q('q-names', { split: true })),
      when('section.description', el('p', { class: 'pkg-bot-desc', 'data-reveal': 'rise', 'data-delay': '3' }, v('section.description'))),
      el(
        'div',
        { class: 'pkg-bot-date', 'data-reveal': 'rise', 'data-delay': '4' },
        el('span', { class: 'pkg-bot-date__side' }, v('event.date', 'date.month|upper')),
        el('div', { class: 'pkg-bot-date__ring' }, el('span', { class: 'pkg-bot-date__wd' }, v('event.date', 'date.weekdayShort|upper')), el('span', { class: 'pkg-bot-date__num' }, v('event.date', 'date.day'))),
        el('span', { class: 'pkg-bot-date__side' }, v('event.date', 'time|upper'))
      ),
      el('p', { class: 'pkg-bot-guest', 'data-reveal': 'rise', 'data-delay': '5' }, v('t.invitedFor'), el('br'), el('strong', {}, v('guest.name'))),
      el('div', { class: 'pkg-bot-cta', 'data-reveal': 'rise', 'data-delay': '6' }, q('q-cta'))
    ),
    el('img', { class: 'pkg-bot-garland', src: 'assets/img/garland.svg', alt: '', width: '1200', height: '300', loading: 'lazy' })
  )
)

const base = '/template-packages/botanical/1.0.0/'
const font = f => ({ url: `${base}assets/fonts/${f}.woff2`, as: 'font' })

/** Dev fixture. `wedding: true` swaps the demo quinceañera for the couple of the reference. */
export default function apply(inv, { wedding = false } = {}) {
  const event = wedding ? { ...inv.event, name: 'Julieta & Camilo', typeSlug: 'wedding' } : inv.event
  return {
    ...inv,
    event,
    theme: {
      ...inv.theme,
      name: 'botanical',
      preset: 'salvia',
      colors: { surface: '#fbf8f1', surfaceAlt: '#f1efe3', ink: '#34382c', inkSoft: '#555a47', accent: '#8c8658', primary: '#566f52' },
      fonts: { heading: 'Cormorant Garamond', body: 'Cormorant Garamond', script: 'Great Vibes' },
      package: {
        slug: 'botanical', version: '1.0.0', engineMin: 1, cssUrl: `${base}theme.css`,
        preload: [font('great-vibes-latin-400-normal'), font('cormorant-garamond-latin-400-normal')],
        templates: { cover: botanicalCover }
      }
    },
    sections: inv.sections.map(s =>
      s.type === 'cover'
        ? { ...s, render: 'package', title: null, text: wedding ? 'Dos caminos se encontraron, dos vidas se unen para siempre. Acompáñanos a celebrar nuestro matrimonio.' : s.text, data: { ...s.data, eventName: event.name, description: wedding ? null : s.data.description } }
        : s
    )
  }
}
