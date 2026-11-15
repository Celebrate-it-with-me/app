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
  it('drops on*, style, id, unknown, and srcdoc attributes', () => {
    const { html } = renderToDom(wrap(el('p', { onclick: 'x()', onmouseover: 'x()', style: 'position:fixed', id: 'rsvp', srcdoc: 'x', formaction: 'x', 'data-evil': '1', class: 'pkg-ok' }, text('hi'))))
    expect(html).toContain('<p class="pkg-ok">hi</p>')
  })

  it('drops attribute names written with other casing', () => {
    const { html } = renderToDom(wrap(el('p', { OnClick: 'x()', STYLE: 'color:red' }, text('hi'))))
    expect(html).toContain('<p>hi</p>')
  })

  it.each(['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'data:text/html,<script>1</script>', 'http://insecure.test', '//evil.test', '/\\evil.test', 'vbscript:x', 'file:///etc/passwd', 'mailto:a@b.c', 'https://user:pw@evil.test@x'.replace('@x', '')])('drops href %s', href => {
    const { html } = renderToDom(wrap(el('a', { href }, text('go'))))
    expect(html).not.toContain('href=')
  })

  it('keeps https, internal paths and fragments, and hardens target=_blank', () => {
    const { html } = renderToDom(wrap(el('a', { href: 'https://example.com/x', target: '_blank' }, text('a')), el('a', { href: '/i/x' }, text('b')), el('a', { href: '#rsvp', target: '_top' }, text('c'))))
    expect(html).toContain('href="https://example.com/x" target="_blank" rel="noopener noreferrer"')
    expect(html).toContain('<a href="/i/x">b</a>')
    expect(html).toContain('<a href="#rsvp">c</a>')
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
        el('img', { src: 'assets//x' })
      )
    )
    expect(html).toContain('src="https://assets.test/p/1.0.0/assets/img/a.svg"')
    expect(html.match(/<img/g)).toHaveLength(5)
    expect(html.match(/src=/g)).toHaveLength(1)
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
    const { html } = renderToDom(wrap(el('div', { role: 'button', 'aria-hidden': 'false' }), el('div', { role: 'presentation', 'aria-hidden': 'true' })))
    expect(html).toContain('<div></div><div role="presentation" aria-hidden="true"></div>')
  })

  it('validates behaviour attributes', () => {
    const { html } = renderToDom(wrap(el('div', { 'data-reveal': 'explode', 'data-parallax': '5', 'data-delay': '999' }), el('div', { 'data-reveal': 'rise', 'data-parallax': '.12', 'data-delay': '3' })))
    expect(html).toContain('<div></div>')
    expect(html).toContain('data-reveal="rise" data-parallax="0.12"'.replace('0.12', '.12'))
  })
})

describe('policy helpers', () => {
  it('safeLink / safeSrc basics', () => {
    expect(safeLink('https://a.test')).toBe('https://a.test/')
    expect(safeLink('/path?x=1')).toBe('/path?x=1')
    expect(safeLink('#top')).toBe('#top')
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

  it('truncates very long text', () => {
    const { root } = renderToDom(el('p', {}, text('a'.repeat(50000))))
    expect(root.querySelector('p').textContent.length).toBe(LIMITS.text)
  })
})
