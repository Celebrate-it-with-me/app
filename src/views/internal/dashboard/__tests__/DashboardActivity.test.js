import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardActivity from '../DashboardActivity.vue'
import { activityTone, ACTIVITY_TONES, ACTIVITY_TONE_FALLBACK, readableActivity } from '../dashboardLogic'

const entry = (id, icon, color) => ({ id, type: 'x', message: `Mensaje ${id}`, icon, color, createdAt: 'hace 1 hora' })
const mountActivity = activity => mount(DashboardActivity, { props: { activity }, global: { plugins: [i18n] } })

beforeEach(() => setLocale('es'))

describe('activityTone', () => {
  it('has a tone for every colour the API sends', () => {
    ;['blue', 'pink', 'indigo', 'yellow', 'green', 'cyan', 'orange', 'red'].forEach(c => expect(ACTIVITY_TONES[c]).toBeTruthy())
  })
  it('falls back to a neutral chip for unknown, empty or missing colours', () => {
    ;['paint', '', null, undefined, 42].forEach(c => expect(activityTone(c)).toBe(ACTIVITY_TONE_FALLBACK))
  })
})

describe('readableActivity (ORG-016)', () => {
  it('drops only entries with no text and draws the translated message as the API sends it', () => {
    const items = [{ id: 1, message: 'Actividad registrada.' }, { id: 3, message: '  ' }, { id: 4 }, { id: 5, message: 'Valentina confirmó' }]
    expect(readableActivity(items).map(i => i.id)).toEqual([1, 5])
    expect(readableActivity()).toEqual([])
  })
  it('shows the empty text when nothing readable is left', () => {
    const w = mountActivity([{ id: 1, message: '', icon: 'bell', color: 'blue' }])
    expect(w.text()).toContain('Cuando pase algo en tu evento')
    expect(w.findAll('[data-testid=activity-chip]')).toHaveLength(0)
  })
})

describe('DashboardActivity icons', () => {
  const NEW = [['eye', 'blue'], ['message-circle', 'pink'], ['edit', 'indigo'], ['user-check', 'yellow'], ['music', 'yellow']]

  it('draws an icon in a toned chip for the five new types', () => {
    const w = mountActivity(NEW.map(([icon, color], i) => entry(i, icon, color)))
    const chips = w.findAll('[data-testid=activity-chip]')
    expect(chips).toHaveLength(5)
    chips.forEach((chip, i) => {
      expect(chip.find('svg').exists()).toBe(true)
      expect(chip.classes().join(' ')).toContain(activityTone(NEW[i][1]).split(' ')[0])
    })
    expect(chips[0].find('svg').classes().join(' ')).toContain('lucide-eye')
    expect(chips[2].find('svg').classes().join(' ')).toContain('lucide-pencil')
  })

  it('never leaves a hole or throws for an unknown icon or colour', () => {
    const w = mountActivity([entry(1, 'does-not-exist', 'chartreuse'), entry(2, undefined, undefined)])
    const chips = w.findAll('[data-testid=activity-chip]')
    expect(chips).toHaveLength(2)
    chips.forEach(chip => {
      expect(chip.find('svg').exists()).toBe(true)
      expect(chip.classes().join(' ')).toContain('bg-cream-200')
    })
    expect(w.text()).toContain('Mensaje 1')
  })
})
