import { describe, it, expect } from 'vitest'
import { isTrustedResetLink, RESET_LINK_PATH } from '../resetLink'

const API = 'https://api.quinvite.com/'
const ok = `https://api.quinvite.com${RESET_LINK_PATH}?user=1&token=t&expires=1&signature=s`

describe('isTrustedResetLink', () => {
  it('accepts the exact API origin and path and ignores the query', () => {
    expect(isTrustedResetLink(ok, API)).toBe(true)
    expect(isTrustedResetLink(`https://api.quinvite.com${RESET_LINK_PATH}`, 'https://api.quinvite.com')).toBe(true)
  })

  it('accepts a local http API when that is the configured one', () => {
    expect(isTrustedResetLink(`http://dev.api.cwm.com:8080${RESET_LINK_PATH}?a=1`, 'http://dev.api.cwm.com:8080/')).toBe(true)
  })

  it.each([
    ['another host', `https://evil.com${RESET_LINK_PATH}`],
    ['deceptive subdomain', `https://api.quinvite.com.evil.com${RESET_LINK_PATH}`],
    ['userinfo host trick', `https://api.quinvite.com@evil.com${RESET_LINK_PATH}`],
    ['credentials', `https://u:p@api.quinvite.com${RESET_LINK_PATH}`],
    ['username only', `https://u@api.quinvite.com${RESET_LINK_PATH}`],
    ['http downgrade', `http://api.quinvite.com${RESET_LINK_PATH}`],
    ['other port', `https://api.quinvite.com:8443${RESET_LINK_PATH}`],
    ['javascript scheme', 'javascript:alert(1)'],
    ['data scheme', 'data:text/html,<script>1</script>'],
    ['scheme-relative', `//evil.com${RESET_LINK_PATH}`],
    ['relative path', `${RESET_LINK_PATH}?token=t`],
    ['other path', 'https://api.quinvite.com/api/v1/app/logout'],
    ['path suffix', `https://api.quinvite.com${RESET_LINK_PATH}/x`],
    ['path traversal', 'https://api.quinvite.com/api/v1/app/x/../../app/logout'],
    ['fragment', `https://api.quinvite.com${RESET_LINK_PATH}#x`],
    ['backslash host', `https://evil.com\\@api.quinvite.com${RESET_LINK_PATH}`],
    ['malformed', 'http://'],
    ['empty', ''],
    ['not a string', null],
    ['number', 42]
  ])('rejects %s', (_n, link) => {
    expect(isTrustedResetLink(link, API)).toBe(false)
  })

  it('rejects everything when the API url is missing or invalid', () => {
    expect(isTrustedResetLink(ok, '')).toBe(false)
    expect(isTrustedResetLink(ok, undefined)).toBe(false)
    expect(isTrustedResetLink(ok, 'not a url')).toBe(false)
    expect(isTrustedResetLink(ok, 'ftp://api.quinvite.com/')).toBe(false)
  })
})
