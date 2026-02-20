export default [
  {
    path: '/dashboard/save-the-date',
    name: 'save-the-date',
    component: () => import('@/modules/save-the-date/views/CSaveTheDateView.vue'),
    meta: {
      title: 'Save The Date',
      requiresAuth: true,
      requiredPermission: ['view_save_the_date'],
      requiresFeature: 'save_the_date',
      module: 'save-the-date'
    }
  }
]
