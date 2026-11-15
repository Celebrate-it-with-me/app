/**
 * Runtime integrity guard for template packages (security audit W6-02 / W6-03).
 *
 * A package ships third-party CSS. engine.css pins the system blocks, but pinning cannot enumerate every way of
 * hiding, shrinking, moving, clipping or covering a control. This module measures the real page instead: every
 * system block that is present (RSVP, countdown, music, gallery… and the built-in sections drawn inside a package)
 * must be visible, have a real size, sit inside the page, show readable text and receive the pointer. If one does
 * not, the caller drops the package CSS and the invitation falls back to the built-in Clásica.
 *
 * Pure functions over a document/window pair so they can be tested without a browser.
 */

/** System blocks: the `<q-*>` wrappers and the built-in sections that live inside a package page. */
export const BLOCK_SELECTOR = '[data-q], [data-inv-native]'

const MIN_OPACITY = 0.1
const MIN_BOX = 2
const MAX_ANCESTORS = 40
/** Less than this much of a block on screen (px tall) is not enough to judge who receives the pointer: wait for scroll. */
const MIN_VISIBLE = 40
/**
 * Legitimate system UI that floats over the page (music control, dialogs/popovers): covering a block is its job, so
 * a hit on it is neither "ok" nor an occlusion by the package. Package classes are forced to `pkg-*` by the
 * sanitiser, so a package cannot dress its own elements up as these.
 */
export const SYSTEM_UI_SELECTOR = '.inv-music, [data-inv-system-ui], [role="dialog"], [data-reka-popper-content-wrapper]'

/** Alpha channel (0..1) of a computed colour string (`rgba(…)`, `rgb(… / 50%)`, `color(srgb … / 0)`, `transparent`). */
export function colorAlpha(value) {
  if (typeof value !== 'string' || !value) return 1
  const v = value.trim().toLowerCase()
  if (v === 'transparent') return 0
  const slash = v.match(/\/\s*([\d.]+)(%?)\s*\)$/)
  if (slash) return slash[2] ? parseFloat(slash[1]) / 100 : parseFloat(slash[1])
  const legacy = v.match(/^rgba\(([^)]*)\)$/) || v.match(/^hsla\(([^)]*)\)$/)
  if (legacy) {
    const parts = legacy[1].split(',').map(part => part.trim())
    if (parts.length >= 4) return parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])
  }
  return 1
}

const isElement = node => !!node && node.nodeType === 1
const num = (value, fallback = 0) => (Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback)

function animating(el) {
  try {
    return typeof el.getAnimations === 'function' && el.getAnimations().length > 0
  } catch {
    return false
  }
}

/** Walks the ancestors once, collecting what makes an element impossible to see or reach. */
function ancestry(el, win) {
  let opacity = 1
  let hidden = null
  let clip = null
  let hiddenByFilter = false
  let inCarousel = false
  let depth = 0
  for (let node = el; isElement(node) && depth < MAX_ANCESTORS; node = node.parentElement, depth++) {
    const style = win.getComputedStyle(node)
    if (style.display === 'none') hidden = hidden ?? 'display-none'
    // An element that is still being revealed by the engine (armed, or mid-animation) is allowed to be transparent.
    const reveal = node.hasAttribute('data-reveal') && (node.classList.contains('pk-armed') || animating(node))
    if (!reveal) opacity *= num(style.opacity, 1)
    if (/opacity\(\s*0(\.0+)?%?\s*\)/.test(style.filter ?? '')) hiddenByFilter = true
    if (node.hasAttribute('data-carousel') || node.classList.contains('inv-carousel__track')) inCarousel = true
    if (node !== el && ((style.overflowX && style.overflowX !== 'visible') || (style.overflowY && style.overflowY !== 'visible'))) {
      const box = node.getBoundingClientRect()
      clip = clip
        ? { left: Math.max(clip.left, box.left), top: Math.max(clip.top, box.top), right: Math.min(clip.right, box.right), bottom: Math.min(clip.bottom, box.bottom) }
        : { left: box.left, top: box.top, right: box.right, bottom: box.bottom }
    }
  }
  return { opacity, hidden, clip, hiddenByFilter, inCarousel }
}

function hasContent(el) {
  if (el.querySelector('img, svg, button, a, input, select, textarea, canvas, video')) return true
  return (el.textContent ?? '').trim().length > 0
}

