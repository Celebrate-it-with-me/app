import { CWM_API } from '@/services/axios'
import { isAssistantMockEnabled } from './mockFlag'

/** `VITE_ASSISTANT_MOCK` swaps the API for an in-memory copy of the contract (see assistantMock.js). Only exactly `1` or `true`, and only in dev. */
const enabled = isAssistantMockEnabled(import.meta.env.VITE_ASSISTANT_MOCK)

/** Resolves the mock, or null. `import.meta.env.DEV` is a build-time constant, so production bundles drop the import and the mock chunk. */
const getMock = async () => (import.meta.env.DEV && enabled ? (await import('./assistantMock')).mockAssistant : null)

const base = eventId => `event/${eventId}/assistant`
const unwrap = response => response.data.data

/** App side of the assistant contract (docs/plans/assistant-contract.md). All answers are `{ data }`; this returns `data`. */
class AssistantService {
  async next(eventId, lang) {
    const mock = await getMock()
    if (mock) return mock.next(lang)
    return unwrap(await CWM_API.get(`${base(eventId)}/next`, { params: lang ? { lang } : {} }))
  }

  async plan(eventId, lang) {
    const mock = await getMock()
    if (mock) return mock.plan(lang)
    return unwrap(await CWM_API.get(`${base(eventId)}/plan`, { params: lang ? { lang } : {} }))
  }

  /** `action`: done | snooze | hide | not-applicable | reset. `snooze` takes `{ days }`. Returns the Task. */
  async act(eventId, key, action, body = {}, lang) {
    const mock = await getMock()
    if (mock) return mock.act(key, action, body, lang)
    const params = lang ? { lang } : {}
    return unwrap(await CWM_API.post(`${base(eventId)}/tasks/${encodeURIComponent(key)}/${action}`, body, { params }))
  }

  /** `{ title, notes?, due_date? }`. 201 CustomTask; 409 `custom_task_limit`; 422 `errors.<field>[0]`. */
  async createCustom(eventId, body) {
    const mock = await getMock()
    if (mock) return mock.createCustom(body)
    return unwrap(await CWM_API.post(`${base(eventId)}/custom-tasks`, body))
  }

  /** `{ title?, notes?, due_date?, done? }`. */
  async updateCustom(eventId, id, body) {
    const mock = await getMock()
    if (mock) return mock.updateCustom(id, body)
    return unwrap(await CWM_API.patch(`${base(eventId)}/custom-tasks/${id}`, body))
  }

  async removeCustom(eventId, id) {
    const mock = await getMock()
    if (mock) return mock.removeCustom(id)
    await CWM_API.delete(`${base(eventId)}/custom-tasks/${id}`)
  }
}

export default new AssistantService()
