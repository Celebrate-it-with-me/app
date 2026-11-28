import { computed, onScopeDispose, shallowReactive, watch } from 'vue'

/**
 * Screens with a bar fixed above the bottom navigation (e.g. the roster's "send" bar) declare it here, so the global
 * floating buttons (the assistant's "Tu siguiente paso") lift above it instead of covering it. One shared registry:
 * each bar reports its rendered height (0 while hidden by CSS or removed), the floating button reads the tallest one.
 */
export const BAR_GAP_PX = 8

/** Height of the floating button (h-12): an inline bar centres it on its own row. */
export const FLOATING_BUTTON_PX = 48

const bars = shallowReactive(new Map())
const inlineBars = shallowReactive(new Map())
let nextId = 0

/**
 * Height of the bar that shares its row with the floating button (declared with `{ inline: true }`), or 0 when none shows.
 * The button then stays beside the bar (never over it) and takes its icon form.
 */
export const floatingBarInline = computed(() => {
  let tallest = 0
  for (const height of inlineBars.values()) tallest = Math.max(tallest, height)
  return tallest
})

/** Extra bottom offset, in px, the floating buttons need so they clear every declared bar (0 when none is showing). */
export const floatingBarSpace = computed(() => {
  let tallest = 0
  for (const height of bars.values()) tallest = Math.max(tallest, height)
  if (tallest > 0) return Math.ceil(tallest) + BAR_GAP_PX
  // An inline bar does not push the button up: it only centres it vertically on the bar's row (may be slightly negative).
  return floatingBarInline.value > 0 ? (floatingBarInline.value - FLOATING_BUTTON_PX) / 2 : 0
})

/**
 * Declare a fixed bottom bar. `elRef` is the template ref of the bar element (it may come and go with a v-if).
 * `inline: true` is for a bar that leaves room at its right for the floating button (same row, centred on it).
 */
export function useFloatingBarSpace(elRef, { inline = false } = {}) {
  const id = nextId++
  const registry = inline ? inlineBars : bars
  let observer = null
  const report = height => {
    if (height > 0) registry.set(id, height)
    else registry.delete(id)
  }
  const stop = () => {
    observer?.disconnect()
    observer = null
    report(0)
  }
  watch(
    elRef,
    el => {
      stop()
      if (!el) return
      report(el.getBoundingClientRect().height)
      if (typeof ResizeObserver === 'undefined') return
      observer = new ResizeObserver(() => report(el.getBoundingClientRect().height))
      observer.observe(el)
    },
    { immediate: true, flush: 'post' }
  )
  onScopeDispose(stop)
}
