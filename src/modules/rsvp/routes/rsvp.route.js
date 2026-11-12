import RsvpView from '@/modules/rsvp/views/RsvpView.vue'

export default [
  {
    path: '/dashboard/rsvp',
    name: 'rsvp',
    component: RsvpView,
    meta: {
      moduleKey: 'rsvp',
      title: 'RSVP',
      requiresAuth: true,
      requiredPermission: ['view_rsvp'],
      requiresFeature: 'rsvp',
      module: 'rsvp'
    }
  }
]
