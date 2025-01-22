import DashboardView from '../views/DashboardView.vue'
import EventsView from '../views/EventsView.vue'

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
  }
]


export { authRoutes }
