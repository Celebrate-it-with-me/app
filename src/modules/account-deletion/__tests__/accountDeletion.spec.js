import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import i18n from '@/locales/i18n'
import { deletionError } from '../utils'
import { mockDestroy, mockPreview } from '../services/accountDeletionMock'

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  destroy: vi.fn(),
  push: vi.fn(),
  logOut: vi.fn()
}))

vi.mock('../services/AccountDeletionService', () => ({
  default: { preview: mocks.preview, destroy: mocks.destroy }
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/stores/useUserStore', () => ({ useUserStore: () => ({ logOut: mocks.logOut }) }))

import DeleteAccountDialog from '../components/DeleteAccountDialog.vue'

const PREVIEW = {
  email: 'Marisol@cwm.test',
  hasPassword: true,
  events: { published: 2, unpublished: 1, collaborating: 1 },
  archiveDays: 30,
  pendingPurchases: 0
}

const apiError = (status, data, headers = {}) => Object.assign(new Error('x'), { response: { status, data, headers } })
const text = () => document.body.textContent.replace(/\s+/g, ' ')
const byText = label => [...document.body.querySelectorAll('button')].find(b => b.textContent.trim() === label)

async function mountDialog() {
  const wrapper = mount(DeleteAccountDialog, {
    props: { open: true },
    global: { plugins: [i18n] },
    attachTo: document.body
  })
  await flushPromises()
  return wrapper
}

async function click(label) {
  byText(label).click()
  await flushPromises()
}

async function type(selector, value) {
  const input = document.body.querySelector(selector)
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flushPromises()
}

async function toConfirmStep() {
  await click('Continuar')
  await type('#deletion_email', 'marisol@CWM.test')
  await type('#deletion_password', 'password')
  await click('Continuar')
}

describe('DeleteAccountDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    i18n.global.locale.value = 'es'
    Object.values(mocks).forEach(m => m.mockReset())
    mocks.preview.mockResolvedValue({ data: { data: PREVIEW } })
    mocks.logOut.mockResolvedValue()
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('step 1 shows the counts, the 30 days and the warning', async () => {
    await mountDialog()
    const content = text()
    expect(content).toContain('Paso 1 de 3')
    expect(content).toContain('Tus 2 eventos publicados quedarán archivados 30 días')
    expect(content).toContain('Tu evento sin publicar se borrará')
    expect(content).toContain('Saldrás del evento en el que colaboras')
    expect(content).toContain('facturas')
    expect(content).toContain('Esto no se puede deshacer')
  })

  it('shows a retry when the summary fails to load', async () => {
    mocks.preview.mockRejectedValueOnce(apiError(500, {}))
    await mountDialog()
    expect(text()).toContain('No pudimos cargar el resumen')
    expect(byText('Continuar').disabled).toBe(true)
    await click('Reintentar')
    expect(text()).toContain('Tus 2 eventos publicados')
  })

  it('step 2 needs the exact email (case-insensitive) and the password', async () => {
    await mountDialog()
    await click('Continuar')
    expect(text()).toContain('Paso 2 de 3')
    expect(document.body.querySelector('[data-testid="account-email"]').textContent).toContain('Marisol@cwm.test')
    expect(byText('Continuar').disabled).toBe(true)
    await type('#deletion_email', 'otra@cwm.test')
    await type('#deletion_password', 'password')
    expect(byText('Continuar').disabled).toBe(true)
    await type('#deletion_email', 'marisol@cwm.test')
    expect(byText('Continuar').disabled).toBe(false)
    await type('#deletion_password', '')
    expect(byText('Continuar').disabled).toBe(true)
  })

  it('asks no password for social accounts', async () => {
    mocks.preview.mockResolvedValue({ data: { data: { ...PREVIEW, hasPassword: false } } })
    await mountDialog()
    await click('Continuar')
    expect(document.body.querySelector('#deletion_password')).toBeNull()
    await type('#deletion_email', 'marisol@cwm.test')
    await click('Continuar')
    mocks.destroy.mockResolvedValue({ data: { data: {} } })
    await click('Sí, eliminar mi cuenta')
    expect(mocks.destroy).toHaveBeenCalledWith({ email: 'marisol@cwm.test', currentPassword: '' })
  })

  it('on success clears the local state and goes to the goodbye screen', async () => {
    mocks.destroy.mockResolvedValue({ data: { data: { archivedEvents: 2, deletedEvents: 1 } } })
    const wrapper = await mountDialog()
    await toConfirmStep()
    expect(text()).toContain('Paso 3 de 3')
    await click('Sí, eliminar mi cuenta')
    expect(mocks.destroy).toHaveBeenCalledWith({ email: 'marisol@CWM.test', currentPassword: 'password' })
    expect(mocks.logOut).toHaveBeenCalledOnce()
    expect(mocks.push).toHaveBeenCalledWith({ name: 'account-deleted' })
    expect(wrapper.emitted('update:open').at(-1)).toEqual([false])
  })

  it.each([
    ['email_mismatch', { email: ['email_mismatch'] }, 'Ese correo no coincide'],
    ['invalid_current_password', { current_password: ['invalid_current_password'] }, 'La contraseña no es correcta']
  ])('422 %s returns to step 2 with the message under the field', async (_name, errors, message) => {
    mocks.destroy.mockRejectedValue(apiError(422, { message: 'x', errors }))
    await mountDialog()
    await toConfirmStep()
    await click('Sí, eliminar mi cuenta')
    expect(text()).toContain('Paso 2 de 3')
    expect(text()).toContain(message)
    expect(mocks.logOut).not.toHaveBeenCalled()
  })

  it.each([
    [403, { code: 'staff_account' }, {}, 'equipo de soporte', true],
    [409, { code: 'pending_payment' }, {}, 'pago en curso', false],
    [429, { code: 'too_many_attempts' }, { 'retry-after': '1800' }, 'en 30 minutos', false],
    [429, { code: 'too_many_attempts' }, {}, 'demasiados intentos', false],
    [500, {}, {}, 'No se borró nada', false]
  ])('%s %j stays on step 3 with a clear alert', async (status, data, headers, message, blocked) => {
    mocks.destroy.mockRejectedValue(apiError(status, data, headers))
    await mountDialog()
    await toConfirmStep()
    await click('Sí, eliminar mi cuenta')
    expect(text()).toContain('Paso 3 de 3')
    expect(document.body.querySelector('[role="alert"]').textContent).toContain(message)
    expect(byText('Sí, eliminar mi cuenta').disabled).toBe(blocked)
    expect(mocks.logOut).not.toHaveBeenCalled()
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('has the same copy in English', async () => {
    i18n.global.locale.value = 'en'
    await mountDialog()
    expect(text()).toContain('Step 1 of 3')
    expect(text()).toContain('Your 2 published events will be archived for 30 days')
  })
})

describe('deletionError', () => {
  it('maps every contract error', () => {
    expect(deletionError(apiError(422, { errors: { email: ['email_mismatch'] } })).field).toBe('email')
    expect(deletionError(apiError(422, { errors: { current_password: ['invalid_current_password'] } })).field).toBe('current_password')
    expect(deletionError(apiError(403, { code: 'staff_account' })).blocking).toBe(true)
    expect(deletionError(apiError(409, { code: 'pending_payment' })).messageKey).toBe('accountDeletion.errors.pendingPayment')
    expect(deletionError(apiError(429, {}, { 'retry-after': '30' })).params).toEqual({ seconds: 30 })
    expect(deletionError(new Error('network')).messageKey).toBe('accountDeletion.errors.generic')
  })
})

describe('mock follows the contract', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ACCOUNT_DELETION_MOCK', '1')
    localStorage.clear()
  })
  afterEach(() => vi.unstubAllEnvs())

  it('previews, then rejects wrong email and password, then succeeds', () => {
    const preview = mockPreview().data.data
    expect(preview).toMatchObject({ hasPassword: true, archiveDays: 30, events: { published: 2, unpublished: 1, collaborating: 1 } })
    expect(() => mockDestroy({ email: 'x@y.z', current_password: 'password' })).toThrowError()
    try {
      mockDestroy({ email: preview.email, current_password: 'nope' })
    } catch (e) {
      expect(e.response.data.errors.current_password[0]).toBe('invalid_current_password')
    }
    expect(mockDestroy({ email: preview.email.toUpperCase(), current_password: 'password' }).data.data.archivedEvents).toBe(2)
  })

  it.each([
    ['staff', 403, 'staff_account'],
    ['pending', 409, 'pending_payment'],
    ['toomany', 429, 'too_many_attempts']
  ])('mode %s answers %s', (mode, status, code) => {
    localStorage.setItem('cwm.accountDeletionMock', mode)
    try {
      mockDestroy({ email: 'marisol@cwm.test', current_password: 'password' })
      expect.unreachable()
    } catch (e) {
      expect(e.response.status).toBe(status)
      expect(e.response.data.code).toBe(code)
    }
  })

  it('social mode has no password', () => {
    localStorage.setItem('cwm.accountDeletionMock', 'social')
    expect(mockPreview().data.data.hasPassword).toBe(false)
  })
})
