export default [
  {
    path: '/dashboard/save-the-date',
    name: 'save-the-date',
    component: () => import('@/modules/save-the-date/views/SaveTheDateView.vue'),
    meta: {
      moduleKey: 'save_the_date',
      titleKey: 'titles.saveTheDate',
      requiresAuth: true,
      requiredPermission: [],
      module: 'save-the-date'
    }
  }
]
