/** Public invitation: no layout, no login. The event slug and guest code are the credentials. */
const invitationRoutes = [
  {
    path: '/i/:slug/:code',
    name: 'invitation',
    component: () => import('@/modules/invitation/views/InvitationView.vue'),
    meta: { titleKey: 'invitation.pageTitle', requiresAuth: false }
  }
]

export { invitationRoutes }
