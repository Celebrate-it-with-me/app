export default [
  {
    path: '/dashboard/events/:id/unlock',
    name: 'unlock-return',
    component: () => import('@/modules/payments/views/UnlockReturnView.vue'),
    meta: { titleKey: 'titles.unlock', requiresAuth: true }
  }
]
