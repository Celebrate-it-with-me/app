import { onMounted, onUnmounted } from 'vue'

export function useParallaxBackground(
  bgSelector = '.parallax-bg',
  speed = 0.25,
  containerSelector = null
) {
  let bgEl = null
  let containerEl = null

  let ticking = false
  let rafId = null

  let targetY = 0
  let currentY = 0

  const smoothing = 0.12

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

  const getRelativeScroll = () => {
    if (!containerEl) return window.scrollY

    const rect = containerEl.getBoundingClientRect()
    const viewportH = window.innerHeight || document.documentElement.clientHeight

    // scroll position relative to the section:
    // 0 when section top hits viewport top, increases as we scroll through section
    const raw = -rect.top

    // Clamp so it doesn't keep growing once we pass the section
    const maxScroll = rect.height - viewportH
    return clamp(raw, 0, Math.max(0, maxScroll))
  }

  const applyTransform = () => {
    currentY += (targetY - currentY) * smoothing

    if (bgEl) {
      bgEl.style.transform = `translate3d(0, ${currentY}px, 0)`
    }

    if (Math.abs(targetY - currentY) > 0.1) {
      rafId = window.requestAnimationFrame(applyTransform)
    } else {
      rafId = null
      ticking = false
    }
  }

  const onScroll = () => {
    if (!bgEl) return
    const relScroll = getRelativeScroll()
    targetY = relScroll * speed

    if (!ticking) {
      ticking = true
      rafId = window.requestAnimationFrame(applyTransform)
    }
  }

  const onResize = () => {
    onScroll()
  }

  onMounted(() => {
    bgEl = document.querySelector(bgSelector)
    containerEl = containerSelector ? document.querySelector(containerSelector) : null
    if (!bgEl) return

    bgEl.style.willChange = 'transform'

    // Initialize
    const relScroll = getRelativeScroll()
    targetY = relScroll * speed
    currentY = targetY
    bgEl.style.transform = `translate3d(0, ${currentY}px, 0)`

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    if (rafId) window.cancelAnimationFrame(rafId)
  })
}
