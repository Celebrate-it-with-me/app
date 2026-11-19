import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/services/PublicEvents/InvitationService', () => ({ default: { get } }))

import i18n from '@/locales/i18n'
import InvitationView from '../views/InvitationView.vue'

async function open(url) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/i/:slug', name: 'invitation-access', component: { template: '<p>access</p>' } },
      { path: '/i/:slug/:code', name: 'invitation', component: InvitationView }
    ]
  })
  router.push(url)
  await router.isReady()
  const wrapper = mount(InvitationView, { global: { plugins: [router, i18n] } })
  await flushPromises()
  return { wrapper, router }
}

describe('invitation with a code that opens nothing', () => {
  it('redirects to the access screen with the code and the error', async () => {
    get.mockRejectedValue({ response: { status: 404 } })
    const { router, wrapper } = await open('/i/xv/BAD1')
    expect(router.currentRoute.value.path).toBe('/i/xv')
    expect(router.currentRoute.value.query).toEqual({ code: 'BAD1', error: 'invalid' })
    wrapper.unmount()
  })

  it('stays on the invitation for other failures', async () => {
    get.mockRejectedValue({ response: { status: 500 } })
    const { router, wrapper } = await open('/i/xv/BAD1')
    expect(router.currentRoute.value.path).toBe('/i/xv/BAD1')
    wrapper.unmount()
  })
})
