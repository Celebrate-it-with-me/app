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

/** Per-element boxes for the cases the stacking model cannot express (a sliver peeking in at the bottom edge). */
const boxes = new WeakMap()
const rect = (left, top, right, bottom) => ({ left, top, right, bottom, width: right - left, height: bottom - top })

function rectOf(node) {
  if (boxes.has(node)) return boxes.get(node)
  const style = getComputedStyle(node)
  if (node.tagName === 'BODY' || node.tagName === 'HTML') return { left: 0, top: 0, right: VW, bottom: VH, width: VW, height: VH }
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
  Object.defineProperty(document.documentElement, 'clientHeight', { value: VH, configurable: true })
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
    const music = '<div class="inv-q inv-q--music" data-q="music" style="height:0px"><div class="inv-music" style="position:fixed"><button>Play</button></div></div>'
    expect(checkIntegrity(page('', music)).ok).toBe(true)
    expect(reasons(checkIntegrity(page('.inv-music button{display:none}', music)))).toEqual(['music:display-none'])
  })

  it('judges the built-in sections inside a package page too', () => {
    const native = '<div data-inv-section="rsvp" data-inv-native="true"><section><button>Confirmar</button></section></div>'
    expect(checkIntegrity(page('', native)).ok).toBe(true)
    expect(checkIntegrity(page('[data-inv-section="rsvp"]{margin-left:-99999px}', native)).ok).toBe(false)
  })
})

describe('integrity guard: system UI is not an occluder (B-1)', () => {
  const music = '<div class="inv-music" style="position:absolute;top:700px;bottom:0px;z-index:20"><button>Play</button></div>'
  const place = (root, name, box) => boxes.set(root.querySelector(`[data-q="${name}"]`), box)

  it('ignores a block that only peeks 25 px in under the fixed music control', () => {
    const root = page('', `${rsvp}${music}`)
    boxes.set(root.querySelector('.inv-music'), rect(0, 700, VW, VH))
    place(root, 'rsvp', rect(0, VH - 25, VW, VH + 175))
    boxes.set(root.querySelector('[data-q="rsvp"] form'), rect(0, VH - 25, VW, VH + 175))
    expect(checkIntegrity(root).problems).toEqual([])
  })

  it('does not count the music control as an occlusion on a block that is fully on screen either', () => {
    const root = page('', `${rsvp}${music}`)
    boxes.set(root.querySelector('.inv-music'), rect(0, 700, VW, VH))
    place(root, 'rsvp', rect(0, 720, VW, 790))
    boxes.set(root.querySelector('[data-q="rsvp"] form'), rect(0, 720, VW, 790))
    expect(checkIntegrity(root).problems).toEqual([])
  })

  it('does not flag the music control when a section scrolls over it (another system block is not a package overlay)', () => {
    const musicBlock = '<div class="inv-q inv-q--music" data-q="music" style="height:0px"><div class="inv-music" style="position:fixed;top:700px;bottom:0px;z-index:20"><button>Play</button></div></div>'
    const root = page('', `${musicBlock}${rsvp}`)
    boxes.set(root.querySelector('.inv-music'), rect(0, 700, VW, VH))
    boxes.set(root.querySelector('.inv-music button'), rect(10, 720, 60, 770))
    boxes.set(root.querySelector('[data-q="rsvp"]'), rect(0, 650, VW, 900))
    boxes.set(root.querySelector('[data-q="rsvp"] form'), rect(0, 650, VW, 900))
    boxes.set(root.querySelector('[data-q="rsvp"] label'), rect(0, 650, VW, 900))
    boxes.set(root.querySelector('[data-q="rsvp"] button'), rect(0, 650, VW, 900))
    expect(checkIntegrity(root).problems).toEqual([])
  })

  it('still detects a package overlay on a half-visible block', () => {
    const css = '.pkg-ov{position:absolute;top:700px;bottom:0px;left:0;z-index:10}'
    const root = page(css, `${rsvp}<div class="pkg-ov"><a class="pkg-ova" href="https://evil.example/x">x</a></div>`)
    boxes.set(root.querySelector('.pkg-ov'), rect(0, 700, VW, VH))
    place(root, 'rsvp', rect(0, 740, VW, 940))
    boxes.set(root.querySelector('[data-q="rsvp"]'), rect(0, 740, VW, 940))
    expect(reasons(checkIntegrity(root))).toContain('rsvp:covered')
  })

  it('still detects a package overlay that surrounds the music control', () => {
    const css = '.pkg-ov{position:absolute;top:100px;bottom:0px;left:0;z-index:10}'
    const root = page(css, `${rsvp}${music}<div class="pkg-ov"><a href="https://evil.example/x">x</a></div>`)
    boxes.set(root.querySelector('.pkg-ov'), rect(0, 0, VW, VH))
    boxes.set(root.querySelector('.inv-music'), rect(150, 60, 240, 100)) // only over the centre of the block
    place(root, 'rsvp', rect(0, 20, VW, 140))
    expect(reasons(checkIntegrity(root))).toContain('rsvp:covered')
  })
})

