import ForgotPasswordView from '@/views/external/ForgotPasswordView.vue'
import ConfirmResetPasswordView from '@/views/external/ConfirmResetPasswordView.vue'
import PasswordUpdatedView from '@/views/external/PasswordUpdatedView.vue'

const externalCleanRoutes = [
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/confirm-reset',
    name: 'confirm-reset',
    component: ConfirmResetPasswordView,
    meta: {
      title: 'Confirm Reset Password'
    }
  },
  {
    path: '/password-updated',
    name: 'password-updated',
    component: PasswordUpdatedView,
    meta: {
      title: 'Password Updated'
    }
  }
]

export { externalCleanRoutes }
