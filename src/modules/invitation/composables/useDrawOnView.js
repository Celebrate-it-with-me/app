import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Arms the `[data-draw]` flourishes inside `root` and lets them draw once when they scroll
 * into view. Without IntersectionObserver or with reduced motion they are simply visible:
 * the CSS only hides nodes that carry `is-armed`.
 */
export function useDrawOnView() {
  const root = ref(null)
  let observer
  let fallback

  onMounted(() => {
    const el = root.value
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const nodes = [...el.querySelectorAll('[data-draw]')]
    observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.6 }
    )
    nodes.forEach(node => {
      node.classList.add('is-armed')
      observer.observe(node)
    })
    // Nothing may stay hidden if the observer never fires (print, odd viewports, captures).
    // Shown instantly: a transition started while off-screen may never advance.
    fallback = setTimeout(() => nodes.forEach(node => node.classList.add('is-in', 'is-instant')), 4000)
  })

  onUnmounted(() => {
    observer?.disconnect()
    clearTimeout(fallback)
  })

  return root
}
