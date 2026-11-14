import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'

const store = { checkResetLink: vi.fn(), changePassword: vi.fn() }
const push = vi.fn()
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => store }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { confirm: encodeURIComponent('http://api/check-password-link/1/h?token=linktok&signature=s') } }),
  useRouter: () => ({ push })
}))
const { default: View } = await import('../ConfirmResetPasswordView.vue')

const i18n = createI18n({ legacy: false, locale: 'es', messages: { es } })
const mountView = () => mount(View, {
  global: { plugins: [i18n], stubs: { 'router-link': true, AuthCard: { props: ['error'], template: '<div><p class="err">{{ error }}</p><slot /></div>' } } }
})

async function fill(w) {
  const inputs = w.findAll('input')
  await inputs[0].setValue('a@b.co')
  await inputs[1].setValue('Secret1234')
  await inputs[2].setValue('Secret1234')
  await w.find('form').trigger('submit')
  await vi.waitFor(() => expect(store.changePassword).toHaveBeenCalled())
  await flushPromises()
}

describe('ConfirmResetPasswordView', () => {
  beforeEach(() => {
    push.mockReset()
    store.checkResetLink.mockReset().mockResolvedValue({ status: 200, data: { data: { email: 'a@b.co' }, token: 'bodytok' } })
    store.changePassword.mockReset()
  })

  it('sends the token from the check response with the new password', async () => {
    store.changePassword.mockResolvedValue({ status: 200 })
    const w = mountView()
    await flushPromises()
    await fill(w)
    expect(store.changePassword).toHaveBeenCalledWith({ email: 'a@b.co', token: 'bodytok', password: 'Secret1234', passwordConfirmation: 'Secret1234' })
    expect(push).toHaveBeenCalledWith('/password-updated')
  })

  it('falls back to the token in the link', async () => {
    store.checkResetLink.mockResolvedValue({ status: 200, data: { data: { email: 'a@b.co' } } })
    store.changePassword.mockResolvedValue({ status: 200 })
    const w = mountView()
    await flushPromises()
    await fill(w)
    expect(store.changePassword.mock.calls[0][0].token).toBe('linktok')
  })

  it('tells her the link expired on invalid_reset_token', async () => {
    store.changePassword.mockRejectedValue({ response: { status: 422, data: { message: 'x', code: 'invalid_reset_token' } } })
    const w = mountView()
    await flushPromises()
    await fill(w)
    expect(w.find('.err').text()).toBe(es.auth.resetExpired)
  })

  it('shows the wait on a 429', async () => {
    store.changePassword.mockRejectedValue({ response: { status: 429, data: { code: 'too_many_attempts' }, headers: { 'retry-after': '45' } } })
    const w = mountView()
    await flushPromises()
    await fill(w)
    expect(w.find('.err').text()).toContain('45')
  })
})
