import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import SaveTheDatePreview from '../components/SaveTheDatePreview.vue'

const make = (props = {}) =>
  mount(SaveTheDatePreview, {
    props: { eventName: 'Los XV de Valentina', dateLabel: 'Sábado, 2 de enero de 2027', target: new Date('2027-01-02T20:00:00Z'), message: '', showCountdown: true, showCalendar: true, ...props },
    global: { plugins: [i18n] }
  })

beforeEach(() => {
  setLocale('es')
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2027-01-01T08:30:00Z'))
})
afterEach(() => vi.useRealTimers())

describe('SaveTheDatePreview', () => {
  it('draws the name, the date and a placeholder while the message is empty', () => {
    const w = make()
    expect(w.get('[data-testid="std-preview-name"]').text()).toBe('Los XV de Valentina')
    expect(w.text()).toContain('Sábado, 2 de enero de 2027')
    expect(w.get('[data-testid="std-preview-message"]').text()).toBe('Tu mensaje aparecerá aquí')
  })

  it('follows the message as it changes', async () => {
    const w = make()
    await w.setProps({ message: '  Los esperamos  ' })
    expect(w.get('[data-testid="std-preview-message"]').text()).toBe('Los esperamos')
  })

  it('shows or hides the countdown and the calendar pill with the switches', async () => {
    const w = make()
    expect(w.find('[data-testid="std-preview-countdown"]').exists()).toBe(true)
    expect(w.find('[data-testid="std-preview-calendar"]').exists()).toBe(true)
    await w.setProps({ showCountdown: false, showCalendar: false })
    expect(w.find('[data-testid="std-preview-countdown"]').exists()).toBe(false)
    expect(w.find('[data-testid="std-preview-calendar"]').exists()).toBe(false)
  })

  it('counts down to the event and ticks every minute', async () => {
    const w = make()
    const values = () => w.findAll('[data-testid="std-preview-countdown"] p.text-xl').map(p => p.text())
    expect(values()).toEqual(['1', '11', '30'])
    vi.advanceTimersByTime(60_000)
    await w.vm.$nextTick()
    expect(values()).toEqual(['1', '11', '29'])
  })

  it('clears its timer when unmounted', () => {
    const spy = vi.spyOn(globalThis, 'clearInterval')
    make().unmount()
    expect(spy).toHaveBeenCalled()
  })

  it('shows the inactive badge only when told so, and scales the phone', async () => {
    const w = make({ scale: 0.5 })
    expect(w.find('[data-testid="std-preview-inactive"]').exists()).toBe(false)
    await w.setProps({ inactive: true })
    expect(w.get('[data-testid="std-preview-inactive"]').text()).toBe('No activo · ya publicaste la invitación')
    expect(w.get('[data-testid="std-preview"]').attributes('style')).toContain('width: 135px')
  })

  it('has English copy', () => {
    setLocale('en')
    const w = make({ inactive: true })
    expect(w.text()).toContain('Your message will appear here')
    expect(w.text()).toContain('Not active')
  })
})
