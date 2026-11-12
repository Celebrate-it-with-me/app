import { onMounted, onUnmounted, ref } from 'vue'

/**
 * One-time staggered entrance for the `[data-reveal]` children of `root`.
 * Without JS (or with reduced motion) everything is simply visible: the CSS only hides
 * nodes the observer has armed (`is-armed`), and `is-in` reveals them.
 */
export function useReveal(options = {}) {
  const root = ref(null)
  let observer
  let fallback

  onMounted(() => {
    const el = root.value
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
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
    const nodes = el.querySelectorAll('[data-reveal]')
    nodes.forEach(node => {
      node.classList.add('is-armed')
      observer.observe(node)
    })
    // Safety net: if the observer never fires (print, odd viewports, full-page captures),
    // nothing may stay hidden. Reveal everything after a few seconds regardless.
    fallback = setTimeout(() => nodes.forEach(node => node.classList.add('is-in')), 4000)
  })

  onUnmounted(() => {
    observer?.disconnect()
    clearTimeout(fallback)
  })

  return { root }
}
