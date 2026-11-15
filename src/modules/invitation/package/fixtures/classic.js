import { el, q, v, when } from './dsl'

/** Clásica's cover as a package template: same structure and look as InvitationCover.vue. */
export const classicCover = el(
  'div',
  { class: 'pkg-cl' },
  el('span', { class: 'pkg-cl-glow', 'aria-hidden': 'true' }),
  el('span', { class: 'pkg-cl-sprig pkg-cl-sprig--a', 'aria-hidden': 'true', 'data-reveal': 'fade' }, el('span', { class: 'pkg-cl-stem' }), el('span', { class: 'pkg-cl-bloom' })),
  el('span', { class: 'pkg-cl-sprig pkg-cl-sprig--b', 'aria-hidden': 'true', 'data-reveal': 'fade', 'data-delay': '3' }, el('span', { class: 'pkg-cl-stem' }), el('span', { class: 'pkg-cl-bloom' })),
  el(
    'div',
    { class: 'pkg-cl-col' },
    el('div', { class: 'pkg-cl-arch', 'data-reveal': 'zoom' }, q('q-cover-photo', { shape: 'arch' })),
    when('section.title', el('p', { class: 'pkg-cl-phrase', 'data-reveal': 'rise', 'data-delay': '2' }, v('section.title'))),
    el('h1', { class: 'pkg-cl-name', 'data-reveal': 'rise', 'data-delay': '3' }, v('section.eventName')),
    when('section.text', el('p', { class: 'pkg-cl-text', 'data-reveal': 'rise', 'data-delay': '4' }, v('section.text'))),
    el(
      'div',
      { class: 'pkg-cl-date', 'data-reveal': 'rise', 'data-delay': '5' },
      el(
        'div',
        { class: 'pkg-cl-date__row' },
        el('p', { class: 'pkg-cl-date__side pkg-cl-date__side--l' }, v('event.date', 'date.weekday')),
        el('p', { class: 'pkg-cl-date__day' }, v('event.date', 'date.day')),
        el('p', { class: 'pkg-cl-date__side pkg-cl-date__side--r' }, v('event.date', 'date.month'))
      ),
      el('p', { class: 'pkg-cl-date__sub' }, v('event.date', 'date.year'), ' · ', v('event.date', 'time'))
    ),
    when('section.description', el('p', { class: 'pkg-cl-desc', 'data-reveal': 'rise', 'data-delay': '6' }, v('section.description'))),
    el(
      'div',
      { class: 'pkg-cl-guest', 'data-reveal': 'rise', 'data-delay': '7' },
      el('p', { class: 'pkg-cl-guest__label' }, v('t.invitedFor')),
      el('p', { class: 'pkg-cl-guest__name' }, v('guest.name'))
    ),
    el('div', { class: 'pkg-cl-cta', 'data-reveal': 'rise', 'data-delay': '8' }, q('q-cta'))
  )
)

const base = '/template-packages/classic/1.0.0/'

/** Turns a loaded invitation into one rendered by the Clásica package (dev only, see InvitationView). */
export default function apply(inv) {
  return {
    ...inv,
    theme: {
      ...inv.theme,
      package: { slug: 'classic', version: '1.0.0', engineMin: 1, cssUrl: `${base}theme.css`, preload: [{ url: `${base}assets/pinyon-script-latin-400-normal.woff2`, as: 'font' }], templates: { cover: classicCover } }
    },
    sections: inv.sections.map(s => (s.type === 'cover' ? { ...s, render: 'package' } : s))
  }
}
