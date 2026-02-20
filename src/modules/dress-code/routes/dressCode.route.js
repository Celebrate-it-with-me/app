export default [
  {
    path: '/dashboard/dress-code',
    name: 'dress-code',
    component: () => import('@/modules/dress-code/views/DressCodeView.vue'),
    meta: {
      title: 'Dress Code',
      requiresAuth: true,
      requiredPermission: []
    }
  }
]
