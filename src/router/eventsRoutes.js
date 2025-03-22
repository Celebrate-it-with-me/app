import EventPublicView from '../views/non-authenticated/EventPublicView.vue'

const eventsRoutes = [
  {
    path: '/event/:eventId/guest/:guestCode',
    name: 'Event Public Page',
    component: EventPublicView,
    meta: {
      title: 'My Event Page'
    }
  }
]

export { eventsRoutes }
