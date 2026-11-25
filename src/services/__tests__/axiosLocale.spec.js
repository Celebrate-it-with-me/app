import { describe, it, expect, vi, beforeEach } from 'vitest'

const impersonation = { active: false, token: 'imp' }
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ token: '', logOut: vi.fn() }) }))
vi.mock('@/stores/useNotificationStore', () => ({ useNotificationStore: () => ({}) }))
vi.mock('@/router', () => ({ default: { push: vi.fn(), currentRoute: { value: {} } } }))
vi.mock('@/modules/impersonation/stores/useImpersonationStore', () => ({ useImpersonationStore: () => impersonation }))

const { CWM_API } = await import('../axios')
const { default: i18n } = await import('@/locales/i18n')

const run = () => CWM_API.interceptors.request.handlers[0].fulfilled({ headers: {} })

describe('X-Locale request header', () => {
  beforeEach(() => {
    impersonation.active = false
  })

  it('sends the language of the app on every request', async () => {
    i18n.global.locale.value = 'es'
    expect((await run()).headers['X-Locale']).toBe('es')
    i18n.global.locale.value = 'en'
    expect((await run()).headers['X-Locale']).toBe('en')
  })

  it('also sends it in a support session', async () => {
    impersonation.active = true
    i18n.global.locale.value = 'en'
    const config = await run()
    expect(config.headers['X-Locale']).toBe('en')
    expect(config.headers.Authorization).toBe('Bearer imp')
  })
})
