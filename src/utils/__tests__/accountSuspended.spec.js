import { describe, it, expect } from 'vitest'
import es from '@/locales/es'
import en from '@/locales/en'
import { SUSPENDED_SUPPORT_EMAIL } from '@/config/brand'
import { isAccountSuspended, isSuspendedSocialCallback, supportEmailFrom } from '../accountSuspended'

const forbidden = data => ({ response: { status: 403, data } })

describe('account suspended mapping', () => {
  it('recognises only the 403 with the account_suspended code', () => {
    expect(isAccountSuspended(forbidden({ code: 'account_suspended' }))).toBe(true)
    expect(isAccountSuspended(forbidden({ message: 'Forbidden' }))).toBe(false)
    expect(isAccountSuspended({ response: { status: 401, data: { code: 'account_suspended' } } })).toBe(false)
    expect(isAccountSuspended(new Error('network'))).toBe(false)
  })

  it('takes the support email from the API and falls back to the brand one', () => {
    expect(supportEmailFrom(forbidden({ code: 'account_suspended', supportEmail: 'ayuda@quinvite.com' }))).toBe('ayuda@quinvite.com')
    expect(supportEmailFrom(forbidden({ code: 'account_suspended', supportEmail: 'not an email' }))).toBe(SUSPENDED_SUPPORT_EMAIL)
    expect(supportEmailFrom(forbidden({ code: 'account_suspended' }))).toBe(SUSPENDED_SUPPORT_EMAIL)
  })

  it('detects the Google callback redirect', () => {
    expect(isSuspendedSocialCallback({ status: 'error', provider: 'google', reason: 'account_suspended' })).toBe(true)
    expect(isSuspendedSocialCallback({ status: 'error', reason: 'other' })).toBe(false)
    expect(isSuspendedSocialCallback({ status: 'ok' })).toBe(false)
  })

  it('has the same screen texts in es and en', () => {
    expect(Object.keys(es.accountSuspended).sort()).toEqual(Object.keys(en.accountSuspended).sort())
    for (const k of Object.keys(es.accountSuspended)) {
      expect(es.accountSuspended[k]).toBeTruthy()
      expect(en.accountSuspended[k]).toBeTruthy()
    }
  })
})
