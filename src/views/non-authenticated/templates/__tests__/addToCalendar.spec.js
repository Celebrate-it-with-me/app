import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const { atcb_action } = vi.hoisted(() => ({ atcb_action: vi.fn() }))
vi.mock('add-to-calendar-button', () => ({ atcb_action }))

import HN from '../habana-nights/SaveTheDate/HNSaveTheDateAddToCalendar.vue'
import OV from '../ocean-vibe/SaveTheDate/OVSaveTheDateAddToCalendar.vue'
import BV from '../butterfly-vision/SaveTheDate/SaveTheDateAddToCalendar.vue'

const buttonStyle = { font: 'serif', fontColor: '#111', bgColor: '#fff', hoverColor: '#c2185b' }

describe.each([
  ['habana-nights', HN],
  ['ocean-vibe', OV],
  ['butterfly-vision', BV]
])('%s add-to-calendar (add-to-calendar-button 3)', (_name, Component) => {
  // Braces on purpose: a function returned from beforeEach is run by vitest as a cleanup hook.
  beforeEach(() => {
    atcb_action.mockReset()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls atcb_action with the calendar config when the button is clicked', async () => {
    atcb_action.mockResolvedValue('ok')
    const wrapper = mount(Component, { props: { buttonStyle } })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(atcb_action).toHaveBeenCalledTimes(1)
    const config = atcb_action.mock.calls[0][0]
    expect(config).toMatchObject({ timeZone: 'America/New_York' })
    expect(config.options).toContain('Google')
  })

  it('handles an asynchronous failure of atcb_action instead of leaving a rejection unhandled', async () => {
    // Replace console.error by hand: vitest's own console handling reports the logged Error as a test failure.
    const original = console.error
    const error = vi.fn()
    console.error = error
    atcb_action.mockImplementation(async () => {
      throw new Error('calendar failed')
    })
    const wrapper = mount(Component, { props: { buttonStyle } })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    console.error = original

    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0][0].message).toBe('calendar failed')
  })
})
