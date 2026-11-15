import { computed, onBeforeUnmount, ref, watch } from 'vue'

/** Version of the package engine this app implements. A package with a higher `engineMin` is ignored. */
export const ENGINE = 1
/** Longest the page waits for the package CSS before showing the content anyway. */
export const CSS_WAIT_MS = 1500

const SLUG = /^[a-z][a-z0-9-]{1,31}$/

/** Absolute URL of a package file, only when it lives on the allowed assets origin (same origin in development). */
export function allowedAssetUrl(value, origin = import.meta.env?.VITE_TEMPLATE_ASSETS_ORIGIN || globalThis.location?.origin) {
  if (typeof value !== 'string' || !origin) return null
  try {
    const url = new URL(value, origin)
    if (url.origin !== new URL(origin).origin) return null
    if (url.protocol !== 'https:' && url.origin !== globalThis.location?.origin) return null
    if (url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

/** Checks the `theme.package` block of the payload; returns what the engine needs or null (→ plain Clásica). */
export function readPackage(pkg, origin) {
  if (!pkg || typeof pkg !== 'object') return null
  if (typeof pkg.slug !== 'string' || !SLUG.test(pkg.slug)) return null
  if (!Number.isInteger(pkg.engineMin ?? 1) || (pkg.engineMin ?? 1) > ENGINE) return null
  const cssUrl = allowedAssetUrl(pkg.cssUrl, origin)
  if (!cssUrl) return null
  const preload = (Array.isArray(pkg.preload) ? pkg.preload : [])
    .slice(0, 6)
    .map(item => ({ url: allowedAssetUrl(item?.url, origin), as: item?.as === 'font' ? 'font' : item?.as === 'image' ? 'image' : null, type: item?.type }))
    .filter(item => item.url && item.as)
  const templates = pkg.templates && typeof pkg.templates === 'object' ? pkg.templates : {}
  return { slug: pkg.slug, cssUrl, base: cssUrl.replace(/[^/]*$/, ''), preload, templates, strings: pkg.strings }
}

/**
 * Loads the package CSS (`<link>`), waits for it (bounded), and falls back to plain Clásica when it
 * cannot be loaded. `state`: none | loading | ready | failed.
 */
export function usePackageTheme(getPackage) {
  const state = ref('none')
  const current = ref(null)
  let nodes = []
  let timer

  function cleanup() {
    clearTimeout(timer)
    nodes.forEach(node => node.remove())
    nodes = []
  }

  watch(
    getPackage,
    raw => {
      cleanup()
      const pkg = readPackage(raw)
      current.value = pkg
      if (!pkg) {
        state.value = 'none'
        return
      }
      state.value = 'loading'
      performance.mark?.('inv-pkg-css-start')
      for (const item of pkg.preload) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = item.as
        link.href = item.url
        if (item.as === 'font') link.type = 'font/woff2'
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
        nodes.push(link)
      }
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.crossOrigin = 'anonymous'
      link.href = pkg.cssUrl
      link.onload = () => {
        performance.mark?.('inv-pkg-css-end')
        clearTimeout(timer)
        state.value = 'ready'
      }
      link.onerror = () => {
        clearTimeout(timer)
        link.remove()
        state.value = 'failed'
        if (import.meta.env?.DEV) console.warn('[invitation package] CSS failed to load: falling back to Clásica')
      }
      document.head.appendChild(link)
      nodes.push(link)
      timer = setTimeout(() => {
        if (state.value === 'loading') state.value = 'ready'
      }, CSS_WAIT_MS)
    },
    { immediate: true }
  )
  onBeforeUnmount(cleanup)

  return {
    state,
    /** Package sections may be drawn (CSS loading or ready). */
    usable: computed(() => state.value === 'loading' || state.value === 'ready'),
    slug: computed(() => (state.value === 'loading' || state.value === 'ready' ? current.value?.slug : undefined)),
    base: computed(() => current.value?.base ?? ''),
    templates: computed(() => current.value?.templates ?? {}),
    strings: computed(() => current.value?.strings)
  }
}
