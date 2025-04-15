import HomeView from '@/views/external/HomeView.vue'
import SignUpView from '@/views/external/SignUpView.vue'
import SignInView from '@/views/external/SignInView.vue'
import Login from '@/views/non-authenticated/SignInView.vue'
import ConfirmEmailView from '@/views/external/ConfirmEmailView.vue'

const nonAuthRoutes = [
  {
    path: '',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: SignUpView,
    meta: {
      title: 'Sign up'
    }
  },
  {
    path: '/confirm-email',
    name: 'confirm-email',
    component: ConfirmEmailView,
    meta: {
      title: 'Confirm Email'
    }
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: SignInView,
    meta: {
      title: 'Sign up'
    }
  },
  {
    path: '/sign-in2',
    name: 'sign-in2',
    component: Login,
    meta: {
      title: 'Sign up'
    }
  }
]

export { nonAuthRoutes }
