
const externalCleanRoutes = [
  {
    path: '/account-suspended',
    name: 'account-suspended',
    component: () => import('@/views/external/AccountSuspendedView.vue'),
    meta: {
      titleKey: 'accountSuspended.title',
      requiresAuth: false
    }
  },
  {
    path: '/account-deleted',
    name: 'account-deleted',
    component: () => import('@/modules/account-deletion/views/AccountDeletedView.vue'),
    meta: {
      titleKey: 'accountDeleted.title',
      requiresAuth: false
    }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/external/ForgotPasswordView.vue'),
    meta: {
      titleKey: 'titles.forgot'
    }
  },
  {
    path: '/confirm-reset',
    name: 'confirm-reset',
    component: () => import('@/views/external/ConfirmResetPasswordView.vue'),
    meta: {
      titleKey: 'titles.reset'
    }
  },
  {
    path: '/password-updated',
    name: 'password-updated',
    component: () => import('@/views/external/PasswordUpdatedView.vue'),
    meta: {
      titleKey: 'titles.passwordUpdated'
    }
  }
]

export { externalCleanRoutes }
