export default [
  {
    path: '/dashboard/plan',
    name: 'plan',
    component: () => import('@/modules/assistant/views/PlanView.vue'),
    // Free for every plan and not a catalog module: no `moduleKey`. Reading needs `view_event`, which every role of the event has.
    meta: { titleKey: 'titles.plan', requiresAuth: true, requiredPermission: [] }
  }
]
