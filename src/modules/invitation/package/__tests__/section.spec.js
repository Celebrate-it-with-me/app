import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { INVITATION_KEY } from '../../composables/useInvitation'
import PackageSection from '../PackageSection'
import { startBehaviors } from '../behaviors'
import { readPackage, allowedAssetUrl, ENGINE } from '../usePackageTheme'
import { el, q, text, tt } from './helpers'

const ast = el('div', { class: 'pkg-t' }, el('span', { class: 'pkg-wash', 'aria-hidden': 'true' }), el('p', { 'data-reveal': 'rise' }, text('hi')), q('q-rsvp'))

function sectionsFor(order) {
  const all = {
    cover: { type: 'cover', title: 'Hola', data: { eventName: 'X' } },
    itinerary: { type: 'itinerary', title: 'Programa', data: { items: [] } },
    rsvp: { type: 'rsvp', title: 'RSVP', data: {} }
  }
  return order.map(t => all[t])
}

function mountSection(order, type) {
  const sections = sectionsFor(order)
  const index = order.indexOf(type)
  const invitation = ref({ event: { name: 'X', startsAt: '2026-12-28T19:00:00', typeSlug: 'wedding' }, guest: { name: 'G' }, sections })
  return mount(PackageSection, {
    props: { ast, section: sections[index], position: index + 1, count: sections.length, base: 'https://a.test/p/' },
    global: { stubs: { InvitationRsvp: true }, provide: { [INVITATION_KEY]: { invitation, locale: ref('es'), tt } } }
  })
}

afterEach(() => vi.unstubAllGlobals())

describe('PackageSection wrapper', () => {
  it('stamps the REAL position among the visible sections (reorder / switched-off sections)', () => {
    const a = mountSection(['cover', 'itinerary', 'rsvp'], 'itinerary')
    expect(a.attributes()).toMatchObject({ 'data-inv-section': 'itinerary', 'data-inv-position': '2', 'data-inv-parity': 'even' })
    // The itinerary is switched off: the RSVP moves up, so its decoration parity follows.
    const b = mountSection(['cover', 'rsvp'], 'rsvp')
    expect(b.attributes()).toMatchObject({ 'data-inv-position': '2', 'data-inv-parity': 'even', 'data-inv-last': 'true' })
    const c = mountSection(['rsvp', 'cover'], 'rsvp')
    expect(c.attributes()).toMatchObject({ 'data-inv-position': '1', 'data-inv-parity': 'odd', 'data-inv-first': 'true' })
  })

  it('cover is a header, the rest are labelled sections; the package cannot change that', () => {
    expect(mountSection(['cover', 'rsvp'], 'cover').element.tagName).toBe('HEADER')
    const s = mountSection(['cover', 'itinerary'], 'itinerary')
    expect(s.element.tagName).toBe('SECTION')
    expect(s.attributes('aria-label')).toBe('Programa')
  })

  it('a block for a section that is switched off leaves no orphan wrapper', () => {
    const w = mountSection(['cover', 'itinerary'], 'itinerary') // no rsvp section at all
    expect(w.find('.inv-q--rsvp').exists()).toBe(false)
    expect(w.find('.pkg-wash').exists()).toBe(true) // decoration belongs to this (visible) section only
  })
})

