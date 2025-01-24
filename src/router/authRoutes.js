import DashboardView from '../views/DashboardView.vue'
import EventsView from '../views/EventsView.vue'
import { useUserStore } from '../stores/useUserStore'

const authRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Events Dashboard'
    }
  },
  {
    path: '/dashboard/events',
    name: 'events',
    component: EventsView,
    meta: {
      title: 'My Events'
    }
  },
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: async (to, from, next) => {
      const user = useUserStore()
      await user.logOut()
      await next({ name: 'sign-in' })
    }
  }
]


export { authRoutes }
