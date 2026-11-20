import { describe, it, expect } from 'vitest'
import { safeCheckoutUrl } from '../utils/checkoutUrl'

const own = 'https://app.quinvite.com'

describe('safeCheckoutUrl', () => {
  it('accepts a Stripe Checkout https URL', () => {
    const url = 'https://checkout.stripe.com/c/pay/cs_test_123#frag'
    expect(safeCheckoutUrl(url, own)).toBe(url)
  })

  it('accepts the own success URL used when the amount is 0', () => {
    expect(safeCheckoutUrl('https://app.quinvite.com/dashboard/events/3/unlock/return?x=1', own))
      .toBe('https://app.quinvite.com/dashboard/events/3/unlock/return?x=1')
    expect(safeCheckoutUrl('/dashboard/events/3/unlock/return', own)).toBe('https://app.quinvite.com/dashboard/events/3/unlock/return')
  })

  it('uses the page origin by default', () => {
    expect(safeCheckoutUrl(`${window.location.origin}/ok`)).toBe(`${window.location.origin}/ok`)
  })

  it.each([
    ['javascript:alert(1)'],
    ['data:text/html,<script>1</script>'],
    ['http://checkout.stripe.com/c/pay/x'],
    ['https://evil.example/c/pay/x'],
    ['https://checkout.stripe.com.evil.example/x'],
    ['https://user:pw@checkout.stripe.com/x'],
    ['https://[bad'],
    [''],
    [null],
    [undefined],
    [42]
  ])('rejects %s', value => {
    expect(safeCheckoutUrl(value, own)).toBeNull()
  })
})
