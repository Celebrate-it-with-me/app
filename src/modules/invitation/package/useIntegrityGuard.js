import { nextTick, onBeforeUnmount, watch } from 'vue'
import { BLOCK_SELECTOR, checkIntegrity } from './integrity'

/** After the entrance animations (longest reveal: 800 ms delay + 900 ms) and a late safety pass. */
export const GUARD_DELAYS = [1800, 4500]

/**
 * Runs the integrity check while a template package is drawn: once the page settles, after the fonts, after the
 * entrance animations, on resize, and when a block scrolls into view (the pointer test needs it on screen).
 * On a violation `onViolation(problems)` is called once; the caller drops the package CSS.
 * @param {{ root: import('vue').Ref<HTMLElement|null>, active: import('vue').Ref<boolean>, onViolation: (problems:object[]) => void }} options
 */
export function useIntegrityGuard({ root, active, onViolation }) {
  let timers = []
  let io = null
  let debounce
  let off = () => {}
  let ro = null
  const observed = new WeakSet()

  function run() {
    if (!active.value || !root.value) return
    const result = checkIntegrity(root.value)
    if (!result.ok) {
      stop()
      onViolation(result.problems)
    }
  }
  const later = (ms = 150) => {
    clearTimeout(debounce)
    debounce = setTimeout(run, ms)
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
    // A hidden iframe (0×0) cannot be measured: checkIntegrity skips it, and this re-arms the guard once it has a size.
    if (typeof ResizeObserver === 'function' && globalThis.document?.documentElement) {
      ro = new ResizeObserver(onResize)
      ro.observe(globalThis.document.documentElement)
    }
    // The pointer test needs enough of a block on screen: re-run at several visibility steps while it scrolls in.
    if ('IntersectionObserver' in window) io = new IntersectionObserver(entries => entries.some(e => e.isIntersecting) && later(), { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] })
    off = () => {
      window.removeEventListener('resize', onResize)
      globalThis.document?.removeEventListener('visibilitychange', onVisible)
    }
  }
  const onResize = () => later(250)
  const onVisible = () => !globalThis.document?.hidden && later(250)

  function stop() {
    timers.forEach(clearTimeout)
    timers = []
    clearTimeout(debounce)
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
