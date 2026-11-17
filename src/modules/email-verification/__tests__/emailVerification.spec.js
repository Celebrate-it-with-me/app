import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import es from '@/locales/es'
import en from '@/locales/en'

const resend = vi.hoisted(() => vi.fn())
const refreshUser = vi.hoisted(() => vi.fn())
vi.mock('../services/EmailVerificationService', () => ({ default: { resend } }))
vi.mock('@/services/UserService', () => ({ default: { refreshUser } }))

const { isEmailNotVerified, normalizeStatus } = await import('../utils/emailVerification')
const { useEmailVerificationStore } = await import('../stores/useEmailVerificationStore')
const { useUserStore } = await import('@/stores/useUserStore')
const EmailVerifyNotice = (await import('../components/EmailVerifyNotice.vue')).default
const EmailVerifyDialog = (await import('../components/EmailVerifyDialog.vue')).default
const EmailVerifiedView = (await import('../views/EmailVerifiedView.vue')).default

const i18n = () => createI18n({ legacy: false, locale: 'es', fallbackLocale: 'en', messages: { es, en } })
const forbidden = code => ({ response: { status: 403, data: { code } } })

beforeEach(() => {
  setActivePinia(createPinia())
  resend.mockReset()
  refreshUser.mockReset()
})

describe('contract helpers', () => {
  it('recognizes only 403 email_not_verified', () => {
    expect(isEmailNotVerified(forbidden('email_not_verified'))).toBe(true)
    expect(isEmailNotVerified(forbidden('plan_required'))).toBe(false)
    expect(isEmailNotVerified({ response: { status: 422, data: { code: 'email_not_verified' } } })).toBe(false)
    expect(isEmailNotVerified(null)).toBe(false)
  })
  it('falls back to invalid for unknown statuses', () => {
    expect(normalizeStatus('ok')).toBe('ok')
    expect(normalizeStatus('expired')).toBe('expired')
    expect(normalizeStatus('nope')).toBe('invalid')
    expect(normalizeStatus(undefined)).toBe('invalid')
  })
})

describe('user store flag', () => {
  it('is only false when the API says false', () => {
    const user = useUserStore()
    expect(user.emailVerified).toBe(true)
    user.initUserData({ name: 'A', email: 'a@b.co', userId: 1, emailVerified: false })
    expect(user.emailVerified).toBe(false)
    user.initUserData({ name: 'A', email: 'a@b.co', userId: 1 })
    expect(user.emailVerified).toBe(true)
  })
  it('syncEmailVerified reads the flag from the user payload', async () => {
    const user = useUserStore()
    refreshUser.mockResolvedValue({ data: { data: { user: { emailVerified: false } } } })
    await user.syncEmailVerified()
    expect(user.emailVerified).toBe(false)
    refreshUser.mockRejectedValue(new Error('x'))
    await user.syncEmailVerified()
    expect(user.emailVerified).toBe(false)
  })
})

describe('resend', () => {
  it('maps the contract answers and the 429', async () => {
    const store = useEmailVerificationStore()
    resend.mockResolvedValue({ verified: false })
    expect(await store.resend()).toBe('sent')
    resend.mockRejectedValue({ response: { status: 429 } })
    expect(await store.resend()).toBe('limited')
    resend.mockRejectedValue({ response: { status: 500 } })
    expect(await store.resend()).toBe('error')
    resend.mockResolvedValue({ verified: true })
    expect(await store.resend()).toBe('verified')
    expect(useUserStore().emailVerified).toBe(true)
  })
  it('opening the dialog marks the user as not verified', () => {
    const store = useEmailVerificationStore()
    store.openDialog()
    expect(store.dialogOpen).toBe(true)
    expect(useUserStore().emailVerified).toBe(false)
  })
})

describe('EmailVerifyNotice', () => {
  const mountNotice = () => mount(EmailVerifyNotice, { global: { plugins: [i18n()] } })
  it('shows only while not verified and resends on click', async () => {
    const user = useUserStore()
    const wrapper = mountNotice()
    expect(wrapper.find('[data-testid="email-verify-notice"]').exists()).toBe(false)
    user.initUserData({ name: 'A', email: 'a@b.co', userId: 1, emailVerified: false })
    await flushPromises()
    expect(wrapper.find('[data-testid="email-verify-notice"]').exists()).toBe(true)
    resend.mockResolvedValue({ verified: false })
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(resend).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('a@b.co')
    expect(wrapper.text()).toContain('te enviamos un correo nuevo')
  })
  it('shows the rate-limit message on 429', async () => {
    useUserStore().initUserData({ name: 'A', email: 'a@b.co', userId: 1, emailVerified: false })
    resend.mockRejectedValue({ response: { status: 429 } })
    const wrapper = mountNotice()
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('demasiados correos')
  })
})

describe('EmailVerifyDialog', () => {
  it('opens on a 403 and offers the resend', async () => {
    const wrapper = mount(EmailVerifyDialog, { attachTo: document.body, global: { plugins: [i18n()] } })
    useEmailVerificationStore().openDialog()
    await flushPromises()
    expect(document.body.textContent).toContain('Verifica tu correo para continuar')
    resend.mockResolvedValue({ verified: false })
    const button = [...document.body.querySelectorAll('button')].find(b => b.textContent.includes('Reenviar correo'))
    button.click()
    await flushPromises()
    expect(resend).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})

describe('EmailVerifiedView', () => {
  async function render(query, signedIn = false) {
    if (signedIn) useUserStore().initUserData({ name: 'A', email: 'a@b.co', userId: 1, emailVerified: false })
    refreshUser.mockResolvedValue({ data: { data: { user: { emailVerified: true } } } })
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/email-verified', component: EmailVerifiedView }, { path: '/:p(.*)*', component: { template: '<div />' } }] })
    router.push('/email-verified' + query)
    await router.isReady()
    const wrapper = mount(EmailVerifiedView, { global: { plugins: [i18n(), router] } })
    await flushPromises()
    return wrapper
  }
  it('ok without session offers sign in', async () => {
    const wrapper = await render('?status=ok')
    expect(wrapper.text()).toContain('Correo verificado')
    expect(wrapper.text()).toContain('Entrar')
  })
  it('ok with session clears the notice flag', async () => {
    const wrapper = await render('?status=ok', true)
    expect(useUserStore().emailVerified).toBe(true)
    expect(wrapper.text()).toContain('Ir a mi panel')
    expect(refreshUser).toHaveBeenCalled()
  })
  it('expired with session offers resend', async () => {
    const wrapper = await render('?status=expired', true)
    expect(wrapper.text()).toContain('caducó')
    expect(wrapper.text()).toContain('Reenviar correo')
  })
  it('invalid without session offers sign in only', async () => {
    const wrapper = await render('?status=weird')
    expect(wrapper.text()).toContain('Enlace no válido')
    expect(wrapper.text()).not.toContain('Reenviar correo')
  })
})
