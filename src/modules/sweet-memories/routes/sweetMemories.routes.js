export default [
  {
    path: '/dashboard/memories',
    name: 'memories-admin',
    component: () => import('@/modules/sweet-memories/views/CSweetMemories.vue'),
    meta: {
      moduleKey: 'memories',
      titleKey: 'titles.memories',
      requiresAuth: true,
      requiredPermission: ['view_sweet_memories'],
      requiresFeature: 'memories',
      module: 'memories'
    }
  }
]
