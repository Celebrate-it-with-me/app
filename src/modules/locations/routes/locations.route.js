export default [
  {
    path: '/dashboard/locations',
    name: 'locations',
    component: () => import('@/modules/locations/views/CEventLocationsView.vue'),
    meta: {
      title: 'Event Locations',
      requiresAuth: true,
      requiredPermission: ['view_event_locations'],
      requiresFeature: 'location',
      module: 'location'
    }
  },
  {
    path: '/dashboard/locations/create',
    name: 'create-location',
    component: () => import('@/modules/locations/views/CEventLocationsCreateView.vue'),
    meta: {
      title: 'Create Location',
      requiresAuth: true,
      requiredPermission: ['create_event_locations'],
      requiresFeature: 'location',
      module: 'location'
    }
  },
  {
    path: '/dashboard/locations/edit/:id',
    name: 'edit-location',
    component: () => import('@/modules/locations/views/CEventLocationsCreateView.vue'),
    meta: {
      title: 'Edit Location',
      requiresAuth: true,
      requiredPermission: ['edit_event_locations'],
      requiresFeature: 'location',
      module: 'location'
    }
  }
]
