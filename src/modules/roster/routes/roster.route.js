export default [
  {
    path: '/dashboard/guests',
    name: 'guests',
    component: () => import('@/modules/roster/views/RosterView.vue'),
    meta: {
      moduleKey: 'guests',
      titleKey: 'titles.guests',
      requiresAuth: true,
      requiredPermission: ['view_guests'],
      module: 'guests'
    }
  },
  // Confirmations are a tab of the guest list now; old links keep working.
  { path: '/dashboard/rsvp', name: 'rsvp', redirect: { name: 'guests', query: { status: 'pending' } } }
]
