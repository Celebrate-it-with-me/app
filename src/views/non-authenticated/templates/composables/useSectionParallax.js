// src/composables/useSectionParallax.js
import { onUnmounted } from 'vue'

export function useSectionParallax(options = {}) {
  const {
    scrollEl,
    sectionSelector = '[data-parallax-section]',
    bgSelector = '[data-parallax-bg]',
    intensity = 0.28,
    maxTranslate = 18
  } = options

  if (!scrollEl) return () => {}

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) return () => {}

  let rafId = 0
  let ticking = false

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

  const getNumberAttr = (el, name, fallback) => {
    const raw = el.getAttribute(name)
    if (raw === null || raw === undefined || raw === '') return fallback
    const num = Number(raw)
    return Number.isFinite(num) ? num : fallback
  }

  const update = () => {
    ticking = false

    const viewportH = scrollEl.clientHeight
    const sections = scrollEl.querySelectorAll(sectionSelector)

    sections.forEach(section => {
      const bg = section.querySelector(bgSelector)
      if (!bg) return

      // Per-section tuning (optional)
      const localIntensity = getNumberAttr(section, 'data-parallax-intensity', intensity)
      const localMax = getNumberAttr(section, 'data-parallax-max', maxTranslate)

      const rect = section.getBoundingClientRect()

      // Visible inside scroll container viewport
      const visible = rect.bottom > 0 && rect.top < viewportH
      if (!visible) {
        bg.style.transform = 'translate3d(0, 0px, 0)'
        return
      }

      /**
       * progress:
       * -1 when section center is at bottom edge
       *  0 when section center is at viewport center
       *  1 when section center is at top edge
       */
      const centerY = rect.top + rect.height / 2
      const normalized = (centerY - viewportH / 2) / (viewportH / 2)
      const progress = clamp(normalized, -1, 1)

      // Translate opposite to scroll direction for depth
      const translateY = clamp(-progress * (localMax * localIntensity), -localMax, localMax)

      bg.style.willChange = 'transform'
      bg.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`
    })
  }

  const requestTick = () => {
    if (ticking) return
    ticking = true
    rafId = window.requestAnimationFrame(update)
  }

  // Initial paint + keep in sync with scroll-snap jumps
  rafId = window.requestAnimationFrame(update)

  scrollEl.addEventListener('scroll', requestTick, { passive: true })
  window.addEventListener('resize', requestTick, { passive: true })
  window.addEventListener('orientationchange', requestTick, { passive: true })

  const stop = () => {
    scrollEl.removeEventListener('scroll', requestTick)
    window.removeEventListener('resize', requestTick)
    window.removeEventListener('orientationchange', requestTick)
    if (rafId) window.cancelAnimationFrame(rafId)
  }

  onUnmounted(stop)
  return stop
}
