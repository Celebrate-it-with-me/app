/** Public invitation: no layout, no login. The event slug and guest code are the credentials. */
const invitationRoutes = [
  {
    // A link without the guest code: asks for it. Not indexed, never says whether the event exists.
    path: '/i/:slug',
    name: 'invitation-access',
    component: () => import('@/modules/invitation/views/InvitationAccessView.vue'),
    meta: { titleKey: 'invitationAccess.pageTitle', requiresAuth: false, noindex: true }
  },
  {
    path: '/i/:slug/:code',
    name: 'invitation',
    component: () => import('@/modules/invitation/views/InvitationView.vue'),
    meta: { titleKey: 'invitation.pageTitle', requiresAuth: false }
  },
  {
    path: '/preview/invitation',
    name: 'InvitationPreview',
    component: () => import('@/modules/invitation/views/InvitationPreviewView.vue'),
    meta: { titleKey: 'invitation.pageTitle', requiresAuth: false, noindex: true }
  }
]

export { invitationRoutes }
