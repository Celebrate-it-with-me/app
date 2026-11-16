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
/** Smaller than this is a degenerate box (nothing to see, nothing to hit): `no-size`. */
const ZERO_BOX = 2
/**
 * Usable size of a control (W7 N-2). What matters is how much of a control survives its containers: a visible box
 * smaller than min(own size, MIN_BOX) on an axis means a container is cutting it down (an 8 px `overflow:hidden` frame).
 * It is compared with the control's own size, not absolute, so a 24 px text link is fine and the same link squeezed
 * to 8 px is not. Mirrors the server floor for block containers (48 px).
 */
export const MIN_BOX = 48
/** Slack for the clipped-size comparison (shadows, borders, sub-pixel rounding). */
const CLIP_SLACK = 2
/** A button-like control smaller than this on an axis is unusable (a 15 px RSVP button is a shrink attack). */
const MIN_CONTROL = 16
const MAX_ANCESTORS = 40
/** Less than this much of a block on screen (px tall) is not enough to judge who receives the pointer: wait for scroll. */
const MIN_VISIBLE = 40
/**
 * Legitimate system UI that floats over the page (music control, dialogs/popovers): covering a block is its job, so
 * a hit on it is neither "ok" nor an occlusion by the package. Package classes are forced to `pkg-*` by the
 * sanitiser, so a package cannot dress its own elements up as these.
 */
export const SYSTEM_UI_SELECTOR = '.inv-music, [data-inv-system-ui], [role="dialog"], [data-reka-popper-content-wrapper]'
/** Interactive controls the pointer test is run on, one by one (W7 N-1). */
export const CONTROL_SELECTOR = 'button, a[href], input, select, textarea, [role="button"]'
/** Controls judged per block and per run (cost bound; a block has a handful). */
const MAX_CONTROLS = 16

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

function intersect(a, b) {
  return a
    ? { left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) }
    : { left: b.left, top: b.top, right: b.right, bottom: b.bottom }
}

/** Walks the ancestors once, collecting what makes an element impossible to see or reach. */
function ancestry(el, win) {
  let opacity = 1
  let hidden = null
  let clip = null
  let hardClip = null
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
      clip = intersect(clip, box)
      // `hidden`/`clip` cannot be scrolled: whatever they cut off stays cut off. `auto`/`scroll` containers (a long list) can.
      if (/^(hidden|clip)$/.test(style.overflowX ?? '') || /^(hidden|clip)$/.test(style.overflowY ?? '')) hardClip = intersect(hardClip, box)
    }
  }
  return { opacity, hidden, clip, hardClip, hiddenByFilter, inCarousel }
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

const viewportOf = (win, doc) => ({
  width: doc.documentElement?.clientWidth || win.innerWidth,
  height: doc.documentElement?.clientHeight || win.innerHeight
})

/**
 * Who received the pointer at a sampled point of `target` (a block, or a control inside `owner`)?
 *  - ok:     the target itself, or the owner block's own markup.
 *  - system: floating system UI (music control, dialogs, popovers) or app chrome outside the package page: covering a
 *            block is its job, and a package cannot dress its own elements up as these (its classes are `pkg-*`).
 *  - other:  anything else drawn in the page: package markup, or another system block (W7 N-3: a block that sits on top
 *            of the RSVP is no excuse). `lenient` (the music control only) lets other blocks pass: a section scrolling
 *            over the fixed player is not the package's doing.
 */
function hitKind(hit, target, owner, doc, lenient = false) {
  if (!hit) return 'other'
  if (hit === target || target.contains(hit)) return 'ok'
  if (hit.closest?.(SYSTEM_UI_SELECTOR)) return 'system'
  if (owner.contains(hit)) return 'ok'
  const rootEl = owner.closest?.('.inv-root')
  const page = owner.closest?.('main') ?? rootEl
  // Nothing in the page took the pointer (the control or block lets clicks fall through to the background).
  if (hit === doc.documentElement || hit === doc.body || hit === rootEl || hit === page) return 'other'
  if (!page || !page.contains(hit)) return 'system' // teleported UI (toasts, dialogs), the language switch
  if (lenient && hit.closest?.(BLOCK_SELECTOR)) return 'system'
  return 'other'
}

/**
 * Can the pointer reach `el`? null when there is nothing to judge: no part of it in the viewport, too little of it
 * on screen, or every sampled point is under legitimate system UI (the music control).
 */
