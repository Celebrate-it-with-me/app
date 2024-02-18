import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RSVP from "@/views/RSVP.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Celebrate it with me'
      }
    },
    {
      path: '/rsvp/vanessar',
      name: 'rsvp',
      component: RSVP,
      meta: {
        title: 'Celebrate it with me | RSVP'
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.tite = to.meta.title
  next()
})

export default router
