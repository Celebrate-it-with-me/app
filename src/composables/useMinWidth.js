import { onBeforeUnmount, ref } from 'vue'

/**
 * Reactive `(min-width: Npx)`. Without `matchMedia` (tests, old browsers) it answers `fallback`, so a screen that
 * only mounts something heavy on wide viewports still renders it there.
 * @param {number} px
 * @param {boolean} [fallback]
 */
export function useMinWidth(px, fallback = true) {
  const matches = ref(fallback)
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return matches
  const query = window.matchMedia(`(min-width: ${px}px)`)
  matches.value = query.matches
  const update = e => (matches.value = e.matches)
  query.addEventListener('change', update)
  onBeforeUnmount(() => query.removeEventListener('change', update))
  return matches
}
