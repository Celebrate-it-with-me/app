import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/modules/template-picker/components/InvitationMiniature.vue', () => ({
  default: { template: '<div data-testid="mini"><slot name="skeleton" /></div>' }
}))

import DashboardPhone from '../DashboardPhone.vue'

describe('DashboardPhone', () => {
  it('is the prototype\'s 190 x 360 phone and hands the miniature a cover-shaped skeleton for while it loads', () => {
    const w = mount(DashboardPhone, { props: { eventId: 7, name: 'Los XV de Valentina' } })
    const phone = w.get('[data-testid=hero-phone]')
    expect(phone.classes()).toEqual(expect.arrayContaining(['w-[190px]', 'h-[360px]']))
    expect(w.find('[data-testid=mini] [data-testid=hero-phone-skeleton]').exists()).toBe(true)
  })
})
