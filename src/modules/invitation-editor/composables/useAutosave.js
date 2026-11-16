import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { classify } from '../utils/editorFields'

/**
 * Debounced, serialized autosave of `{ [fieldId]: value }` changes (contract §3.1).
 *
 * - `queue(id, value, { immediate })` keeps the latest value per field; text waits `debounceMs`, choices and switches go now.
 * - One request at a time; edits made while it flies go in the next one (last write wins per field).
 * - A network error or a 5xx keeps the changes and retries with a growing delay (and again when the browser is back online).
 *   Changes live only in memory, never in localStorage.
 * - A 422 is not retried: the fields the API names are dropped from the batch and reported to `onRejected`, the rest is resent.
 * - A 403 plan_required / 409 template_locked are reported (`onPlanRequired`, `onTemplateLocked`) and the batch is dropped.
 * - An archived event (422 status), a forbidden role (403), 404 field_not_found and 409 package_no_cover_field are not retried either:
 *   they go to `onFailed(kind)` so the screen can say exactly that.
 *
 * `status`: 'idle' | 'saving' | 'saved' | 'offline' (retrying) | 'error' (gave up, `retryNow()` tries again).
 */
export function useAutosave({
  save,
  fieldIds = () => [],
  debounceMs = 600,
  retryDelays = [1000, 3000, 8000],
  onSaved = () => {},
  onRejected = () => {},
  onPlanRequired = () => {},
  onTemplateLocked = () => {},
  onFailed = () => {},
  errorsFrom
} = {}) {
  const status = ref('idle')
  const lastSavedAt = ref(null)
  /** Per field: 'saving' | 'saved' | 'error' */
  const fieldState = reactive({})
  const pending = new Map()
  let inFlight = null
  let timer = null
  let retryTimer = null
  let wake = null
  let attempts = 0
  let gaveUp = false
  const dirtyIds = reactive(new Set())

  const hasPending = computed(() => dirtyIds.size > 0)

  function queue(id, value, { immediate = false } = {}) {
    pending.set(id, value)
    dirtyIds.add(id)
    fieldState[id] = 'saving'
    if (status.value !== 'offline' && status.value !== 'error') status.value = 'saving'
    clearTimeout(timer)
    timer = setTimeout(flush, immediate ? 0 : debounceMs)
  }

  /** The field has edits not yet confirmed by the API (waiting, or in the request that is flying). */
  function isDirty(id) {
    return dirtyIds.has(id)
  }

  function drop(ids) {
    for (const id of ids) {
      if (!pending.has(id)) dirtyIds.delete(id)
    }
  }

  async function flush() {
    clearTimeout(timer)
    timer = null
    if (inFlight) return inFlight
    if (!pending.size) return
    const batch = new Map(pending)
    pending.clear()
    const run = (async () => {
      let body = Object.fromEntries(batch)
      while (true) {
        try {
          const result = await save(body)
          attempts = 0
          gaveUp = false
          for (const id of Object.keys(body)) fieldState[id] = pending.has(id) ? 'saving' : 'saved'
          drop(Object.keys(body))
          lastSavedAt.value = result?.savedAt ?? new Date().toISOString()
          status.value = pending.size ? 'saving' : 'saved'
          onSaved(result, Object.keys(body))
          return
        } catch (error) {
          const kind = classify(error)
          const ids = Object.keys(body)
          if (kind === 'validation') {
            const rejected = errorsFrom ? errorsFrom(error, fieldIds()) : {}
            const bad = Object.keys(rejected).filter(id => ids.includes(id))
            for (const id of bad) fieldState[id] = 'error'
            drop(bad)
            onRejected(rejected, error)
            const rest = ids.filter(id => !bad.includes(id))
            if (!bad.length || !rest.length) {
              for (const id of rest) fieldState[id] = 'error'
              drop(rest)
              status.value = pending.size ? 'saving' : bad.length ? 'idle' : 'error'
              return
            }
            body = Object.fromEntries(rest.map(id => [id, body[id]]))
            continue
          }
          if (kind === 'plan' || kind === 'locked') {
            for (const id of ids) fieldState[id] = 'error'
            drop(ids)
            status.value = pending.size ? 'saving' : 'idle'
            if (kind === 'plan') onPlanRequired(ids, error)
            else onTemplateLocked(error)
            return
          }
          if (kind === 'other' || kind === 'archived' || kind === 'forbidden' || kind === 'notfound' || kind === 'nocover') {
            for (const id of ids) fieldState[id] = 'error'
            drop(ids)
            status.value = 'error'
            if (kind !== 'other') onFailed(kind, ids, error)
            return
          }
          // network / server: keep the batch (newer edits win) and retry
          for (const [id, value] of Object.entries(body)) if (!pending.has(id)) pending.set(id, value)
          const delay = retryDelays[attempts]
          attempts += 1
          if (delay === undefined) {
            gaveUp = true
            status.value = 'error'
            return
          }
          status.value = kind === 'network' ? 'offline' : 'saving'
          // Waits (without blocking new edits) and loops again with whatever is pending then.
          await new Promise(resolve => {
            wake = resolve
            retryTimer = setTimeout(resolve, delay)
          })
          wake = null
          retryTimer = null
          if (!pending.size) return
          body = Object.fromEntries(pending)
          pending.clear()
        }
      }
    })()
    inFlight = run
    try {
      await run
    } finally {
      inFlight = null
      if (pending.size && !gaveUp && !timer) timer = setTimeout(flush, 0)
    }
  }

  /** Try again now (after giving up, or when the browser comes back online). */
  function retryNow() {
    clearTimeout(retryTimer)
    wake?.()
    attempts = 0
    gaveUp = false
    if (status.value === 'error' || status.value === 'offline') status.value = pending.size ? 'saving' : 'idle'
    return flush()
  }

  function onOnline() {
    if (pending.size || status.value === 'offline' || status.value === 'error') retryNow()
  }
  function beforeUnload(event) {
    if (hasPending.value || inFlight) {
      event.preventDefault()
      event.returnValue = ''
    }
  }

  onMounted(() => {
    window.addEventListener('online', onOnline)
    window.addEventListener('beforeunload', beforeUnload)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('beforeunload', beforeUnload)
    clearTimeout(timer)
    // Best effort: whatever was typed goes out before the screen goes away.
    if (pending.size && !inFlight) flush()
    clearTimeout(retryTimer)
    wake?.()
  })

  return { status, lastSavedAt, fieldState, hasPending, queue, isDirty, flush, retryNow }
}
