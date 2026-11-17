import { describe, it, expect } from 'vitest'
import { enabledProviders, providerName, oauthRedirectUrl, internalRedirect } from '../socialProviders'

describe('socialProviders', () => {
  it('defaults to google and facebook', () => {
    expect(enabledProviders(undefined)).toEqual(['google', 'facebook'])
    expect(enabledProviders('  ')).toEqual(['google', 'facebook'])
  })
  it('parses the list, ignoring unknown, repeated and mixed-case values', () => {
    expect(enabledProviders('Facebook, google ,twitter,facebook')).toEqual(['facebook', 'google'])
    expect(enabledProviders('google')).toEqual(['google'])
    expect(enabledProviders('twitter')).toEqual([])
  })
  it('capitalizes provider names', () => {
    expect(providerName('facebook')).toBe('Facebook')
    expect(providerName('GOOGLE')).toBe('Google')
    expect(providerName(undefined)).toBe('')
  })
  it('builds the redirect URL with an internal redirect only', () => {
    expect(oauthRedirectUrl('google', '/events/3?tab=1', 'http://api/')).toBe('http://api/oauth/google/redirect?redirect=%2Fevents%2F3%3Ftab%3D1')
    expect(oauthRedirectUrl('facebook', '//evil.com', 'http://api/')).toBe('http://api/oauth/facebook/redirect')
    expect(oauthRedirectUrl('facebook', 'https://evil.com', 'http://api/')).toBe('http://api/oauth/facebook/redirect')
    expect(oauthRedirectUrl('facebook', undefined, 'http://api/')).toBe('http://api/oauth/facebook/redirect')
  })
  it('accepts only internal paths from the callback', () => {
    expect(internalRedirect('/dashboard')).toBe('/dashboard')
    for (const bad of ['//evil.com', 'https://evil.com', 'evil.com', '/\\evil.com', 'javascript:alert(1)', '', null, undefined, '/sign-in']) {
      expect(internalRedirect(bad)).toBeUndefined()
    }
  })
})
