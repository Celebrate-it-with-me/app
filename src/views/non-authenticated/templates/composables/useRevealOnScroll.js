// src/composables/useRevealOnScroll.js
import { onUnmounted } from 'vue'

export function useRevealOnScroll(options = {}) {
  const {
    rootEl,
    selector = '[data-reveal]',
    threshold = 0.12,
    rootMargin = '0px 0px -12% 0px'
  } = options

  if (!rootEl) return () => {}

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const elements = Array.from(rootEl.querySelectorAll(selector))

  // Apply initial state (no layout shift: transform + opacity only)
  elements.forEach(el => {
    if (prefersReduced) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    const dir = el.getAttribute('data-reveal') || 'up'
    const dy = dir === 'up' ? 14 : dir === 'down' ? -14 : 0
    const delay = Number(el.getAttribute('data-reveal-delay') || 0)

    el.style.opacity = '0'
    el.style.transform = `translate3d(0, ${dy}px, 0)`
    el.style.willChange = 'transform, opacity'
    el.style.transitionProperty = 'transform, opacity'
    el.style.transitionDuration = '700ms'
    el.style.transitionTimingFunction = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    el.style.transitionDelay = `${delay}ms`
  })

  if (prefersReduced) return () => {}

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target
        el.style.opacity = '1'
        el.style.transform = 'translate3d(0, 0px, 0)'
        io.unobserve(el)
      })
    },
    { root: rootEl, threshold, rootMargin }
  )

  elements.forEach(el => io.observe(el))

  const stop = () => {
    io.disconnect()
  }

  onUnmounted(stop)
  return stop
}
