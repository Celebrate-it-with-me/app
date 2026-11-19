import { computed, onScopeDispose, shallowReactive, watch } from 'vue'

/**
 * Screens with a bar fixed above the bottom navigation (e.g. the roster's "send" bar) declare it here, so the global
 * floating buttons (the assistant's "Tu siguiente paso") lift above it instead of covering it. One shared registry:
 * each bar reports its rendered height (0 while hidden by CSS or removed), the floating button reads the tallest one.
 */
export const BAR_GAP_PX = 8

const bars = shallowReactive(new Map())
let nextId = 0

/** Extra bottom offset, in px, the floating buttons need so they clear every declared bar (0 when none is showing). */
export const floatingBarSpace = computed(() => {
  let tallest = 0
  for (const height of bars.values()) tallest = Math.max(tallest, height)
  return tallest > 0 ? Math.ceil(tallest) + BAR_GAP_PX : 0
})

/** Declare a fixed bottom bar. `elRef` is the template ref of the bar element (it may come and go with a v-if). */
export function useFloatingBarSpace(elRef) {
  const id = nextId++
  let observer = null
  const report = height => {
    if (height > 0) bars.set(id, height)
    else bars.delete(id)
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