describe('behaviours', () => {
  const stubIO = () => {
    const observed = []
    class IO { constructor(cb) { this.cb = cb } observe(el) { observed.push(el) } unobserve() {} disconnect() {} }
    vi.stubGlobal('IntersectionObserver', IO)
    return observed
  }

  it('arms [data-reveal] nodes and reveals them when they intersect', () => {
    const observed = stubIO()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const root = document.createElement('div')
    root.innerHTML = '<p data-reveal="rise"></p><p data-reveal="fade"></p>'
    const stop = startBehaviors(root)
    expect(root.querySelectorAll('.pk-armed')).toHaveLength(2)
    expect(observed).toHaveLength(2)
    stop()
  })

  it('does nothing under prefers-reduced-motion: nothing is armed, nothing observed, nothing scrolls', () => {
    const observed = stubIO()
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const root = document.createElement('div')
    root.innerHTML = '<p data-reveal="rise"></p><img data-parallax="0.1">'
    const add = vi.spyOn(window, 'addEventListener')
    startBehaviors(root)
    expect(root.querySelector('.pk-armed')).toBeNull()
    expect(observed).toHaveLength(0)
    expect(add.mock.calls.some(([type]) => type === 'scroll')).toBe(false)
    add.mockRestore()
  })

  it('parallax listens passively and cleans up', () => {
    stubIO()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const root = document.createElement('div')
    root.innerHTML = '<div><img data-parallax="0.1"></div>'
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const stop = startBehaviors(root)
    expect(add).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    stop()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})

describe('package payload', () => {
  const ok = { slug: 'botanical', engineMin: 1, cssUrl: 'https://assets.test/p/1.0.0/theme.css', templates: { cover: {} } }

  it('accepts a package whose files live on the allowed origin', () => {
    const p = readPackage(ok, 'https://assets.test')
    expect(p.base).toBe('https://assets.test/p/1.0.0/')
    expect(p.cssUrl).toBe('https://assets.test/p/1.0.0/theme.css')
  })

  it.each([
    ['foreign origin', { ...ok, cssUrl: 'https://evil.test/theme.css' }],
    ['http', { ...ok, cssUrl: 'http://assets.test/theme.css' }],
    ['javascript', { ...ok, cssUrl: 'javascript:alert(1)' }],
    ['credentials', { ...ok, cssUrl: 'https://u:p@assets.test/theme.css' }],
    ['bad slug', { ...ok, slug: 'Bad Slug"><x' }],
    ['engine too new', { ...ok, engineMin: ENGINE + 1 }],
    ['missing css', { ...ok, cssUrl: undefined }],
    ['not an object', 'x']
  ])('falls back to Clásica: %s', (_name, pkg) => {
    expect(readPackage(pkg, 'https://assets.test')).toBeNull()
  })

  it('keeps preload entries only when they are on the allowed origin', () => {
    const p = readPackage({ ...ok, preload: [{ url: 'https://assets.test/f.woff2', as: 'font' }, { url: 'https://evil.test/f.woff2', as: 'font' }, { url: 'https://assets.test/x', as: 'script' }] }, 'https://assets.test')
    expect(p.preload).toHaveLength(1)
  })

  it('allowedAssetUrl: same-origin development URLs work, others do not', () => {
    const here = window.location.origin
    expect(allowedAssetUrl('/template-packages/a/theme.css', here)).toBe(`${here}/template-packages/a/theme.css`)
    expect(allowedAssetUrl('//evil.test/a.css', 'https://assets.test')).toBeNull()
  })
})

describe('carousel', () => {
  it('data-carousel renders an accessible scroll-snap region with buttons', async () => {
    const tree = el('div', { class: 'pkg-t' }, el('ul', { 'data-carousel': 'true', class: 'pkg-slides' }, el('li', {}, text('1')), el('li', {}, text('2'))))
    const w = mount(PackageSection, {
      props: { ast: tree, section: { type: 'gallery', data: {} }, position: 1, count: 1, base: 'https://a.test/' },
      global: { provide: { [INVITATION_KEY]: { invitation: ref({ event: {}, guest: {}, sections: [] }), locale: ref('es'), tt } } }
    })
    await nextTick()
    const region = w.find('[role=region]')
    expect(region.attributes('aria-roledescription')).toBe('carousel')
    expect(region.find('ul').attributes('tabindex')).toBe('0')
    expect(region.findAll('button').map(b => b.attributes('aria-label'))).toEqual([tt('gallery.previous'), tt('gallery.next')])
    expect(region.findAll('li')).toHaveLength(2)
  })
})
