import DashboardView from '../views/DashboardView.vue'

export const authRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Events Dashboard'
    }
  }
]
