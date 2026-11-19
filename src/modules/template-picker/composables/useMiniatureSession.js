import { createIframeSlots } from './useIframeSlots'
import TemplatePickerService from '../services/TemplatePickerService'

/** Key the selector's miniatures find their shared session under (`provide`/`inject`). */
export const MINIATURE_SESSION = Symbol('miniature-session')

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * What the selector's miniatures share while the modal lives: one payload cache (by event, template and language),
 * one request queue that spaces the calls out (the API allows 30 `invitation-preview` calls a minute, shared with the
 * editor) and a small pool of iframe slots. Opening the selector again or coming back from a detail view reuses the
 * cache; a 429 pauses the queue for `cooldown` ms; entries older than `ttl` ms are asked again.
 * `dispose()` drops what is still waiting in the queue (the cache stays for the next opening).
 */
export function createMiniatureSession({ slots = 2, spacing = 400, cooldown = 6000, ttl = 5 * 60 * 1000, now = Date.now } = {}) {
  const cache = new Map() // key -> { payload, at }
  const inflight = new Map() // key -> Promise
  const pool = createIframeSlots(slots)
  let chain = Promise.resolve()
  let lastCall = 0
  let pausedUntil = 0
  let generation = 0

  const keyOf = (eventId, templateId, locale) => `${eventId}:${templateId ?? 'active'}:${locale ?? ''}`

  /** The payload for the template, from the cache or the API. Rejects with the API error (or `{ disposed: true }`). */
  function fetch(eventId, templateId, locale) {
    const key = keyOf(eventId, templateId, locale)
    const hit = cache.get(key)
    if (hit && now() - hit.at < ttl) return Promise.resolve(hit.payload)
    if (inflight.has(key)) return inflight.get(key)

    const mine = generation
    const run = chain.then(async () => {
      if (mine !== generation) throw { disposed: true }
      const delay = Math.max(lastCall + spacing, pausedUntil) - now()
      if (delay > 0) await wait(delay)
      if (mine !== generation) throw { disposed: true }
      lastCall = now()
      try {
        const payload = await TemplatePickerService.preview(eventId, { templateId, locale })
        cache.set(key, { payload, at: now() })
        return payload
      } catch (e) {
        if (e?.response?.status === 429) pausedUntil = now() + cooldown
        throw e
      }
    })
    chain = run.catch(() => {})
    const tracked = run.finally(() => inflight.delete(key))
    inflight.set(key, tracked)
    return tracked
  }

  function dispose() {
    generation++
    inflight.clear()
  }

  return { fetch, dispose, slots: pool, has: (eventId, templateId, locale) => cache.has(keyOf(eventId, templateId, locale)) }
}
