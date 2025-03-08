import SignUpView from '../views/non-authenticated/SignUpView.vue'
import HomeView from '@/views/HomeView.vue'
import SignInView from '@/views/non-authenticated/SignInView.vue'

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
    path: '/sign-in',
    name: 'sign-in',
    component: SignInView,
    meta: {
      title: 'Sign up'
    }
  }
]

export { nonAuthRoutes }