/** First ancestor background that is fully opaque (as a computed string), or null. */
function opaqueBackground(el, win) {
  for (let node = el, depth = 0; isElement(node) && depth < MAX_ANCESTORS; node = node.parentElement, depth++) {
    const bg = win.getComputedStyle(node).backgroundColor
    if (colorAlpha(bg) >= 0.99) return bg
  }
  return null
}

function textProblems(block, win) {
  const problems = []
  const walker = block.ownerDocument.createTreeWalker(block, 4 /* NodeFilter.SHOW_TEXT */)
  const seen = new Set()
  for (let text = walker.nextNode(); text && seen.size < 8; text = walker.nextNode()) {
    const owner = text.parentElement
    if (!owner || seen.has(owner) || !text.nodeValue.trim()) continue
    seen.add(owner)
    const box = owner.getBoundingClientRect()
    if (box.width < 1 || box.height < 1) continue // visually hidden helpers (sr-only) are not the problem
    const style = win.getComputedStyle(owner)
    if (style.visibility === 'hidden') problems.push('text-hidden')
    else if (colorAlpha(style.color) < 0.05 || colorAlpha(style.webkitTextFillColor) < 0.05) problems.push('text-transparent')
    else if (num(style.fontSize, 16) < 2) problems.push('text-tiny')
    else if (style.color && style.color === opaqueBackground(owner, win)) problems.push('text-same-as-background')
    else {
      // Text pushed out of its own box (text-indent: -9999px and friends).
      const range = block.ownerDocument.createRange?.()
      if (range && typeof range.getBoundingClientRect === 'function') {
        range.selectNodeContents(text)
        const rect = range.getBoundingClientRect()
        if (rect.width > 0 && (rect.right < box.left - 2 || rect.left > box.right + 2)) problems.push('text-displaced')
      }
    }
    if (problems.length) break
  }
  return problems
}

/**
 * Can the pointer reach `el`? null when there is nothing to judge: no part of it in the viewport, too little of it
 * on screen, or every sampled point is under legitimate system UI (the music control).
 */
function pointerReach(el, doc, win, clip) {
  const box = el.getBoundingClientRect()
  const x1 = Math.max(box.left, 0, clip?.left ?? 0)
  const x2 = Math.min(box.right, win.innerWidth, clip?.right ?? Infinity)
  const y1 = Math.max(box.top, 0, clip?.top ?? 0)
  const y2 = Math.min(box.bottom, win.innerHeight, clip?.bottom ?? Infinity)
  if (x2 - x1 < MIN_BOX || y2 - y1 < MIN_BOX || typeof doc.elementFromPoint !== 'function') return null
  // A sliver peeking in at the edge of the screen: it is judged once enough of it is visible (the guard re-runs on scroll).
  if (y2 - y1 < Math.min(MIN_VISIBLE, box.height)) return null
  // Sample inside the visible part only: the middle of the whole box may be far off screen.
  const sample = (fx, fy) => {
    const hit = doc.elementFromPoint(x1 + (x2 - x1) * fx, y1 + (y2 - y1) * fy)
    if (!hit) return 'other'
    if (hit === el || el.contains(hit)) return 'ok'
    return hit.closest?.(SYSTEM_UI_SELECTOR) ? 'system' : 'other'
  }
  const center = sample(0.5, 0.5)
  const points = [center, sample(0.25, 0.25), sample(0.75, 0.25), sample(0.25, 0.75), sample(0.75, 0.75)].filter(kind => kind !== 'system')
  if (!points.length) return null
  if (center === 'other') return false
  return points.filter(kind => kind === 'ok').length * 2 > points.length
}

const REACH_SELECTOR = 'img, svg, canvas, video, button, a, input, select, textarea'

/**
 * A block whose content was shoved out of the screen sideways (negative margins on the block or on its children) can
 * still have a box that touches the viewport. At least one visible piece of content (control, media or text) must be
 * inside the horizontal area of the page.
 */
