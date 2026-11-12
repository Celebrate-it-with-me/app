export default [
  {
    path: '/dashboard/timeline',
    name: 'timeline',
    component: () => import('@/modules/timeline/views/TimelineView.vue'),
    meta: {
      moduleKey: 'timeline',
      titleKey: 'titles.timeline',
      requiresAuth: true,
      module: 'timeline'
    }
  }
]
