import ForgotPasswordView from '@/views/external/ForgotPasswordView.vue'

const externalCleanRoutes = [
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: {
      title: 'Home'
    }
  },

]

export { externalCleanRoutes }
