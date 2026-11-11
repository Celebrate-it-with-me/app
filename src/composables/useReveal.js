import { onMounted, onUnmounted, ref } from 'vue'

/**
 * One-time staggered entrance for the `[data-reveal]` children of `root`.
 * Without JS (or with reduced motion) everything is simply visible: the CSS only hides
 * elements once `is-reveal-ready` is on the root, and `is-in` reveals them.
 */
export function useReveal(options = {}) {
  const root = ref(null)
  let observer

  onMounted(() => {
    const el = root.value
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.classList.add('is-reveal-ready')
    observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px', ...options }
    )
    el.querySelectorAll('[data-reveal]').forEach(node => observer.observe(node))
  })

  onUnmounted(() => observer?.disconnect())

  return { root }
}
