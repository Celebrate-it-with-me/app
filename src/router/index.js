import { createRouter, createWebHistory } from 'vue-router'
import { nonAuthRoutes }  from "@/router/nonAuthRoutes"
import { authRoutes } from "@/router/authRoutes"
import { eventsRoutes } from "@/router/eventsRoutes"
import NonAuthenticatedLayout from '@/views/layouts/NonAuthenticatedLayout.vue'
import AuthenticatedLayout from '@/views/layouts/AuthenticatedLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'Non Authenticated',
      component: NonAuthenticatedLayout,
      children: [
        ...nonAuthRoutes
      ]
    },
    {
      path: '',
      name: 'Authenticated Layout',
      component: AuthenticatedLayout,
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
    }
  ],
})

router.beforeEach((to, from, next) => {
  document.title = `Celebrate it with me - ${to.meta?.title}` || 'CWM'
  next();
});

export default router
