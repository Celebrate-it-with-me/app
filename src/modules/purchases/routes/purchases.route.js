import AccountLayout from '@/components/internal/layout/AccountLayout.vue'

// A sibling of the /settings tabs, under the same account layout.
export default [
  {
    path: '/settings/purchases',
    component: AccountLayout,
    children: [
      {
        path: '',
        name: 'settings-purchases',
        component: () => import('@/modules/purchases/views/PurchasesView.vue'),
        meta: { titleKey: 'titles.purchases', requiresAuth: true }
      }
    ]
  }
]
