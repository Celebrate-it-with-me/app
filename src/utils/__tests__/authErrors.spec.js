import { describe, it, expect } from 'vitest'
import { authErrorMessage, tokenFromLink, retryAfterSeconds } from '../authErrors'

const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)
const err = (status, data = {}, headers = {}) => ({ response: { status, data, headers } })

describe('authErrorMessage', () => {
  it('shows the wait in seconds when Retry-After is short', () => {
    expect(authErrorMessage(err(429, { code: 'too_many_attempts' }, { 'retry-after': '30' }), t)).toBe('auth.tooManyAttemptsSeconds:{"seconds":30}')
  })
  it('rounds the wait up to minutes', () => {
    expect(authErrorMessage(err(429, { code: 'too_many_attempts' }, { 'retry-after': '125' }), t)).toBe('auth.tooManyAttemptsMinutes:{"minutes":3}')
  })
  it('falls back to the plain message without Retry-After', () => {
    expect(authErrorMessage(err(429, { code: 'too_many_attempts' }), t)).toBe('auth.tooManyAttempts')
    expect(retryAfterSeconds(err(429, {}, { 'retry-after': 'x' }))).toBeNull()
  })
  it('explains an expired reset link', () => {
    expect(authErrorMessage(err(422, { message: 'x', code: 'invalid_reset_token' }), t)).toBe('auth.resetExpired')
  })
  it('keeps the server message otherwise', () => {
    expect(authErrorMessage(err(401, { message: 'Bad credentials' }), t)).toBe('Bad credentials')
    expect(authErrorMessage({}, t)).toBe('common.genericError')
  })
})

describe('tokenFromLink', () => {
  it('reads the token of the signed link', () => {
    expect(tokenFromLink('http://api/check-password-link/1/abc?expires=1&token=tok123&signature=s')).toBe('tok123')
    expect(tokenFromLink('')).toBe('')
  })
})