function contentOutsideViewport(block, win, doc) {
  const width = doc.documentElement.clientWidth || win.innerWidth
  let seen = 0
  const inside = node => {
    const rect = node.getBoundingClientRect()
    if (rect.width < MIN_BOX || rect.height < MIN_BOX) return false
    seen++
    return Math.min(rect.right, width) - Math.max(rect.left, 0) >= MIN_BOX
  }
  for (const node of block.querySelectorAll(REACH_SELECTOR)) if (inside(node)) return false
  const walker = doc.createTreeWalker(block, 4 /* NodeFilter.SHOW_TEXT */)
  let checked = 0
  for (let text = walker.nextNode(); text && checked < 12; text = walker.nextNode()) {
    if (!text.nodeValue.trim() || !text.parentElement) continue
    checked++
    if (inside(text.parentElement)) return false
  }
  return seen > 0
}

/** The element to measure for a block: music draws a fixed control inside an empty wrapper. */
function probeOf(block) {
  if (block.matches('[data-q="music"]') || block.querySelector('.inv-music')) return block.querySelector('.inv-music button') ?? block.querySelector('.inv-music')
  return block
}

function nameOf(block) {
  return block.getAttribute('data-q') ?? block.getAttribute('data-inv-section') ?? 'block'
}

/**
 * Checks one system block. Returns the reason it is unusable, or null.
 * @param {Element} block
 * @param {{ win?: Window, doc?: Document }} env
 */
export function blockProblem(block, { win = window, doc = window.document } = {}) {
  if (block.closest('a')) return 'inside-link'
  const probe = probeOf(block)
  const isProbe = probe !== block
  const { opacity, hidden, clip, hiddenByFilter, inCarousel } = ancestry(probe, win)
  const style = win.getComputedStyle(probe)
  if (hidden) return hidden
  if (style.visibility === 'hidden') return 'visibility-hidden'
  if (hiddenByFilter) return 'filter-hidden'
  if (opacity < MIN_OPACITY) return 'transparent'
  if (style.pointerEvents === 'none' && !isProbe) return 'pointer-events-none'

  const box = probe.getBoundingClientRect()
  if (!isProbe && !hasContent(probe)) return null // legitimately empty (no photos, event already over…)
  if (box.width < MIN_BOX || box.height < MIN_BOX) return 'no-size'
  if (!inCarousel) {
    const width = doc.documentElement.clientWidth || win.innerWidth
    if (box.right <= 0 || box.left >= width) return 'off-page'
    if (box.bottom + (win.scrollY ?? 0) <= 0) return 'off-page'
  }
  if (clip) {
    const w = Math.min(box.right, clip.right) - Math.max(box.left, clip.left)
    const h = Math.min(box.bottom, clip.bottom) - Math.max(box.top, clip.top)
    if (!inCarousel && (w < MIN_BOX || h < MIN_BOX)) return 'clipped'
  }
  if (!inCarousel && !isProbe && !clip && contentOutsideViewport(probe, win, doc)) return 'off-page'
  const text = textProblems(probe, win)
  if (text.length) return text[0]
  if (!inCarousel) {
    const reach = pointerReach(probe, doc, win, clip)
    if (reach === false) return 'covered'
  }
  return null
}

/** False while the viewport has no real size (0×0 iframe in a hidden tab, `display:none` parent). */
export function viewportMeasurable(win = window, doc = window.document) {
  const width = doc.documentElement?.clientWidth || win.innerWidth
  return width > 0 && win.innerHeight > 0
}

/**
 * Checks every system block under `root`.
 * @returns {{ ok: boolean, blocks: number, problems: { block: string, reason: string }[] }}
 */
export function checkIntegrity(root, env = {}) {
  const win = env.win ?? root.ownerDocument.defaultView ?? window
  const doc = env.doc ?? root.ownerDocument
  // Nothing can be measured while the document has no size (an iframe in a hidden tab) or is hidden: not a violation.
  if (!viewportMeasurable(win, doc)) return { ok: true, blocks: 0, problems: [], skipped: 'no-viewport' }
  const problems = []
  let blocks = 0
  const seen = new Set()
  for (const block of root.querySelectorAll(BLOCK_SELECTOR)) {
    // A block nested in another one (a native section inside a wrapper) is judged by the outer block.
    if (seen.has(block)) continue
    blocks++
    block.querySelectorAll(BLOCK_SELECTOR).forEach(inner => seen.add(inner))
    const reason = blockProblem(block, { win, doc })
    if (reason) problems.push({ block: nameOf(block), reason })
  }
  return { ok: problems.length === 0, blocks, problems }
}
