
const nonAuthRoutes = [
  {
    path: 'auth/social/callback',
    name: 'social-callback',
    component: () => import('@/views/external/SocialCallbackView.vue'),
    meta: {
      titleKey: 'titles.signIn',
      requiresAuth: false
    }
  },
  {
    path: '',
    name: 'home',
    component: () => import('@/views/external/HomeView.vue'),
    meta: {
      titleKey: 'titles.home'
    }
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: () => import('@/views/external/SignUpView.vue'),
    meta: {
      titleKey: 'titles.signUp'
    }
  },
  {
    path: '/event/:id/invite',
    name: 'invite-accept',
    component: () => import('@/views/external/InviteAcceptView.vue'),
    meta: {
      titleKey: 'titles.invite',
      requiresAuth: false
    }
  },
  {
    path: '/confirm-email',
    name: 'confirm-email',
    component: () => import('@/views/external/ConfirmEmailView.vue'),
    meta: {
      titleKey: 'titles.confirmEmail'
    }
  },
  {
    path: '/email-verified',
    name: 'email-verified',
    component: () => import('@/modules/email-verification/views/EmailVerifiedView.vue'),
    meta: {
      titleKey: 'titles.emailVerified'
    }
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: () => import('@/views/external/SignInView.vue'),
    meta: {
      titleKey: 'titles.signIn'
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/views/external/TermsView.vue'),
    meta: {
      titleKey: 'titles.terms'
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/external/PrivacyView.vue'),
    meta: {
      titleKey: 'titles.privacy'
    }
  },
  {
    path: '/cookies',
    name: 'cookies',
    component: () => import('@/views/external/CookiesView.vue'),
    meta: {
      titleKey: 'titles.cookies'
    }
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('@/views/external/HelpView.vue'),
    meta: {
      titleKey: 'titles.help'
    }
  }
]

export { nonAuthRoutes }
