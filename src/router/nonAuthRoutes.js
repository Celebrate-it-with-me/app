import HomeView from '@/views/external/HomeView.vue'
import SignUpView from '@/views/external/SignUpView.vue'
import SignInView from '@/views/external/SignInView.vue'

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
