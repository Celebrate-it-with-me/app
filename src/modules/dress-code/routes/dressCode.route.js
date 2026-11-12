export default [
  {
    path: '/dashboard/dress-code',
    name: 'dress-code',
    component: () => import('@/modules/dress-code/views/DressCodeView.vue'),
    meta: {
      moduleKey: 'dress_code',
      title: 'Dress Code',
      requiresAuth: true,
      requiredPermission: []
    }
  }
]
