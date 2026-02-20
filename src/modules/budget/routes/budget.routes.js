export default [
  {
    path: '/dashboard/budget',
    name: 'budget',
    component: () => import('@/modules/budget/views/BudgetView.vue'),
    meta: {
      title: 'Budget',
      requiresAuth: true,
      requiredPermission: [],
      requiresFeature: 'budget',
      module: 'budget'
    }
  }
]
