import { useUserStore } from '@/stores/useUserStore'
import { useHydrationStore } from '@/stores/useHydrationStore'

/**
 * Global navigation guard (vue-router 4.1+/5 style: return instead of next()).
 * Returning nothing lets the navigation continue; returning a location redirects.
 */
export async function authGuard(to) {
  const userStore = useUserStore()
  const hydrationStore = useHydrationStore()

  // 1. Set document title
  document.title = to.meta?.title ? `Celebrate it with me - ${to.meta.title}` : 'CWM'

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