function pointerReach(el, doc, win, clip, owner, lenient) {
  const box = el.getBoundingClientRect()
  const view = viewportOf(win, doc)
  const x1 = Math.max(box.left, 0, clip?.left ?? 0)
  const x2 = Math.min(box.right, view.width, clip?.right ?? Infinity)
  const y1 = Math.max(box.top, 0, clip?.top ?? 0)
  const y2 = Math.min(box.bottom, view.height, clip?.bottom ?? Infinity)
  if (x2 - x1 < ZERO_BOX || y2 - y1 < ZERO_BOX || typeof doc.elementFromPoint !== 'function') return null
  // A sliver peeking in at the edge of the screen: it is judged once enough of it is visible (the guard re-runs on scroll).
  if (y2 - y1 < Math.min(MIN_VISIBLE, box.height)) return null
  // Sample inside the visible part only: the middle of the whole box may be far off screen.
  const sample = (fx, fy) => hitKind(doc.elementFromPoint(x1 + (x2 - x1) * fx, y1 + (y2 - y1) * fy), el, owner, doc, lenient)
  const center = sample(0.5, 0.5)
  const points = [center, sample(0.25, 0.25), sample(0.75, 0.25), sample(0.25, 0.75), sample(0.75, 0.75)].filter(kind => kind !== 'system')
  if (!points.length) return null
  if (center === 'other') return false
  return points.filter(kind => kind === 'ok').length * 2 > points.length
}

const BUTTON_LIKE = control => {
  const tag = control.tagName
  if (tag === 'BUTTON' || tag === 'SELECT' || tag === 'TEXTAREA') return true
  if (control.getAttribute('role') === 'button') return true
  // Checkboxes and radios are drawn small and often hidden behind a styled label.
  return tag === 'INPUT' && !/^(checkbox|radio|hidden|file|range|color)$/i.test(control.type)
}

/** The 9 points sampled on a control: centre, 4 corners and 4 side midpoints, inset a few px so rounded edges do not count. */
export function samplePoints(x1, y1, x2, y2) {
  const inset = Math.min(3, (x2 - x1) / 4, (y2 - y1) / 4)
  const xs = [x1 + inset, (x1 + x2) / 2, x2 - inset]
  const ys = [y1 + inset, (y1 + y2) / 2, y2 - inset]
  return ys.flatMap(y => xs.map(x => [x, y]))
}

/**
 * W7 N-1 / N-2: every interactive control inside the block is judged on its own, not only the block. An invisible link
 * over a strip of the RSVP button, a frame that cuts it down to a few pixels, or a block that takes its place all
 * leave the block "reachable" at its centre while the button is not.
 * Returns the reason, or null.
 */
function controlProblem(block, doc, win) {
  const view = viewportOf(win, doc)
  let judged = 0
  for (const control of block.querySelectorAll(CONTROL_SELECTOR)) {
    if (judged >= MAX_CONTROLS) break
    if (control.closest('.inv-music, .inv-carousel, [data-carousel], [hidden], [inert], [aria-hidden="true"]') || control.type === 'hidden') continue
    const box = control.getBoundingClientRect()
    if (box.width < ZERO_BOX || box.height < ZERO_BOX) continue // collapsed, or a visually hidden helper (sr-only)
    const style = win.getComputedStyle(control)
    if (style.display === 'none' || style.visibility === 'hidden') continue
    // Clicks fall through a control that is not "pointable" (a disabled button legitimately looks like that).
    if (style.pointerEvents === 'none' && !control.disabled && control.getAttribute('aria-disabled') !== 'true') return 'control-pointer-events-none'
    const { hidden, clip, hardClip } = ancestry(control, win)
    if (hidden) continue
    // Shrunk to a speck, or cut down by a frame (the frame's own size is what is measured, not the control's).
    if (BUTTON_LIKE(control) && (box.width < MIN_CONTROL || box.height < MIN_CONTROL)) return 'control-too-small'
    if (hardClip) {
      const w = Math.min(box.right, hardClip.right) - Math.max(box.left, hardClip.left)
      const h = Math.min(box.bottom, hardClip.bottom) - Math.max(box.top, hardClip.top)
      if (w < Math.min(box.width, MIN_BOX) - CLIP_SLACK || h < Math.min(box.height, MIN_BOX) - CLIP_SLACK) return 'control-clipped'
    }
    const x1 = Math.max(box.left, 0, clip?.left ?? 0)
    const x2 = Math.min(box.right, view.width, clip?.right ?? Infinity)
    const y1 = Math.max(box.top, 0, clip?.top ?? 0)
    const y2 = Math.min(box.bottom, view.height, clip?.bottom ?? Infinity)
    if (x2 - x1 < ZERO_BOX || y2 - y1 < ZERO_BOX) continue // not on screen yet: judged once scrolled in
    if (y2 - y1 < Math.min(MIN_VISIBLE, box.height)) continue // a sliver: wait for scroll (and the fixed player may sit on it)
    judged++
    for (const [x, y] of samplePoints(x1, y1, x2, y2)) {
      if (hitKind(doc.elementFromPoint(x, y), control, block, doc) === 'other') return 'control-covered'
    }
  }
  return null
}

