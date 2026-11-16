import { nextTick, onBeforeUnmount, watch } from 'vue'
import { BLOCK_SELECTOR, checkIntegrity } from './integrity'

/** Quiet time before re-measuring after the pointer or the focus moved (a `:hover`/`:focus-within` overlay needs a moment to appear). */
export const POINTER_DEBOUNCE = 100
/** A violation seen right after the page became measurable (an iframe shown again) is confirmed once before it counts. */
export const CONFIRM_DELAY = 400

const POINTER_EVENTS = ['pointerover', 'pointerdown', 'focusin']

/** After the entrance animations (longest reveal: 800 ms delay + 900 ms) and a late safety pass. */
export const GUARD_DELAYS = [1800, 4500]

/**
 * Runs the integrity check while a template package is drawn: once the page settles, after the fonts, after the
 * entrance animations, on resize, when a block scrolls into view (the pointer test needs it on screen) and when the
 * pointer or the focus moves (W7 N-4: an overlay that exists only in `:hover`/`:focus-within`/`:active`).
 * On a violation `onViolation(problems)` is called once; the caller drops the package CSS.
 * @param {{ root: import('vue').Ref<HTMLElement|null>, active: import('vue').Ref<boolean>, onViolation: (problems:object[]) => void }} options
 */
export function useIntegrityGuard({ root, active, onViolation }) {
  let timers = []
  let io = null
  let debounce
  let pointerTimer = null
  let wasHidden = false
  let off = () => {}
  let ro = null
  const observed = new WeakSet()

  function run() {
    if (!active.value || !root.value) return
    const result = checkIntegrity(root.value)
    if (result.skipped) {
      wasHidden = true // not measurable (hidden iframe): keep watching, and distrust the first measure after it comes back
      return
    }
    if (!result.ok) {
      if (wasHidden) {
        wasHidden = false
        later(CONFIRM_DELAY)
        return
      }
      stop()
      onViolation(result.problems)
      return
    }
    wasHidden = false
  }
  const later = (ms = 150) => {
    clearTimeout(debounce)
    debounce = setTimeout(run, ms)
  }

  /** Pointer and focus moves: at most one measure per window, so a mouse sweep costs a bounded amount of work. */
  const onPointer = () => {
    if (pointerTimer || globalThis.document?.hidden) return
    pointerTimer = setTimeout(() => {
      pointerTimer = null
      run()
    }, POINTER_DEBOUNCE)
  }

  function watchBlocks() {
    if (!io || !root.value) return
    for (const block of root.value.querySelectorAll(BLOCK_SELECTOR)) {
      if (observed.has(block)) continue
      observed.add(block)
      io.observe(block)
    }
  }

  function start() {
    stop()
    nextTick(() => requestAnimationFrame?.(() => (watchBlocks(), run())))
    globalThis.document?.fonts?.ready?.then(() => later(0))
    timers = GUARD_DELAYS.map(ms => setTimeout(() => (watchBlocks(), run()), ms))
    window.addEventListener('resize', onResize)
    globalThis.document?.addEventListener('visibilitychange', onVisible)
    // Captured at the document so nothing in the page can stop them (a package has no script, but a stopPropagation is cheap to forbid).
    for (const type of POINTER_EVENTS) globalThis.document?.addEventListener(type, onPointer, { capture: true, passive: true })
    // A hidden iframe (0×0) cannot be measured: checkIntegrity skips it, and this re-arms the guard once it has a size.
    if (typeof ResizeObserver === 'function' && globalThis.document?.documentElement) {
      ro = new ResizeObserver(onResize)
      ro.observe(globalThis.document.documentElement)
      if (root.value) ro.observe(root.value)
    }
    // The pointer test needs enough of a block on screen: re-run at several visibility steps while it scrolls in.
    if ('IntersectionObserver' in window) io = new IntersectionObserver(entries => entries.some(e => e.isIntersecting) && later(), { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] })
    off = () => {
      window.removeEventListener('resize', onResize)
      globalThis.document?.removeEventListener('visibilitychange', onVisible)
      for (const type of POINTER_EVENTS) globalThis.document?.removeEventListener(type, onPointer, { capture: true })
    }
  }
  const onResize = () => later(250)
  const onVisible = () => !globalThis.document?.hidden && later(250)

  function stop() {
    timers.forEach(clearTimeout)
    timers = []
    clearTimeout(debounce)
    clearTimeout(pointerTimer)
    pointerTimer = null
    wasHidden = false
    io?.disconnect()
    io = null
    ro?.disconnect()
    ro = null
    off()
    off = () => {}
  }

  watch(active, value => (value ? start() : stop()), { immediate: true, flush: 'post' })
  onBeforeUnmount(stop)
  return { run }
}
