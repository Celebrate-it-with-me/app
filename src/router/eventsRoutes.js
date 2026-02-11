import FirstEventPublicView from '@/views/non-authenticated/FirstEventPublicView.vue'
import SecondEventPublicView from '@/views/non-authenticated/SecondEventPublicView.vue'

const eventsRoutes = [
  {
    path: '/event/6/guest/:guestCode',
    name: 'Event Public Page',
    component: FirstEventPublicView,
    meta: {
      title: 'Isabella Canedo Quinceanera',
      requiresAuth: false
    }
  },
  {
    path: '/event/5/guest/:guestCode',
    name: 'Event Page',
    component: SecondEventPublicView,
    meta: {
      title: 'Isabella Quinceanera',
      requiresAuth: false
    }
  }
]

export { eventsRoutes }
