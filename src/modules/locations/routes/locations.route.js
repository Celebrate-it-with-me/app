export default [
  {
    path: '/dashboard/locations',
    name: 'locations',
    component: () => import('@/modules/locations/views/LocationsView.vue'),
    meta: {
      moduleKey: 'locations',
      titleKey: 'titles.locations',
      requiresAuth: true,
      requiredPermission: [],
      module: 'location'
    }
  }
]
