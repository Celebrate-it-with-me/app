import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale } from '@/locales/i18n'

const api = vi.hoisted(() => ({ checkInviteToken: vi.fn() }))
vi.mock('@/services/CollaboratorsService', () => ({ default: api }))
import InviteAcceptView from '../InviteAcceptView.vue'

let wrapper

async function open() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/events/:id/invite', component: InviteAcceptView }] })
  await router.push('/events/7/invite?token=abc')
  await router.isReady()
  wrapper = mount(InviteAcceptView, { global: { plugins: [i18n, pinia, router], stubs: { AuthCard: { props: ['title', 'subtitle', 'error'], template: '<div><p v-if="error" role="alert">{{ error }}</p><slot /></div>' } } } })
  await flushPromises()
}

beforeEach(() => {
  setLocale('es')
  api.checkInviteToken.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

describe('InviteAcceptView', () => {
  it('says the invitation was already used or expired on a 422', async () => {
    api.checkInviteToken.mockRejectedValue({ response: { status: 422, data: { message: 'The invitation is not valid.' } } })
    await open()
    expect(wrapper.text()).toContain('Esta invitación ya fue usada o venció.')
    expect(wrapper.text()).not.toContain('The invitation is not valid')
    expect(wrapper.text()).not.toContain('Aceptar invitación')
  })

  it('falls back to the generic message for other failures', async () => {
    api.checkInviteToken.mockRejectedValue({ response: { status: 500, data: {} } })
    await open()
    expect(wrapper.text()).toContain('La invitación no es válida o expiró.')
  })

  it('shows the invitation when it is valid', async () => {
    api.checkInviteToken.mockResolvedValue({ status: 200, data: { id: 1, status: 'pending', role: 'editor', event: { id: 7, event_name: 'Los XV' } } })
    await open()
    expect(wrapper.text()).toContain('Los XV')
    expect(wrapper.text()).toContain('Aceptar invitación')
  })
})
