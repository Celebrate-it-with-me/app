/**
 * Behaviour catalogue run by the engine on declarative attributes (the package ships no script):
 *  - data-reveal="fade|rise|zoom|slide-left|slide-right"  appear once when scrolled into view (data-reveal-delay in ms)
 *  - data-parallax="subtle|soft|medium"                   gentle vertical drift while scrolling
 *  - data-carousel="snap"                                 handled in the renderer (PackageCarousel)
 * All of it is off under prefers-reduced-motion: nodes are never armed, so they simply show.
 */
import { PARALLAX } from './policy'

export function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function startBehaviors(root) {
  if (!root || prefersReducedMotion()) return () => {}
  const cleanups = []

  const reveals = [...root.querySelectorAll('[data-reveal]')]
  if (reveals.length && 'IntersectionObserver' in window) {
    reveals.forEach(el => el.classList.add('pk-armed'))
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('pk-in')
          io.unobserve(e.target)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    )
    reveals.forEach(el => io.observe(el))
    // Safety net: never leave content hidden if the observer does not fire.
    const t = setTimeout(() => reveals.forEach(el => el.classList.add('pk-in')), 4000)
    cleanups.push(() => {
      io.disconnect()
      clearTimeout(t)
    })
  }

  const drifters = [...root.querySelectorAll('[data-parallax]')]
  if (drifters.length) {
    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      for (const el of drifters) {
        const box = (el.parentElement ?? el).getBoundingClientRect()
        if (box.bottom < -100 || box.top > vh + 100) continue
        const k = PARALLAX[el.dataset.parallax] ?? 0
        el.style.setProperty('--pk-py', `${((box.top + box.height / 2 - vh / 2) * -k).toFixed(1)}px`)
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
    cleanups.push(() => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    })
  }
  return () => cleanups.forEach(fn => fn())
}
