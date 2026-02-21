export default [
  {
    path: '/dashboard/timeline',
    name: 'timeline',
    component: () => import('@/modules/timeline/views/TimelineIndex.vue'),
    meta: {
      title: 'Event Timeline',
      requiresAuth: true,
      module: 'timeline'
    }
  }
]
