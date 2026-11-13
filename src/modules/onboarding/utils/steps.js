/** The four first steps, in order. `id` doubles as the i18n key under app.start.steps. */
export const STEP_IDS = ['event', 'guests', 'details', 'share']

export const DETAIL_LINKS = [
  { key: 'program', to: '/dashboard/timeline' },
  { key: 'places', to: '/dashboard/locations' },
  { key: 'dressCode', to: '/dashboard/dress-code' }
]

/** Empty progress, shown before the API answers. */
export const emptyProgress = () => ({
  steps: { event: true, guests: false, details: false, share: false },
  done: 1,
  total: 4,
  guests: 0,
  details: { program: false, places: false, dressCode: false },
  status: 'draft',
  stage: 'invitation'
})

/** Fills any missing piece of the API payload so the screen never reads undefined. */
export function normalizeProgress(data) {
  const base = emptyProgress()
  const steps = { ...base.steps, ...(data?.steps ?? {}), event: true }
  return {
    steps,
    done: STEP_IDS.filter(id => steps[id]).length,
    total: STEP_IDS.length,
    guests: data?.guests ?? 0,
    details: { ...base.details, ...(data?.details ?? {}) },
    status: data?.status ?? base.status,
    stage: data?.stage ?? base.stage
  }
}

/** Cards for the screen: `[{ id, done }]`. */
export function stepCards(progress) {
  return STEP_IDS.map(id => ({ id, done: !!progress.steps[id] }))
}

export const allDone = progress => STEP_IDS.every(id => progress.steps[id])

/** What the share step shows: nothing live yet, the Save the date only, or the full invitation. */
export function shareState(progress) {
  if (progress.status !== 'published') return 'none'
  return progress.stage === 'save_the_date' ? 'saveTheDate' : 'invitation'
}

/** First word of a full name ("Marisol Peña" → "Marisol"); '' when there is none. */
export function firstName(name) {
  return String(name ?? '').trim().split(/\s+/)[0] ?? ''
}
