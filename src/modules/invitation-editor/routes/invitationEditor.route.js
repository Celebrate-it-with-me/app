export default [
  {
    path: '/dashboard/invitation',
    name: 'invitation-editor',
    component: () => import('@/modules/invitation-editor/views/InvitationEditorView.vue'),
    meta: {
      titleKey: 'invitationEditor.title',
      requiresAuth: true,
      requiredPermission: []
    }
  }
]
