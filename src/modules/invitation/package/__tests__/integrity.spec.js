import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { checkIntegrity, colorAlpha } from '../integrity'
import { el, q, text, renderToDom } from './helpers'

/**
 * jsdom has no layout, so a tiny box model stands in for it: blocks stack at 60 px steps unless the (hostile) CSS
 * moves, sizes or hides them. The browser run of the same attacks is in scripts/screenshots/sec6app-shot.mjs.
 */
const VW = 390
const VH = 800
const px = value => (/^-?[\d.]+px$/.test(value ?? '') ? parseFloat(value) : null)

function rectOf(node) {
  const style = getComputedStyle(node)
  const zero = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
  if (style.display === 'none') return zero
  if (node.classList.contains('inv-root') || node.tagName === 'MAIN') return { left: 0, top: 0, right: VW, bottom: VH, width: VW, height: VH }
  if (style.position === 'absolute' && px(style.top) !== null) {
    const top = px(style.top)
    const bottom = VH - (px(style.bottom) ?? 0)
    return { left: px(style.left) ?? 0, top, right: VW, bottom, width: VW, height: bottom - top }
  }
  if (style.width === '100%' && node.parentElement) return rectOf(node.parentElement)
  const parent = node.parentElement
  const top = parent.tagName === 'MAIN' ? 20 + 60 * [...parent.children].indexOf(node) : rectOf(parent).top
  const left = (parent.tagName === 'MAIN' ? 0 : rectOf(parent).left) + (px(style.marginLeft) ?? 0)
  const width = px(style.width) ?? 300
  const height = px(style.height) ?? 40
  return { left, top, right: left + width, bottom: top + height, width, height }
}

function hitTest(x, y) {
  const all = [...document.body.querySelectorAll('*')].filter(node => {
    const style = getComputedStyle(node)
    if (style.pointerEvents === 'none' || style.display === 'none') return false
    const r = rectOf(node)
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  })
  const z = node => {
    let best = 0
    for (let n = node; n && n.tagName !== 'BODY'; n = n.parentElement) best = Math.max(best, parseInt(getComputedStyle(n).zIndex, 10) || 0)
    return best
  }
  return all.sort((a, b) => z(a) - z(b) || all.indexOf(a) - all.indexOf(b)).pop() ?? null
}

let sheet
beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { value: VW, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: VH, configurable: true })
  Object.defineProperty(document.documentElement, 'clientWidth', { value: VW, configurable: true })
  Element.prototype.getBoundingClientRect = function () {
    return rectOf(this)
  }
  document.elementFromPoint = hitTest
  sheet = document.createElement('style')
  document.head.appendChild(sheet)
})
afterEach(() => {
  sheet.remove()
  document.body.innerHTML = ''
  delete document.elementFromPoint
})

const page = (css, html) => {
  sheet.textContent = css
  document.body.innerHTML = `<div class="inv-root"><main>${html}</main></div>`
  return document.querySelector('.inv-root')
}
const cta = '<div class="inv-q inv-q--cta" data-q="cta"><button type="button">Confirmar</button></div>'
const rsvp = '<div class="inv-q inv-q--rsvp" data-q="rsvp"><form><label>Nombre</label><button type="submit">Enviar</button></form></div>'
const reasons = result => result.problems.map(p => `${p.block}:${p.reason}`)

