import { CWM_API } from '@/services/axios'
import { mockAssistant } from './assistantMock'

/** `VITE_ASSISTANT_MOCK` swaps the API for an in-memory copy of the contract (see assistantMock.js). */
const mocked = () => !!import.meta.env.VITE_ASSISTANT_MOCK

const base = eventId => `event/${eventId}/assistant`
const unwrap = response => response.data.data

/** App side of the assistant contract (docs/plans/assistant-contract.md). All answers are `{ data }`; this returns `data`. */
class AssistantService {
  async next(eventId, lang) {
    if (mocked()) return mockAssistant.next(lang)
    return unwrap(await CWM_API.get(`${base(eventId)}/next`, { params: lang ? { lang } : {} }))
  }

  async plan(eventId, lang) {
    if (mocked()) return mockAssistant.plan(lang)
    return unwrap(await CWM_API.get(`${base(eventId)}/plan`, { params: lang ? { lang } : {} }))
  }

  /** `action`: done | snooze | hide | not-applicable | reset. `snooze` takes `{ days }`. Returns the Task. */
  async act(eventId, key, action, body = {}, lang) {
    if (mocked()) return mockAssistant.act(key, action, body, lang)
    const params = lang ? { lang } : {}
    return unwrap(await CWM_API.post(`${base(eventId)}/tasks/${encodeURIComponent(key)}/${action}`, body, { params }))
  }

  /** `{ title, notes?, due_date? }`. 201 CustomTask; 409 `custom_task_limit`; 422 `errors.<field>[0]`. */
  async createCustom(eventId, body) {
    if (mocked()) return mockAssistant.createCustom(body)
    return unwrap(await CWM_API.post(`${base(eventId)}/custom-tasks`, body))
  }

  /** `{ title?, notes?, due_date?, done? }`. */
  async updateCustom(eventId, id, body) {
    if (mocked()) return mockAssistant.updateCustom(id, body)
    return unwrap(await CWM_API.patch(`${base(eventId)}/custom-tasks/${id}`, body))
  }

  async removeCustom(eventId, id) {
    if (mocked()) return mockAssistant.removeCustom(id)
    await CWM_API.delete(`${base(eventId)}/custom-tasks/${id}`)
  }
}

export default new AssistantService()
