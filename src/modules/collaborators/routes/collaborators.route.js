export default [
  {
    path: '/dashboard/collaborators',
    name: 'collaborators',
    component: () => import('@/modules/collaborators/views/CollaboratorsView.vue'),
    meta: { titleKey: 'titles.collaborators', requiresAuth: true, requiredPermission: [] }
  },
  // The API's "invite collaborators" suggestion points here.
  { path: '/dashboard/collaborators/invite', redirect: { name: 'collaborators', query: { invite: '1' } } }
]
