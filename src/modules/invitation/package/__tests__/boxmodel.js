/**
 * A tiny layout stand-in for jsdom (which has none): every element that has `data-box="left,top,right,bottom"` gets
 * that rectangle, the others inherit the one of their parent. Hit testing follows what matters to the guard: pointer-events,
 * display/visibility, `overflow: hidden` clipping, and z-index then document order. The browser run of the same attacks
 * is in scripts/screenshots/guard-w7-shot.mjs.
 */
export const VW = 390
export const VH = 800

const parse = node => {
  const raw = node.getAttribute?.('data-box')
  if (!raw) return null
  const [left, top, right, bottom] = raw.split(',').map(Number)
  return { left, top, right, bottom, width: right - left, height: bottom - top }
}

export function rectOf(node) {
  const own = parse(node)
  if (own) return own
  if (node.tagName === 'BODY' || node.tagName === 'HTML') return { left: 0, top: 0, right: VW, bottom: VH, width: VW, height: VH }
  if (node.classList?.contains('inv-root') || node.tagName === 'MAIN') return { left: 0, top: 0, right: VW, bottom: VH, width: VW, height: VH }
  if (getComputedStyle(node).display === 'none') return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
  return node.parentElement ? rectOf(node.parentElement) : { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
}

const stackZ = node => {
  let best = 0
  for (let n = node; n && n.tagName !== 'BODY'; n = n.parentElement) best = Math.max(best, parseInt(getComputedStyle(n).zIndex, 10) || 0)
  return best
}

function clippedOut(node, x, y) {
  for (let n = node.parentElement; n && n.tagName !== 'BODY'; n = n.parentElement) {
    const s = getComputedStyle(n)
    if (/hidden|clip/.test(`${s.overflowX} ${s.overflowY} ${s.overflow}`)) {
      const r = rectOf(n)
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return true
    }
  }
  return false
}

export function hitTest(x, y) {
  const all = [...document.body.querySelectorAll('*')].filter(node => {
    const style = getComputedStyle(node)
    if (style.pointerEvents === 'none' || style.display === 'none' || style.visibility === 'hidden') return false
    const r = rectOf(node)
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom && !clippedOut(node, x, y)
  })
  return all.sort((a, b) => stackZ(a) - stackZ(b) || all.indexOf(a) - all.indexOf(b)).pop() ?? document.body
}

/** Installs the stand-in; returns the helpers and an `uninstall`. */
export function installBoxModel() {
  const saved = { gbr: Element.prototype.getBoundingClientRect, efp: document.elementFromPoint }
  const define = (target, key, value) => Object.defineProperty(target, key, { value, configurable: true })
  define(window, 'innerWidth', VW)
  define(window, 'innerHeight', VH)
  define(document.documentElement, 'clientWidth', VW)
  define(document.documentElement, 'clientHeight', VH)
  Element.prototype.getBoundingClientRect = function () {
    return rectOf(this)
  }
  document.elementFromPoint = hitTest
  const sheet = document.createElement('style')
  document.head.appendChild(sheet)
  return {
    sheet,
    page(css, html) {
      sheet.textContent = css
      document.body.innerHTML = `<div class="inv-root"><main>${html}</main></div>`
      return document.querySelector('.inv-root')
    },
    uninstall() {
      sheet.remove()
      document.body.innerHTML = ''
      Element.prototype.getBoundingClientRect = saved.gbr
      if (saved.efp) document.elementFromPoint = saved.efp
      else delete document.elementFromPoint
    }
  }
}

export const blockAttrs = 'style="position:relative;z-index:20"'
/** An RSVP block as the engine draws it: pinned at z-index 20, a label and a 50 px button. */
export const rsvpBlock = (inner = '<button type="submit" data-box="40,230,350,280">Enviar</button>') =>
  `<div class="inv-q inv-q--rsvp" data-q="rsvp" data-box="0,100,390,300" ${blockAttrs}><form><label>Nombre</label>${inner}</form></div>`
