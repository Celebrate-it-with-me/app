import { describe, it, expect } from 'vitest'
import { emptySettings, settingsFromApi, settingsPayload, stageView, timeLeft } from '../utils/stage'

describe('stageView', () => {
  it('offers to publish a draft', () => {
    expect(stageView({ status: 'draft', invitationStage: 'invitation' })).toEqual({ key: 'draft', actions: ['publishSaveTheDate'] })
  })

  it('offers to upgrade or stop a live Save the date', () => {
    expect(stageView({ status: 'published', invitationStage: 'save_the_date' })).toEqual({ key: 'live', actions: ['upgrade', 'unpublish'] })
  })

  it('has nothing to offer once the full invitation is out, or when archived', () => {
    expect(stageView({ status: 'published', invitationStage: 'invitation' })).toEqual({ key: 'invitation', actions: [] })
    expect(stageView({ status: 'archived' })).toEqual({ key: 'archived', actions: [] })
    expect(stageView(null).actions).toEqual([])
  })
})

describe('settings', () => {
  it('fills defaults and sends an empty message as null', () => {
    expect(settingsFromApi(null)).toEqual(emptySettings())
    expect(settingsFromApi({ message: null, showCountdown: false, useAddToCalendar: true })).toEqual({ message: '', showCountdown: false, useAddToCalendar: true })
    expect(settingsPayload({ message: '  ', showCountdown: true, useAddToCalendar: false })).toEqual({ message: null, showCountdown: true, useAddToCalendar: false })
    expect(settingsPayload({ message: ' Hola ', showCountdown: true, useAddToCalendar: true }).message).toBe('Hola')
  })
})

describe('timeLeft', () => {
  const now = new Date(2027, 0, 1, 12, 0, 0)

  it('splits the time left', () => {
    expect(timeLeft(new Date(2027, 0, 3, 13, 2, 5), now)).toEqual({ days: 2, hours: 1, minutes: 2, seconds: 5 })
  })

  it('is zero once the date has passed', () => {
    expect(timeLeft(new Date(2026, 11, 31), now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })
})
