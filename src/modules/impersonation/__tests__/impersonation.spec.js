import { describe, it, expect, beforeEach } from 'vitest'
import es from '@/locales/es'
import en from '@/locales/en'
import {
  STORAGE_KEY,
  clearSession,
  formatCountdown,
  isBlockedError,
  isEndedError,
  isSupportTab,
  parseFragment,
  readBlobBody,
  readSession,
  remainingSeconds,
  writeSession
} from '../utils/impersonation'

const err = (status, data) => ({ response: { status, data } })

describe('parseFragment', () => {
  it('reads token and expiry from the fragment', () => {
    expect(parseFragment('#token=82%7CabC&expires=2026-11-13T20%3A46%3A42%2B00%3A00')).toEqual({
      token: '82|abC',
      expires: '2026-11-13T20:46:42+00:00'
    })
  })
  it('accepts a fragment without the hash and without expiry', () => {
    expect(parseFragment('token=abc')).toEqual({ token: 'abc', expires: null })
  })
  it('ignores a broken expiry date', () => {
    expect(parseFragment('#token=abc&expires=nope').expires).toBeNull()
  })
  it('returns null without a token', () => {
    expect(parseFragment('')).toBeNull()
    expect(parseFragment('#expires=2026-01-01')).toBeNull()
    expect(parseFragment('#token=%20')).toBeNull()
  })
})

describe('countdown', () => {
  const now = Date.parse('2026-11-13T10:00:00Z')
  it('counts whole seconds up to the deadline and never below zero', () => {
    expect(remainingSeconds('2026-11-13T10:45:00Z', now)).toBe(2700)
    expect(remainingSeconds('2026-11-13T10:00:00.400Z', now)).toBe(1)
    expect(remainingSeconds('2026-11-13T09:59:00Z', now)).toBe(0)
  })
  it('has no deadline without a date, and counts a broken date as over', () => {
    expect(remainingSeconds(null, now)).toBe(Infinity)
    expect(remainingSeconds('x', now)).toBe(0)
  })
  it('formats mm:ss and h:mm:ss', () => {
    expect(formatCountdown(2712)).toBe('45:12')
    expect(formatCountdown(5)).toBe('00:05')
    expect(formatCountdown(0)).toBe('00:00')
    expect(formatCountdown(3900)).toBe('1:05:00')
    expect(formatCountdown(Infinity)).toBe('--:--')
    expect(formatCountdown(-3)).toBe('00:00')
  })
})

describe('error codes', () => {
  it('recognises the blocked-action answer only with the right code', () => {
    expect(isBlockedError(err(403, { code: 'impersonation_blocked' }))).toBe(true)
    expect(isBlockedError(err(403, { code: 'account_suspended' }))).toBe(false)
    expect(isBlockedError(err(401, { code: 'impersonation_blocked' }))).toBe(false)
    expect(isBlockedError(null)).toBe(false)
  })
  it('treats a 401 as the end of the session only while one is active', () => {
    expect(isEndedError(err(401, { code: 'impersonation_ended' }), true)).toBe(true)
    expect(isEndedError(err(401), true)).toBe(true)
    expect(isEndedError(err(401), false)).toBe(false)
    expect(isEndedError(err(403), true)).toBe(false)
  })
})

describe('tab storage', () => {
  beforeEach(() => sessionStorage.clear())
  it('saves, reads and clears the session of the tab', () => {
    expect(readSession()).toBeNull()
    writeSession({ token: 't', expiresAt: 'x' })
    expect(readSession()).toEqual({ token: 't', expiresAt: 'x' })
    clearSession()
    expect(readSession()).toBeNull()
  })
  it('ignores garbage in storage', () => {
    sessionStorage.setItem(STORAGE_KEY, '{nope')
    expect(readSession()).toBeNull()
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: '' }))
    expect(readSession()).toBeNull()
  })
  it('knows a support tab by its entry path or its saved session', () => {
    expect(isSupportTab({ pathname: '/dashboard' })).toBe(false)
    expect(isSupportTab({ pathname: '/impersonate' })).toBe(true)
    expect(isSupportTab({ pathname: '/impersonate/' })).toBe(true)
    writeSession({ token: 't' })
    expect(isSupportTab({ pathname: '/dashboard' })).toBe(true)
  })
})

describe('locale parity', () => {
  it('has the same impersonation keys in es and en, none empty', () => {
    expect(Object.keys(es.impersonation).sort()).toEqual(Object.keys(en.impersonation).sort())
    for (const messages of [es.impersonation, en.impersonation]) {
      for (const value of Object.values(messages)) expect(value).not.toBe('')
    }
  })
})

describe('readBlobBody', () => {
  it('turns a Blob error body (a failed download) into the JSON it carries', async () => {
    const error = { response: { status: 403, data: new Blob([JSON.stringify({ code: 'impersonation_blocked' })]) } }
    await readBlobBody(error)
    expect(isBlockedError(error)).toBe(true)
  })
  it('leaves plain bodies and non-JSON blobs alone', async () => {
    const plain = { response: { status: 403, data: { code: 'x' } } }
    await readBlobBody(plain)
    expect(plain.response.data).toEqual({ code: 'x' })
    const odd = { response: { status: 500, data: new Blob(['oops']) } }
    await readBlobBody(odd)
    expect(odd.response.data).toBeInstanceOf(Blob)
    await expect(readBlobBody(null)).resolves.toBeNull()
  })
})
