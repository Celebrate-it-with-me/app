import { useUserStore } from '@/stores/useUserStore'
import i18n, { LOCALES } from '@/locales/i18n'
import { useHydrationStore } from '@/stores/useHydrationStore'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { moduleRedirect } from './moduleGuard'
import { safeRedirect } from '@/utils/safeRedirect'
import InvitationService from '@/services/PublicEvents/InvitationService'

/**
 * Global navigation guard (vue-router 4.1+/5 style: return instead of next()).
 * Returning nothing lets the navigation continue; returning a location redirects.
 */
/** Document title for a route, in the current locale. */
export function routeTitle(route) {
  const pageTitle = route.meta?.titleKey ? i18n.global.t(route.meta.titleKey) : route.meta?.title
  return pageTitle ? `${pageTitle} · Quinvite` : 'Quinvite'
}

/**
 * Starts downloading the lazy views of the target route. vue-router only loads them after the guards finish, so on
 * a private page the chunks would queue behind the hydration; asking for them now makes both download at once.
 * (A dynamic import is cached: the router's own call afterwards returns the same promise.)
 */
function prefetchRouteChunks(route) {
  for (const record of route.matched ?? []) {
    for (const component of Object.values(record.components ?? {})) {
      const lazy = typeof component === 'function' && !('displayName' in component || 'props' in component || '__vccOpts' in component)
      if (lazy) Promise.resolve(component()).catch(() => {})
    }
  }
}

const safeQuery = path => {
  const redirect = safeRedirect(path)
  return redirect ? { redirect } : {}
}

export async function authGuard(to) {
  const userStore = useUserStore()
  const hydrationStore = useHydrationStore()

  // 1. Set document title
  document.title = routeTitle(to)

  // The public invitation asks for its data right away: the request goes out while the view's chunk downloads.
  if (to.name === 'invitation' && to.params?.slug && to.params?.code) {
    const lang = LOCALES.includes(to.query?.lang) ? to.query.lang : undefined
    InvitationService.prefetch({ slug: to.params.slug, code: to.params.code, lang })
  }

  const requiresAuth = to.meta?.requiresAuth ?? false

  // 2. Public route handling
  if (!requiresAuth) return

  // 3. Authentication check
  if (!userStore.isAuthenticated) {
    hydrationStore.reset()
    return { name: 'sign-in', query: safeQuery(to.fullPath) }
  }

  // 4. Data hydration if authenticated
  if (!hydrationStore.isHydrated) {
    prefetchRouteChunks(to)
    try {
      await hydrationStore.hydrateAll()
    } catch (error) {
      console.error('Hydration failed during navigation:', error)
      await userStore.logOut()
      return { name: 'sign-in', query: safeQuery(to.fullPath) }
    }
  }

  // 5. A module the event's plan does not include, or the admin switched off, does not open
  const moduleKey = to.meta?.moduleKey
  if (moduleKey) {
    const redirect = moduleRedirect(useEventsStore().activeEvent, moduleKey)
    if (redirect) return redirect
  }
}
