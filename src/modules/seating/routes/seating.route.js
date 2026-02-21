export default [
  {
    path: '/dashboard/seating',
    name: 'seating',
    component: () => import('@/modules/seating/views/SeatingView.vue'),
    meta: {
      title: 'Seat Accommodation',
      requiresAuth: true,
      requiredPermission: [],
      requiresFeature: 'seating',
      module: 'seating'
    }
  }
]