describe('integrity guard: hostile package CSS', () => {
  it('passes a clean page and counts the blocks', () => {
    const result = checkIntegrity(page('.pkg-a{color:#222}', `${cta}${rsvp}`))
    expect(result.problems).toEqual([])
    expect(result.blocks).toBe(2)
  })

  it.each([
    ['root hidden', '.inv-root{display:none}', 'display-none'],
    ['body opacity', '.inv-root{opacity:0}', 'transparent'],
    ['wrapper filter', 'main{filter:opacity(0)}', 'filter-hidden'],
    ['transparent text everywhere', '*{color:transparent}', 'text-transparent'],
    ['zero font size', 'button{font-size:0px}', 'text-tiny'],
    ['block pushed off screen', '[data-q]{margin-left:-99999px}', 'off-page'],
    ['block shrunk to nothing', '[data-q]{width:0px;height:0px}', 'no-size'],
    ['pointer events off on the block', '[data-q]{pointer-events:none}', 'pointer-events-none']
  ])('detects %s', (_name, css, reason) => {
    const result = checkIntegrity(page(css, `${cta}${rsvp}`))
    expect(result.ok).toBe(false)
    expect(reasons(result).some(item => item.endsWith(`:${reason}`))).toBe(true)
  })

  it('detects an invisible link laid over the RSVP (click hijack)', () => {
    const css = '.pkg-ov{position:absolute;top:-2000px;bottom:-2000px;left:0;z-index:10}.pkg-ova{display:block;width:100%;height:100%;opacity:0}[data-q]{position:relative;z-index:1}'
    const html = `${rsvp}<div class="pkg-ov"><a class="pkg-ova" href="https://evil.example/login"></a></div>`
    const result = checkIntegrity(page(css, html))
    expect(reasons(result)).toContain('rsvp:covered')
  })

  it('detects a block wrapped by a link', () => {
    const result = checkIntegrity(page('', `<a href="https://evil.example/pay">${cta}</a>`))
    expect(reasons(result)).toEqual(['cta:inside-link'])
  })

  it('does not flag an empty block (no photos, countdown over) or a block still being revealed', () => {
    const empty = '<div class="inv-q inv-q--gallery" data-q="gallery"></div>'
    const armed = '<div class="inv-q inv-q--cta pk-armed" data-q="cta" data-reveal="rise" style="opacity:0"><button>Ir</button></div>'
    expect(checkIntegrity(page('', `${empty}${armed}`)).ok).toBe(true)
  })

  it('does not flag the music control, which lives in a fixed container inside an empty wrapper', () => {
    const music = '<div class="inv-q inv-q--music" data-q="music" style="height:0px"><div class="inv-music"><button>Play</button></div></div>'
    expect(checkIntegrity(page('', music)).ok).toBe(true)
    expect(reasons(checkIntegrity(page('.inv-music button{display:none}', music)))).toEqual(['music:display-none'])
  })

  it('judges the built-in sections inside a package page too', () => {
    const native = '<div data-inv-section="rsvp" data-inv-native="true"><section><button>Confirmar</button></section></div>'
    expect(checkIntegrity(page('', native)).ok).toBe(true)
    expect(checkIntegrity(page('[data-inv-section="rsvp"]{margin-left:-99999px}', native)).ok).toBe(false)
  })
})

describe('colorAlpha', () => {
  it.each([
    ['rgba(0, 0, 0, 0)', 0],
    ['rgb(0 0 0 / 0)', 0],
    ['rgb(0 0 0 / 50%)', 0.5],
    ['color(srgb 0 0 0 / 0)', 0],
    ['transparent', 0],
    ['rgb(10, 20, 30)', 1]
  ])('%s', (value, alpha) => expect(colorAlpha(value)).toBe(alpha))
})

describe('engine guarantees', () => {
  const css = readFileSync('src/modules/invitation/package/engine.css', 'utf8')
  const rule = selector => css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)))

  it('pins the system blocks with !important (visibility, hit testing, stacking, no transforms/clips)', () => {
    const pins = rule('.inv-root .inv-q,\n.inv-root [data-inv-native] {')
    for (const decl of ['position: relative', 'isolation: isolate', 'z-index: 20', 'visibility: visible', 'pointer-events: auto', 'clip-path: none', 'mask: none', 'filter: none', 'display: block']) {
      expect(pins).toContain(`${decl} !important`)
    }
    const motion = rule('.inv-root .inv-q:not([data-reveal]),')
    for (const decl of ['opacity: 1', 'transform: none', 'translate: none', 'scale: none', 'rotate: none']) expect(motion).toContain(`${decl} !important`)
  })

  it('forces reduced motion over whatever the package animates', () => {
    const block = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'))
    expect(block).toMatch(/animation: none !important/)
    expect(block).toMatch(/transition: none !important/)
    expect(block).toContain('[data-inv-pkg] *::before')
  })
})

describe('links around blocks', () => {
  it('does not draw a system block inside <a> (the link would hijack its clicks)', () => {
    const { root, warnings } = renderToDom(el('div', { class: 'pkg-x' }, el('a', { href: 'https://evil.example/pay' }, q('cta', { action: 'confirm' }), text('Pagar'))))
    expect(root.querySelector('a [data-q]')).toBeNull()
    expect(warnings.some(w => w.includes('inside <a>'))).toBe(true)
  })

  it('forces rel=noopener noreferrer on every external link, with or without target', () => {
    const { html } = renderToDom(el('div', { class: 'pkg-x' }, el('a', { href: 'https://example.com/x' }, text('a'))))
    expect(html).toContain('rel="noopener noreferrer"')
  })
})
