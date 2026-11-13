export default [
  {
    path: '/dashboard/menus',
    name: 'menus',
    component: () => import('@/modules/menus/views/MenusView.vue'),
    meta: {
      moduleKey: 'menus',
      titleKey: 'titles.menus',
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
      moduleKey: 'menus',
      titleKey: 'titles.menusCreate',
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
      moduleKey: 'menus',
      titleKey: 'titles.menusShow',
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
      moduleKey: 'menus',
      titleKey: 'titles.menusEdit',
      requiresAuth: true,
      requiredPermission: ['edit_menu'],
      requiresFeature: 'menus',
      module: 'menus'
    }
  }
]
