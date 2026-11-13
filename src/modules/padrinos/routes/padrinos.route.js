export default [
  {
    path: '/dashboard/padrinos',
    name: 'padrinos',
    component: () => import('@/modules/padrinos/views/PadrinosView.vue'),
    meta: {
      moduleKey: 'padrinos',
      titleKey: 'titles.padrinos',
      requiresAuth: true,
      requiredPermission: [],
      module: 'padrinos'
    }
  }
]