describe('integrity guard: content shoved sideways (I-2)', () => {
  const native = '<div data-inv-section="rsvp" data-inv-native="true"><section><button>Confirmar</button></section></div>'

  it('detects the children of a built-in section moved off the page', () => {
    const result = checkIntegrity(page('[data-inv-native] > *{margin-left:-99999px}', native))
    expect(reasons(result)).toEqual(['rsvp:off-page'])
  })

  it('detects a wrapper whose box still touches the viewport but whose content is off the page', () => {
    const root = page('', native)
    boxes.set(root.querySelector('[data-inv-native]'), rect(-99999, 20, VW, 60))
    boxes.set(root.querySelector('section'), rect(-99999, 20, -50000, 60))
    boxes.set(root.querySelector('button'), rect(-99999, 20, -99800, 60))
    expect(reasons(checkIntegrity(root))).toEqual(['rsvp:off-page'])
  })

  it('passes when the button is on screen', () => {
    expect(checkIntegrity(page('', native)).problems).toEqual([])
  })
})

describe('integrity guard: no viewport (I-3)', () => {
  it('does not measure while the document has no size, and judges once it has one', () => {
    const root = page('[data-q]{margin-left:-99999px}', `${cta}${rsvp}`)
    const restore = [document.documentElement.clientWidth, document.documentElement.clientHeight]
    for (const key of ['clientWidth', 'clientHeight']) Object.defineProperty(document.documentElement, key, { value: 0, configurable: true })
    const hidden = checkIntegrity(root)
    expect(hidden).toMatchObject({ ok: true, skipped: 'no-viewport', problems: [] })
    Object.defineProperty(document.documentElement, 'clientWidth', { value: restore[0], configurable: true })
    Object.defineProperty(document.documentElement, 'clientHeight', { value: restore[1], configurable: true })
    expect(checkIntegrity(root).ok).toBe(false)
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
  const css = readFileSync('src/modules/invitation/package/engine.css', 'utf8').replace(/\r\n/g, '\n') // CRLF or LF checkout
  const rule = selector => css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)))

  it('pins the system blocks with !important (visibility, hit testing, stacking, no transforms/clips)', () => {
    const pins = rule('.inv-root .inv-q,\n.inv-root [data-inv-native] {')
    for (const decl of ['position: relative', 'isolation: isolate', 'z-index: 20', 'visibility: visible', 'pointer-events: auto', 'clip-path: none', 'mask: none', 'filter: none', 'display: block']) {
      expect(pins).toContain(`${decl} !important`)
    }
    expect(rule('.inv-root [data-inv-native] {\n  margin-left')).toContain('margin-right: 0 !important')
    // Music keeps a fixed control inside its wrapper: no transform pin there (it would become the containing block).
    const motionSelectors = css.slice(css.indexOf('.inv-root .inv-q:not([data-reveal]'), css.indexOf('{', css.indexOf('.inv-root .inv-q:not([data-reveal]')))
    expect(motionSelectors).toContain('[data-q="music"]')
    expect(motionSelectors).toContain('[data-inv-section="music"]')
    const motion = rule('.inv-root .inv-q:not([data-reveal], [data-q="music"]),')
    for (const decl of ['opacity: 1', 'transform: none', 'translate: none', 'scale: none', 'rotate: none']) expect(motion).toContain(`${decl} !important`)
  })

  it('keeps every block hidden, pins included, while the package CSS loads (no unstyled paint, no CLS)', () => {
    const gate = css.slice(css.indexOf('.inv-root[data-inv-pkg="loading"] main,'), css.indexOf('}', css.indexOf('.inv-root[data-inv-pkg="loading"] main,')))
    expect(gate).toContain('.inv-root[data-inv-pkg="loading"] main *')
    expect(gate).toContain('visibility: hidden !important')
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
