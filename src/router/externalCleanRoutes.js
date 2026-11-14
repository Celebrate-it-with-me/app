import ForgotPasswordView from '@/views/external/ForgotPasswordView.vue'
import ConfirmResetPasswordView from '@/views/external/ConfirmResetPasswordView.vue'
import PasswordUpdatedView from '@/views/external/PasswordUpdatedView.vue'
import AccountSuspendedView from '@/views/external/AccountSuspendedView.vue'
import AccountDeletedView from '@/modules/account-deletion/views/AccountDeletedView.vue'

const externalCleanRoutes = [
  {
    path: '/account-suspended',
    name: 'account-suspended',
    component: AccountSuspendedView,
    meta: {
      titleKey: 'accountSuspended.title',
      requiresAuth: false
    }
  },
  {
    path: '/account-deleted',
    name: 'account-deleted',
    component: AccountDeletedView,
    meta: {
      titleKey: 'accountDeleted.title',
      requiresAuth: false
    }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: {
      titleKey: 'titles.forgot'
    }
  },
  {
    path: '/confirm-reset',
    name: 'confirm-reset',
    component: ConfirmResetPasswordView,
    meta: {
      titleKey: 'titles.reset'
    }
  },
  {
    path: '/password-updated',
    name: 'password-updated',
    component: PasswordUpdatedView,
    meta: {
      titleKey: 'titles.passwordUpdated'
    }
  }
]

export { externalCleanRoutes }
