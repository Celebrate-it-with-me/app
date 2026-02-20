import { createRouter, createWebHistory } from 'vue-router'
import { nonAuthRoutes } from '@/router/nonAuthRoutes'
import { authRoutes } from '@/router/authRoutes'
import { eventsRoutes } from '@/router/eventsRoutes'
import ExternalLayout from '@/components/external/layout/ExternalLayout.vue'
import ExternalCleanLayout from '@/components/external/layout/ExternalCleanLayout.vue'
import { externalCleanRoutes } from '@/router/externalCleanRoutes'
import InternalLayout from '@/components/internal/layout/InternalLayout.vue'
import { useUserStore } from '@/stores/useUserStore'
import { useHydrationStore } from '@/stores/useHydrationStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/password',
      name: 'External Clean',
      component: ExternalCleanLayout,
      children: [...externalCleanRoutes]
    },
    {
      path: '',
      name: 'Non Authenticated',
      component: ExternalLayout,
      children: [...nonAuthRoutes]
    },
    {
      path: '',
      name: 'Authenticated',
      component: InternalLayout,
      children: [...authRoutes]
    },
    {
      path: '',
      name: 'Event Pages Routes',
      children: [...eventsRoutes]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const hydrationStore = useHydrationStore()

  // 1. Set document title
  document.title = to.meta?.title ? `Celebrate it with me - ${to.meta.title}` : 'CWM'

  const requiresAuth = to.meta?.requiresAuth ?? false

  // 2. Public route handling
  if (!requiresAuth) {
    return next()
  }

  // 3. Authentication check
  if (!userStore.isAuthenticated) {
    console.log('redirecting en not Autenticated')
    hydrationStore.reset()
    return next({ name: 'sign-in', query: { redirect: to.fullPath } })
  }

  // 4. Data hydration if authenticated
  if (!hydrationStore.isHydrated) {
    try {
      await hydrationStore.hydrateAll()
    } catch (error) {
      console.log('redirecting en isHydrated')
      console.error('Hydration failed during navigation:', error)
      await userStore.logOut()
      return next({ name: 'sign-in', query: { redirect: to.fullPath } })
    }
  }

  return next()
})

export default router
