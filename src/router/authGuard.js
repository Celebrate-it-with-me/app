import { useUserStore } from '@/stores/useUserStore'
import i18n from '@/locales/i18n'
import { useHydrationStore } from '@/stores/useHydrationStore'

/**
 * Global navigation guard (vue-router 4.1+/5 style: return instead of next()).
 * Returning nothing lets the navigation continue; returning a location redirects.
 */
/** Document title for a route, in the current locale. */
export function routeTitle(route) {
  const pageTitle = route.meta?.titleKey ? i18n.global.t(route.meta.titleKey) : route.meta?.title
  return pageTitle ? `${pageTitle} · Quinvite` : 'Quinvite'
}

export async function authGuard(to) {
  const userStore = useUserStore()
  const hydrationStore = useHydrationStore()

  // 1. Set document title
  document.title = routeTitle(to)

  const requiresAuth = to.meta?.requiresAuth ?? false

  // 2. Public route handling
  if (!requiresAuth) return

  // 3. Authentication check
  if (!userStore.isAuthenticated) {
    hydrationStore.reset()
    return { name: 'sign-in', query: { redirect: to.fullPath } }
  }

  // 4. Data hydration if authenticated
  if (!hydrationStore.isHydrated) {
    try {
      await hydrationStore.hydrateAll()
    } catch (error) {
      console.error('Hydration failed during navigation:', error)
      await userStore.logOut()
      return { name: 'sign-in', query: { redirect: to.fullPath } }
    }
  }
}
