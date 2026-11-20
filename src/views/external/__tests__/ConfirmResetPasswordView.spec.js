import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es'

const store = { checkResetLink: vi.fn(), changePassword: vi.fn() }
const push = vi.fn()
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => store }))
const GOOD = 'http://dev.api.cwm.com/api/v1/app/check-password-link?user=1&token=linktok&signature=s'
const route = vi.hoisted(() => ({ confirm: '' }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: route }),
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
    vi.stubEnv('VITE_API_URL', 'http://dev.api.cwm.com/')
    route.confirm = encodeURIComponent(GOOD)
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

  it('explains an expired or tampered signed link (403 invalid_signed_link) and offers a new one', async () => {
    store.checkResetLink.mockRejectedValue({ response: { status: 403, data: { message: 'Invalid signature.', code: 'invalid_signed_link' } } })
    const w = mountView()
    await flushPromises()
    expect(w.find('form').exists()).toBe(false)
    expect(store.changePassword).not.toHaveBeenCalled()
    expect(es.auth.resetInvalid).toContain('caducó')
    const fallback = w.findComponent({ name: 'UiButton' })
    expect(fallback.exists()).toBe(true)
    expect(fallback.props('to')).toBe('/forgot-password')
  })
  it.each([
    ['another host', 'https://evil.com/api/v1/app/check-password-link?token=x'],
    ['deceptive subdomain', 'http://dev.api.cwm.com.evil.com/api/v1/app/check-password-link?token=x'],
    ['scheme-relative', '//evil.com/api/v1/app/check-password-link?token=x'],
    ['relative', '/api/v1/app/check-password-link?token=x'],
    ['credentials in the url', 'http://u:p@dev.api.cwm.com/api/v1/app/check-password-link?token=x'],
    ['other path', 'http://dev.api.cwm.com/api/v1/app/logout?token=x'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['empty', '']
  ])('never calls the API for a hostile link (%s) and shows the invalid state', async (_n, link) => {
    route.confirm = encodeURIComponent(link)
    const w = mountView()
    await flushPromises()
    expect(store.checkResetLink).not.toHaveBeenCalled()
    expect(w.find('form').exists()).toBe(false)
  })

  it('treats a malformed encoding as invalid', async () => {
    route.confirm = '%E0%A4%A'
    const w = mountView()
    await flushPromises()
    expect(store.checkResetLink).not.toHaveBeenCalled()
    expect(w.find('form').exists()).toBe(false)
  })

  it('passes the trusted link through untouched', async () => {
    mountView()
    await flushPromises()
    expect(store.checkResetLink).toHaveBeenCalledWith(GOOD)
  })
})
