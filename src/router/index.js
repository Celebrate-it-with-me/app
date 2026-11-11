import { createRouter, createWebHistory } from 'vue-router'
import { nonAuthRoutes } from '@/router/nonAuthRoutes'
import { authRoutes } from '@/router/authRoutes'
import { eventsRoutes } from '@/router/eventsRoutes'
import ExternalLayout from '@/components/external/layout/ExternalLayout.vue'
import ExternalCleanLayout from '@/components/external/layout/ExternalCleanLayout.vue'
import { externalCleanRoutes } from '@/router/externalCleanRoutes'
import InternalLayout from '@/components/internal/layout/InternalLayout.vue'
import { authGuard } from '@/router/authGuard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  /**
   * Hash links (#como-funciona, #precios…) scroll to their section, also when coming from
   * another page: the target may not exist until the view renders, so we retry briefly.
   * Back/forward restores the saved position; other navigations start at the top.
   */
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      const target = { el: to.hash, top: 80, behavior: 'smooth' }
      if (document.querySelector(to.hash)) return target
      return new Promise(resolve => {
        let tries = 0
        const tick = () => {
          if (document.querySelector(to.hash) || tries++ > 20) resolve(target)
          else setTimeout(tick, 50)
        }
        tick()
      })
    }
    return to.path === from.path ? false : { top: 0 }
  },
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
    },
    // Live showcase of the UI kit (src/ui). Development only.
    ...(import.meta.env.DEV
      ? [
          {
            path: '/dev/ui',
            name: 'dev-ui-kit',
            component: () => import('@/views/dev/UiKitView.vue'),
            meta: { title: 'UI kit', requiresAuth: false }
          }
        ]
      : [])
  ]
})

router.beforeEach(authGuard)

export default router
