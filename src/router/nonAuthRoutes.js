import SignUpView from '../views/SignUpView.vue'
import HomeView from '@/views/HomeView.vue'

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
  }
]

export { nonAuthRoutes }
