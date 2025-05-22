import { createRouter, createWebHistory } from 'vue-router'
import { nonAuthRoutes }  from "@/router/nonAuthRoutes"
import { authRoutes } from "@/router/authRoutes"
import { eventsRoutes } from "@/router/eventsRoutes"
import ExternalLayout from '@/components/external/layout/ExternalLayout.vue'
import ExternalCleanLayout from '@/components/external/layout/ExternalCleanLayout.vue'
import { externalCleanRoutes } from "@/router/externalCleanRoutes"
import InternalLayout from '@/components/internal/layout/InternalLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/password',
      name: 'External Clean',
      component: ExternalCleanLayout,
      children: [
        ...externalCleanRoutes
      ]
    },
    {
      path: '',
      name: 'Non Authenticated',
      component: ExternalLayout,
      children: [
        ...nonAuthRoutes
      ]
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
      children: [
        ...authRoutes
      ]
    },
    {
      path: '',
      name: 'Event Pages Routes',
      children: [
        ...eventsRoutes
      ]
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = `Celebrate it with me - ${to.meta?.title}` || 'CWM'
  next();
});

export default router
