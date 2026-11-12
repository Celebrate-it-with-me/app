export const MESSAGE_MAX = 500

/**
 * What the screen offers for the event's publication state. `status`: draft | published | archived;
 * `stage`: save_the_date | invitation (what the public link shows once published).
 */
export function stageView(event) {
  if (!event) return { key: 'none', actions: [] }
  if (event.status === 'archived') return { key: 'archived', actions: [] }
  if (event.status === 'draft') return { key: 'draft', actions: ['publishSaveTheDate'] }
  return event.invitationStage === 'save_the_date'
    ? { key: 'live', actions: ['upgrade', 'unpublish'] }
    : { key: 'invitation', actions: [] }
}

export const emptySettings = () => ({ message: '', showCountdown: true, useAddToCalendar: true })

export const settingsFromApi = data => ({
  message: data?.message ?? '',
  showCountdown: data?.showCountdown ?? true,
  useAddToCalendar: data?.useAddToCalendar ?? true
})

/** The body the API takes: an empty message is sent as null. */
export const settingsPayload = form => ({
  message: form.message.trim() || null,
  showCountdown: !!form.showCountdown,
  useAddToCalendar: !!form.useAddToCalendar
})

/** Time left until `target` as { days, hours, minutes, seconds }, all zero once it has passed. */
export function timeLeft(target, now = new Date()) {
  const ms = Math.max(0, new Date(target).getTime() - now.getTime())
  const total = Math.floor(ms / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60
  }
}
