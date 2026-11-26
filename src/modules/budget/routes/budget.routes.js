export default [
  {
    path: '/dashboard/budget',
    name: 'budget',
    component: () => import('@/modules/budget/views/BudgetView.vue'),
    meta: {
      moduleKey: 'budget',
      titleKey: 'titles.budget',
      requiresAuth: true,
      requiredPermission: ['view_budget'],
      module: 'budget'
    }
  }
]
