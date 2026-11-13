import { defineStore } from 'pinia'
import BudgetService from '../services/BudgetService'

/** The budget of the active event: summary (totals by category) and the items with their payments. */
export const useBudgetStore = defineStore('budgetStore', {
  state: () => ({ summary: null, items: [], loading: false }),

  actions: {
    async fetch(eventId) {
      this.loading = true
      try {
        const [summary, items] = await Promise.all([BudgetService.summary(eventId), BudgetService.items(eventId)])
        this.summary = summary
        this.items = items
      } finally {
        this.loading = false
      }
    },

    /** Only the summary: the dashboard does not need the items. */
    async fetchSummary(eventId) {
      this.summary = await BudgetService.summary(eventId)
    },

    /** After any change the totals are read again from the server: the math lives there. */
    async refresh(eventId) {
      await this.fetch(eventId)
    },

    reset() {
      this.summary = null
      this.items = []
    }
  }
})
