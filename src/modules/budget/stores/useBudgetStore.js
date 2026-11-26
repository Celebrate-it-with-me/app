import { defineStore } from 'pinia'
import BudgetService from '../services/BudgetService'

/** Counts the reads, so an answer that arrives after a newer read (another event picked meanwhile) is dropped. */
let reads = 0

/**
 * The budget of the active event: summary (totals by category) and the items with their payments.
 * The data is tied to its event (`eventId`): reading another event clears it first, and a failed read clears it too, so
 * the amounts of event A are never shown under event B (an owner of A may be a viewer of B).
 */
export const useBudgetStore = defineStore('budgetStore', {
  state: () => ({ summary: null, items: [], loading: false, eventId: null }),

  actions: {
    async fetch(eventId) {
      const read = ++reads
      if (String(this.eventId) !== String(eventId)) this.reset()
      this.loading = true
      try {
        const [summary, items] = await Promise.all([BudgetService.summary(eventId), BudgetService.items(eventId)])
        if (read !== reads) return
        this.summary = summary
        this.items = items
        this.eventId = eventId
      } catch (error) {
        if (read === reads) this.reset()
        throw error
      } finally {
        if (read === reads) this.loading = false
      }
    },

    /** Only the summary: the dashboard does not need the items. */
    async fetchSummary(eventId) {
      const read = ++reads
      if (String(this.eventId) !== String(eventId)) this.reset()
      try {
        const summary = await BudgetService.summary(eventId)
        if (read !== reads) return
        this.summary = summary
        this.eventId = eventId
      } catch (error) {
        if (read === reads) this.reset()
        throw error
      }
    },

    /** After any change the totals are read again from the server: the math lives there. */
    async refresh(eventId) {
      await this.fetch(eventId)
    },

    reset() {
      this.summary = null
      this.items = []
      this.eventId = null
    }
  }
})
