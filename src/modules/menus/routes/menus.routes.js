export default [
  {
    path: '/dashboard/menus',
    name: 'menus',
    component: () => import('@/modules/menus/views/MenusView.vue'),
    meta: {
      title: 'Menus',
      requiresAuth: true,
      requiredPermission: ['view_menus'],
      requiresFeature: 'menus',
      module: 'menus'
    }
  },
  {
    path: '/dashboard/menus/create',
    name: 'create-menus',
    component: () => import('@/modules/menus/views/CreateMenusView.vue'),
    meta: {
      title: 'Menus',
      requiresAuth: true,
      requiredPermission: ['create_menu'],
      requiresFeature: 'menus',
      module: 'menus'
    }
  },
  {
    path: '/dashboard/menus/show/:id',
    name: 'show-menu',
    component: () => import('@/modules/menus/views/ShowMenuView.vue'),
    meta: {
      title: 'Show Menus',
      requiresAuth: true,
      requiredPermission: ['view_menu'],
      requiresFeature: 'menus',
      module: 'menus'
    }
  },
  {
    path: '/dashboard/menus/edit/:id',
    name: 'edit-menus',
    component: () => import('@/modules/menus/views/CreateMenusView.vue'),
    meta: {
      title: 'Edit Menus',
      requiresAuth: true,
      requiredPermission: ['edit_menu'],
      requiresFeature: 'menus',
      module: 'menus'
    }
  }
]
