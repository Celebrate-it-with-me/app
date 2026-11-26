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
      // Creating an event is an account action, not a role on the active event: a viewer of someone else's event can
      // still create their own. (`create_event` is an event permission viewers lack, so it must not be required here.)
      requiredPermission: [],
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
      // The event comes from the address: only the active event's permissions are known here (see permissionGuard).
      eventParam: 'id',
      module: 'events'
    }
  }
]
