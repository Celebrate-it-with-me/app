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
      path: '/403',
      name: 'not-authorized',
      component: () => import('@/views/internal/errors/C403.vue'),
      meta: {
        title: 'Not Authorized'
      }
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
  document.title = `Celebrate it with me - ${to.meta?.title}` || 'CWM'

  const userStore = useUserStore()
  const hydrationStore = useHydrationStore()

  if (!to.meta?.requiresAuth) return next()

  if (!userStore.isAuthenticated) {
    return next({ name: 'sign-in' })
  }

  if (!hydrationStore.isHydrated) {
    try {
      await hydrationStore.hydrateAll()
    } catch (e) {
      console.error('Hydration failed:', e)
      return next({ name: 'sign-in' })
    }
  }

  return next()
})

export default router
