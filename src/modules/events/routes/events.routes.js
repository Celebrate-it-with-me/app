export default [
  {
    path: '/dashboard/events',
    name: 'events',
    component: () => import('@/modules/events/views/EventsView.vue'),
    meta: {
      title: 'My CwmEvents',
      requiresAuth: true,
      requiredPermission: ['view_events'],
      module: 'events'
    }
  },
  {
    path: '/dashboard/events/create',
    name: 'create-events',
    component: () => import('@/modules/events/views/CreateEventsView.vue'),
    meta: {
      title: 'Create Event',
      requiresAuth: true,
      requiredPermission: ['create_event'],
      module: 'events'
    }
  },
  {
    path: '/dashboard/events/:id/details',
    name: 'event-details',
    component: () => import('@/modules/events/views/EventDetailsView.vue'),
    meta: {
      title: 'Event Details',
      requiresAuth: true,
      requiredPermission: ['view_event'],
      module: 'events'
    }
  },
  {
    path: '/dashboard/events/:id/edit',
    name: 'edit-event',
    component: () => import('@/modules/events/views/CreateEventsView.vue'),
    meta: {
      title: 'Edit Event',
      requiresAuth: true,
      requiredPermission: ['edit_event'],
      module: 'events'
    }
  }
]
