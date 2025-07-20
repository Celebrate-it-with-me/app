import { onMounted, onUnmounted } from 'vue'

export function useParallaxBackground(selector = '.parallax-bg', speed = 0.4) {
  let ticking = false
  let parallaxEl = null

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY
        if (parallaxEl) {
          const offset = scrollY * speed
          parallaxEl.style.transform = `translate3d(0, ${offset}px, 0)`
        }
        ticking = false
      })
      ticking = true
    }
  }

  onMounted(() => {
    parallaxEl = document.querySelector(selector)
    if (parallaxEl) {
      window.addEventListener('scroll', onScroll)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })
}
