import { onScopeDispose, ref, toValue, watch } from 'vue'

export const HIDE_SCROLL_DELTA_PX = 8
export const HIDE_TOP_ZONE_PX = 16
const BOTTOM_ZONE_PX = 2

/**
 * `true` while the page is being scrolled down: hide something floating (a button) so it stops covering controls, and
 * bring it back as soon as she scrolls up, reaches the top or the end of the page. Stopping the scroll does NOT bring
 * it back (it would cover what she is about to tap). Passive listener, one `requestAnimationFrame` per burst.
 * @param {{ enabled?: import('vue').MaybeRefOrGetter<boolean>, keepVisible?: import('vue').MaybeRefOrGetter<boolean>,
 *   delta?: number, topZone?: number }} [options] `enabled` false (e.g. wide screens) never hides; `keepVisible` true
 *   (a panel open, focus inside) forces it visible.
 */
export function useHideOnScroll({ enabled = true, keepVisible = false, delta = HIDE_SCROLL_DELTA_PX, topZone = HIDE_TOP_ZONE_PX } = {}) {
  const hidden = ref(false)
  if (typeof window === 'undefined') return hidden

  let lastY = window.scrollY
  let frame = 0
  const root = () => document.documentElement

  const measure = () => {
    frame = 0
    if (!toValue(enabled) || toValue(keepVisible)) {
      hidden.value = false
      lastY = window.scrollY
      return
    }
    const y = window.scrollY
    if (y < topZone || y + window.innerHeight >= root().scrollHeight - BOTTOM_ZONE_PX) {
      hidden.value = false
      lastY = y
      return
    }
    const moved = y - lastY
    if (Math.abs(moved) < delta) return // too small to tell: keep accumulating from the same point
    hidden.value = moved > 0
    lastY = y
  }
  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(measure)
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  watch(
    () => !toValue(enabled) || toValue(keepVisible),
    mustShow => {
      if (mustShow) hidden.value = false
      lastY = window.scrollY
    }
  )

  onScopeDispose(() => {
    window.removeEventListener('scroll', onScroll)
    if (frame) window.cancelAnimationFrame(frame)
  })
  return hidden
}
