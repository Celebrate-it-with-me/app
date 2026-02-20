export default [
  {
    path: '/dashboard/guests',
    name: 'guests',
    component: () => import('@/modules/guests/views/GuestsView.vue'),
    meta: {
      title: 'Events Guests',
      requiresAuth: true,
      requiredPermission: ['view_guests'],
      module: 'guests'
    }
  },
  {
    path: '/dashboard/guests/create',
    name: 'create-guest',
    component: () => import('@/modules/guests/views/CreateGuestView.vue'),
    meta: {
      title: 'Create Guest',
      requiresAuth: true,
      requiredPermission: ['create_guest'],
      module: 'guests'
    }
  }
]
