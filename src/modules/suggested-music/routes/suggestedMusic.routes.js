export default [
  {
    path: '/dashboard/suggested-music',
    name: 'suggest-music',
    component: () => import('@/modules/suggested-music/views/CSuggestedMusic.vue'),
    meta: {
      title: 'Suggested Music',
      requiresAuth: true,
      requiredPermission: ['view_suggested_music'],
      requiresFeature: 'suggested-music',
      module: 'suggested-music'
    }
  }
]
