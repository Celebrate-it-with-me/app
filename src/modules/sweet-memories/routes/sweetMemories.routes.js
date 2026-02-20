export default [
  {
    path: '/dashboard/memories',
    name: 'memories-admin',
    component: () => import('@/modules/sweet-memories/views/CSweetMemories.vue'),
    meta: {
      title: 'Sweet Memories',
      requiresAuth: true,
      requiredPermission: ['view_sweet_memories'],
      requiresFeature: 'suggested-music',
      module: 'suggested-music'
    }
  }
]
