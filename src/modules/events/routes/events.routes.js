export default [
  {
    path: '/dashboard/events',
    name: 'events',
    component: () => import('@/modules/events/views/EventsView.vue'),
    meta: {
      titleKey: 'titles.events',
      requiresAuth: true,
      requiredPermission: ['view_events'],
      module: 'events'
    }
  },
  {
    path: '/dashboard/events/create',
    name: 'create-events',
    component: () => import('@/modules/events/views/CreateEventView.vue'),
    meta: {
      titleKey: 'titles.eventCreate',
      requiresAuth: true,
      requiredPermission: ['create_event'],
      module: 'events'
    }
  },
  {
    path: '/dashboard/events/:id/edit',
    name: 'edit-event',
    component: () => import('@/modules/events/views/EditEventView.vue'),
    meta: {
      titleKey: 'titles.eventEdit',
      requiresAuth: true,
      requiredPermission: ['edit_event'],
      module: 'events'
    }
  }
]
