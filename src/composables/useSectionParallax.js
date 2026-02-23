import { onMounted, onUnmounted } from 'vue'

/**
 * Section-based parallax composable for Havana Nights template.
 * Applies independent parallax effect to each section's background.
 *
 * @param {Object} options - Configuration options
 * @param {number} options.speedDesktop - Parallax speed on desktop (default: 0.25)
 * @param {number} options.speedMobile - Parallax speed on mobile (default: 0.15)
 * @param {number} options.maxTranslateDesktop - Max translation in px on desktop (default: 45)
 * @param {number} options.maxTranslateMobile - Max translation in px on mobile (default: 22)
 * @param {string} options.scrollContainer - Selector for scroll container (default: 'main')
 */
export function useSectionParallax(options = {}) {
  const {
    speedDesktop = 0.25,
    speedMobile = 0.15,
    maxTranslateDesktop = 45,
    maxTranslateMobile = 22,
    scrollContainer = 'main'
  } = options

  let sections = []
  let visibleSections = new Set()
  let observer = null
  let rafId = null
  let scrollEl = null
  let prefersReducedMotion = false
  let mutationObserver = null
  let initialized = false

  const isMobile = () => window.innerWidth < 768

  const getSpeed = () => (isMobile() ? speedMobile : speedDesktop)
  const getMaxTranslate = () => (isMobile() ? maxTranslateMobile : maxTranslateDesktop)

  /**
   * Calculate section progress based on its position relative to scroll container.
   * Returns 0 when section top enters viewport, 0.5 when centered, 1 when exiting.
   */
  const calculateProgress = section => {
    const sectionRect = section.getBoundingClientRect()

    // Get container bounds (for scrollEl that's not window)
    let containerTop = 0
    let containerHeight = window.innerHeight

    if (scrollEl && scrollEl !== window) {
      const containerRect = scrollEl.getBoundingClientRect()
      containerTop = containerRect.top
      containerHeight = containerRect.height
    }

    // Section position relative to scroll container
    const sectionTop = sectionRect.top - containerTop
    const sectionHeight = sectionRect.height

    // Progress: 0 = section top at container bottom, 1 = section bottom at container top
    const totalTravel = containerHeight + sectionHeight
    const traveled = containerHeight - sectionTop

    return Math.max(0, Math.min(1, traveled / totalTravel))
  }

  /**
   * Apply parallax transform to a section's background element.
   */
  const applyParallax = section => {
    const bg = section.querySelector('.hn-parallax-bg')
    if (!bg) return

    const progress = calculateProgress(section)
    const maxT = getMaxTranslate()
    const speed = getSpeed()

    // Translate based on progress: centered at progress 0.5
    const offset = (progress - 0.5) * 2 * maxT * speed
    const clampedOffset = Math.max(-maxT, Math.min(maxT, offset))

    bg.style.transform = `translate3d(0, ${clampedOffset}px, 0)`
  }

  /**
   * Animation frame handler - only updates visible sections.
   */
  const onScroll = () => {
    if (prefersReducedMotion) return

    rafId = requestAnimationFrame(() => {
      visibleSections.forEach(section => {
        applyParallax(section)
      })
    })
  }

  /**
   * Initialize IntersectionObserver to track visible sections.
   */
  const initObserver = () => {
    observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target)
          } else {
            visibleSections.delete(entry.target)
          }
        })
      },
      {
        // Use scroll container as root if it's not window
        root: scrollEl !== window ? scrollEl : null,
        rootMargin: '50px',
        threshold: 0
      }
    )

    sections.forEach(section => {
      observer.observe(section)
    })
  }

  /**
   * Initialize the parallax system.
   */
  const init = () => {
    if (initialized) return

    // Check for reduced motion preference
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Find scroll container first (needed for IntersectionObserver root)
    scrollEl = document.querySelector(scrollContainer)
    if (!scrollEl) {
      scrollEl = window
    }

    // Find all parallax sections
    sections = Array.from(document.querySelectorAll('.hn-parallax-section'))
    if (sections.length === 0) {
      // Sections not yet in DOM, set up MutationObserver to retry
      setupMutationObserver()
      return
    }

    // Initialize observer (uses scrollEl as root)
    initObserver()

    // Attach scroll listener
    scrollEl.addEventListener('scroll', onScroll, { passive: true })

    // Initial calculation
    onScroll()

    initialized = true

    // Clean up mutation observer if it was used
    if (mutationObserver) {
      mutationObserver.disconnect()
      mutationObserver = null
    }
  }

  /**
   * Set up MutationObserver to detect when sections are added to DOM.
   */
  const setupMutationObserver = () => {
    if (mutationObserver) return

    mutationObserver = new MutationObserver(() => {
      const found = document.querySelectorAll('.hn-parallax-section')
      if (found.length > 0) {
        init()
      }
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  /**
   * Cleanup resources.
   */
  const destroy = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }

    if (observer) {
      observer.disconnect()
    }

    if (mutationObserver) {
      mutationObserver.disconnect()
      mutationObserver = null
    }

    if (scrollEl) {
      scrollEl.removeEventListener('scroll', onScroll)
    }

    // Reset transforms
    sections.forEach(section => {
      const bg = section.querySelector('.hn-parallax-bg')
      if (bg) {
        bg.style.transform = ''
      }
    })

    sections = []
    visibleSections.clear()
    initialized = false
  }

  onMounted(() => {
    // Delay init to ensure DOM is fully rendered (especially after transitions)
    setTimeout(() => {
      requestAnimationFrame(() => {
        init()
      })
    }, 100)
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    init,
    destroy
  }
}