/** Does this computed style make the element the containing block of `position: fixed` descendants? */
function fixedBreaker(style) {
  const on = value => !!value && value !== 'none' && value !== 'normal' && value !== 'auto'
  if (['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter', 'backdropFilter'].some(key => on(style[key]))) return true
  if (/paint|layout|strict|content/.test(style.contain ?? '') && !/^none$/.test(style.contain)) return true
  if (/transform|perspective|filter|translate|scale|rotate/.test(style.willChange ?? '')) return true
  return /size|inline-size/.test(style.containerType ?? '')
}

/**
 * W7 N-5: the player is a `position: fixed` control that must stay on screen while the page scrolls. Any transform-like
 * property on an ancestor (a `data-reveal` entrance leaves `translate: 0 0` behind) turns that ancestor into its
 * containing block and the player scrolls away with the page.
 */
function musicFixedProblem(block, win, doc) {
  const music = block.matches?.('.inv-music') ? block : block.querySelector?.('.inv-music')
  if (!music) return null
  if (win.getComputedStyle(music).position !== 'fixed') return 'music-not-fixed'
  let depth = 0
  for (let node = music.parentElement; isElement(node) && depth < MAX_ANCESTORS; node = node.parentElement, depth++) {
    if (fixedBreaker(win.getComputedStyle(node))) return 'music-not-fixed'
  }
  const view = viewportOf(win, doc)
  const box = (music.querySelector('button') ?? music).getBoundingClientRect()
  if (box.width >= ZERO_BOX && (box.bottom <= 0 || box.top >= view.height || box.right <= 0 || box.left >= view.width)) return 'music-off-screen'
  return null
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
    if (rect.width < ZERO_BOX || rect.height < ZERO_BOX) return false
    seen++
    return Math.min(rect.right, width) - Math.max(rect.left, 0) >= ZERO_BOX
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
  const { opacity, hidden, clip, hardClip, hiddenByFilter, inCarousel } = ancestry(probe, win)
  const style = win.getComputedStyle(probe)
  if (hidden) return hidden
  if (style.visibility === 'hidden') return 'visibility-hidden'
  if (hiddenByFilter) return 'filter-hidden'
  if (opacity < MIN_OPACITY) return 'transparent'
  if (style.pointerEvents === 'none' && !isProbe) return 'pointer-events-none'

  const box = probe.getBoundingClientRect()
  if (!isProbe && !hasContent(probe)) return null // legitimately empty (no photos, event already over…)
  if (box.width < ZERO_BOX || box.height < ZERO_BOX) return 'no-size'
  if (!inCarousel) {
    const width = doc.documentElement.clientWidth || win.innerWidth
    if (box.right <= 0 || box.left >= width) return 'off-page'
    if (box.bottom + (win.scrollY ?? 0) <= 0) return 'off-page'
  }
  if (clip) {
    const w = Math.min(box.right, clip.right) - Math.max(box.left, clip.left)
    const h = Math.min(box.bottom, clip.bottom) - Math.max(box.top, clip.top)
    if (!inCarousel && (w < ZERO_BOX || h < ZERO_BOX)) return 'clipped'
  }
  // W7 N-2: a frame that cuts the block (or its content) down to a few pixels with `overflow: hidden`, whatever its size.
  if (hardClip && !isProbe && !inCarousel) {
    const w = Math.min(box.right, hardClip.right) - Math.max(box.left, hardClip.left)
    const h = Math.min(box.bottom, hardClip.bottom) - Math.max(box.top, hardClip.top)
    if (w < Math.min(box.width, MIN_BOX) - CLIP_SLACK || h < Math.min(box.height, MIN_BOX) - CLIP_SLACK) return 'clipped'
  }
  if (!inCarousel && !isProbe && !clip && contentOutsideViewport(probe, win, doc)) return 'off-page'
  const text = textProblems(probe, win)
  if (text.length) return text[0]
  const musicProblem = musicFixedProblem(block, win, doc)
  if (musicProblem) return musicProblem
  if (!inCarousel) {
    const reach = pointerReach(probe, doc, win, clip, block, isProbe)
    if (reach === false) return 'covered'
    if (!isProbe) {
      const control = controlProblem(block, doc, win)
      if (control) return control
    }
  }
  return null
}

/**
 * False while the page has no real size: an iframe in a hidden tab (`display:none` parent) or a collapsed one.
 * Neither `innerWidth/innerHeight` nor `documentElement.clientWidth/clientHeight` can tell: Chromium keeps the last
 * values of both in a hidden iframe while every box in it measures 0 (verification I-3). The `<body>` box does collapse
 * to 0 there, so it is the gate. The `.inv-root` box is deliberately NOT a criterion: a package that hides the root
 * (`display:none`) leaves the body with its width and must be judged, not skipped.
 */
export function viewportMeasurable(win = window, doc = win.document) {
  const docEl = doc.documentElement
  if (!(docEl?.clientWidth > 0 && docEl?.clientHeight > 0)) return false
  const body = doc.body?.getBoundingClientRect?.()
  return !body || body.width > 0
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
