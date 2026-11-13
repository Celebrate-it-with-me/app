export default [
  {
    path: '/dashboard/event-comments',
    name: 'event-comments',
    component: () => import('@/modules/comments/views/CCommentsView.vue'),
    meta: {
      moduleKey: 'comments',
      titleKey: 'titles.comments',
      requiresAuth: true,
      requiredPermission: ['view_event_comments'],
      requiresFeature: 'comments',
      module: 'comments'
    }
  }
]
