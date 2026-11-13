export default [
  {
    path: '/dashboard/start',
    name: 'start',
    component: () => import('@/modules/onboarding/views/StartView.vue'),
    meta: {
      titleKey: 'titles.start',
      requiresAuth: true
    }
  }
]
