import ForgotPasswordView from '@/views/external/ForgotPasswordView.vue'
import ConfirmResetPasswordView from '@/views/external/ConfirmResetPasswordView.vue'
import PasswordUpdatedView from '@/views/external/PasswordUpdatedView.vue'

const externalCleanRoutes = [
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
