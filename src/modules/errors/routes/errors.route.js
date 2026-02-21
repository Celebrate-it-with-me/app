export default [
  {
    path: '/401',
    name: 'unauthorized',
    component: () => import('@/modules/errors/views/C401.vue'),
    meta: {
      title: 'Unauthorized',
      requiresAuth: false,
      requiredPermission: [],
      requiresFeature: 'errors',
      module: 'errors'
    }
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/modules/errors/views/C403.vue'),
    meta: {
      title: 'Access Denied',
      requiresAuth: false,
      requiredPermission: [],
      requiresFeature: 'errors',
      module: 'errors'
    }
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/modules/errors/views/C404.vue'),
    meta: {
      title: 'Not Found',
      requiresAuth: false,
      requiredPermission: [],
      requiresFeature: 'errors',
      module: 'errors'
    }
  },
  {
    path: '/409',
    name: 'conflict',
    component: () => import('@/modules/errors/views/C409.vue'),
    meta: {
      title: 'Conflict',
      requiresAuth: false,
      requiredPermission: [],
      requiresFeature: 'errors',
      module: 'errors'
    }
  },
  {
    path: '/500',
    name: 'server-error',
    component: () => import('@/modules/errors/views/C500.vue'),
    meta: {
      title: 'Server Error',
      requiresAuth: false,
      requiredPermission: [],
      requiresFeature: 'errors',
      module: 'errors'
    }
  },

  // Catch-all -> 404
  {
    path: '/:pathMatch(.*)*',
    name: 'catch-all',
    redirect: { name: 'not-found' },
    meta: {
      title: 'Not Found',
      requiresAuth: false,
      requiredPermission: [],
      requiresFeature: 'errors',
      module: 'errors'
    }
  }
]
