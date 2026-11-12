export default [
  {
    path: '/dashboard/timeline',
    name: 'timeline',
    component: () => import('@/modules/timeline/views/TimelineIndex.vue'),
    meta: {
      moduleKey: 'timeline',
      title: 'Event Timeline',
      requiresAuth: true,
      module: 'timeline'
    }
  }
]
