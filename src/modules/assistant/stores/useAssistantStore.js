import { defineStore } from 'pinia'
import AssistantService from '../services/AssistantService'
import { MIN_REFRESH_MS, applyTask, normalizeCustomTask, normalizeNext, normalizePlan, normalizeTask } from '../utils/assistant'

/**
 * The assistant's data for the active event. Reads never throw into the screens: a failure sets the status to
 * `error` (the dashboard card then falls back to `pickNextStep`). Writes throw, so the screen can say what went wrong.
 * Data belongs to one event: switching events drops it.
 */
export const useAssistantStore = defineStore('assistant', {
  state: () => ({
    eventId: null,
    lang: null,
    next: null,
    plan: null,
    /** idle | loading | ready | error */
    nextStatus: 'idle',
    planStatus: 'idle',
    nextFetchedAt: 0,
    /** Keys (task keys or `custom:<id>`) with a request in flight. */
    busy: {}
  }),
  persist: false,
  getters: {
    isBusy: state => key => !!state.busy[key]
  },
  actions: {
    /** Forget everything when the event changes. */
    bind(eventId, lang) {
      if (this.eventId !== eventId) {
        this.$patch({ eventId, next: null, plan: null, nextStatus: 'idle', planStatus: 'idle', nextFetchedAt: 0, busy: {} })
      }
      this.lang = lang ?? this.lang
    },

    async fetchNext({ eventId, lang, force = false } = {}) {
      if (!eventId) return
      this.bind(eventId, lang)
      if (this.nextStatus === 'loading') return
      if (!force && this.nextStatus === 'ready' && Date.now() - this.nextFetchedAt < MIN_REFRESH_MS) return
      const quiet = this.nextStatus === 'ready'
      if (!quiet) this.nextStatus = 'loading'
      this.nextFetchedAt = Date.now()
      try {
        const data = normalizeNext(await AssistantService.next(eventId, this.lang))
        if (this.eventId !== eventId) return
        this.next = data
        this.nextStatus = 'ready'
      } catch {
        if (this.eventId !== eventId) return
        if (!quiet) this.next = null
        this.nextStatus = quiet ? 'ready' : 'error'
      }
    },

    async fetchPlan({ eventId, lang, quiet = false } = {}) {
      if (!eventId) return
      this.bind(eventId, lang)
      if (!quiet) this.planStatus = 'loading'
      try {
        const data = normalizePlan(await AssistantService.plan(eventId, this.lang))
        if (this.eventId !== eventId) return
        this.plan = data
        this.planStatus = 'ready'
      } catch {
        if (this.eventId !== eventId) return
        if (!quiet) this.planStatus = 'error'
      }
    },

    /** After a write: bring progress, order and the dashboard's steps up to date without any spinner. */
    async refresh() {
      const eventId = this.eventId
      await Promise.allSettled([this.fetchPlan({ eventId, quiet: true }), this.fetchNext({ eventId, force: true })])
    },

    async runBusy(key, request) {
      this.busy = { ...this.busy, [key]: true }
      try {
        return await request()
      } finally {
        const rest = { ...this.busy }
        delete rest[key]
        this.busy = rest
      }
    },

    /** `action`: done | snooze | hide | not-applicable | reset. Replaces the task with the server's answer. */
    async actOnTask(key, action, body = {}) {
      const eventId = this.eventId
      const task = await this.runBusy(key, async () => normalizeTask(await AssistantService.act(eventId, key, action, body, this.lang)))
      if (this.eventId === eventId) {
        this.plan = applyTask(this.plan, task)
        this.refresh()
      }
      return task
    },

    async createCustom(body) {
      const eventId = this.eventId
      const item = await this.runBusy('custom:new', async () => normalizeCustomTask(await AssistantService.createCustom(eventId, body)))
      if (this.plan && this.eventId === eventId) this.plan = { ...this.plan, custom: [...this.plan.custom, item] }
      return item
    },

    async updateCustom(id, body) {
      const eventId = this.eventId
      const item = await this.runBusy(`custom:${id}`, async () => normalizeCustomTask(await AssistantService.updateCustom(eventId, id, body)))
      if (this.plan && this.eventId === eventId) this.plan = { ...this.plan, custom: this.plan.custom.map(c => (c.id === id ? item : c)) }
      return item
    },

    async removeCustom(id) {
      const eventId = this.eventId
      await this.runBusy(`custom:${id}`, () => AssistantService.removeCustom(eventId, id))
      if (this.plan && this.eventId === eventId) this.plan = { ...this.plan, custom: this.plan.custom.filter(c => c.id !== id) }
    }
  }
})
