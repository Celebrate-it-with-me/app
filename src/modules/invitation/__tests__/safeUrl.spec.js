import { describe, it, expect } from 'vitest'
import { safeHttpsUrl } from '../composables/safeUrl'

describe('safeHttpsUrl', () => {
  it('keeps https links', () => {
    expect(safeHttpsUrl('https://maps.google.com/?q=a')).toBe('https://maps.google.com/?q=a')
  })

  it.each(['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', 'http://x.com', '//x.com', '/relative', 'webcal://x.com/a.ics', '', null, undefined, 5])('rejects %s', value => {
    expect(safeHttpsUrl(value)).toBeNull()
  })
})
