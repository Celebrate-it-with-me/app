export default [
  {
    path: '/dashboard/seating',
    name: 'seating',
    component: () => import('@/modules/seating/views/SeatingView.vue'),
    meta: {
      moduleKey: 'seating',
      titleKey: 'titles.seating',
      requiresAuth: true,
      requiredPermission: [],
      requiresFeature: 'seating',
      module: 'seating'
    }
  }
]
