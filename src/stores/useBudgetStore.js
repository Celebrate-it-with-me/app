import { defineStore } from 'pinia'
import BudgetService from '../services/BudgetService'
import { useEventsStore } from './useEventsStore'

export const useBudgetStore = defineStore('budgetStore', {
  state: () => ({
    budgetItems: [],
    budgetSummary: null,
    loading: false,
    error: null
  }),
  actions: {
    /**
     * Load budget items for the active event
     * @returns {Promise<Object>} API response or error object
     */
    async loadBudgetItems() {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent) {
        return {
          status: 400,
          message: 'No active event selected'
        }
      }

      this.loading = true
      this.error = null

      try {
        const response = await BudgetService.getBudgetItems(eventsStore.activeEvent.id)

        if (response.status === 200) {
          const { data } = response
          this.budgetItems = data.data?.budgetItems ?? []
        }

        this.loading = false
        return response
      } catch (error) {
        console.error('Error loading budget items:', error)
        this.error = error.message || 'An unexpected error occurred'
        this.loading = false

        return {
          status: error.response?.status || 500,
          message: this.error
        }
      }
    },

    /**
     * Load budget summary for the active event
     * @returns {Promise<Object>} API response or error object
     */
    async loadBudgetSummary() {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent) {
        return {
          status: 400,
          message: 'No active event selected'
        }
      }

      try {
        const response = await BudgetService.getBudgetSummary(eventsStore.activeEvent.id)

        if (response.status === 200) {
          const { data } = response
          this.budgetSummary = data.data?.budgetSummary ?? null
        }

        return response
      } catch (error) {
        console.error('Error loading budget summary:', error)

        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Create a new budget item
     * @param {Object} budgetItemData - The budget item data
     * @returns {Promise<Object>} API response or error object
     */
    async createBudgetItem(budgetItemData) {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent) {
        return {
          status: 400,
          message: 'No active event selected'
        }
      }

      try {
        const response = await BudgetService.createBudgetItem(
          eventsStore.activeEvent.id,
          budgetItemData
        )

        if (response.status === 201) {
          // Reload budget items to get the updated list
          await this.loadBudgetItems()
          await this.loadBudgetSummary()
        }

        return response
      } catch (error) {
        console.error('Error creating budget item:', error)

        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Update a budget item
     * @param {string|number} itemId - The ID of the budget item
     * @param {Object} budgetItemData - The updated budget item data
     * @returns {Promise<Object>} API response or error object
     */
    async updateBudgetItem(itemId, budgetItemData) {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent) {
        return {
          status: 400,
          message: 'No active event selected'
        }
      }

      try {
        const response = await BudgetService.updateBudgetItem(
          eventsStore.activeEvent.id,
          itemId,
          budgetItemData
        )

        if (response.status === 200) {
          // Reload budget items to get the updated list
          await this.loadBudgetItems()
          await this.loadBudgetSummary()
        }

        return response
      } catch (error) {
        console.error('Error updating budget item:', error)

        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Delete a budget item
     * @param {string|number} itemId - The ID of the budget item
     * @returns {Promise<Object>} API response or error object
     */
    async deleteBudgetItem(itemId) {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent) {
        return {
          status: 400,
          message: 'No active event selected'
        }
      }

      try {
        const response = await BudgetService.deleteBudgetItem(
          eventsStore.activeEvent.id,
          itemId
        )

        if (response.status === 200) {
          // Reload budget items to get the updated list
          await this.loadBudgetItems()
          await this.loadBudgetSummary()
        }

        return response
      } catch (error) {
        console.error('Error deleting budget item:', error)

        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    },

    /**
     * Mark a budget item as paid
     * @param {string|number} itemId - The ID of the budget item
     * @returns {Promise<Object>} API response or error object
     */
    async markBudgetItemAsPaid(itemId) {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent) {
        return {
          status: 400,
          message: 'No active event selected'
        }
      }

      try {
        const response = await BudgetService.markBudgetItemAsPaid(
          eventsStore.activeEvent.id,
          itemId
        )

        if (response.status === 200) {
          // Reload budget items to get the updated list
          await this.loadBudgetItems()
          await this.loadBudgetSummary()
        }

        return response
      } catch (error) {
        console.error('Error marking budget item as paid:', error)

        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    }
  },
  getters: {
    /**
     * Get total estimated cost
     * @returns {number} Total estimated cost
     */
    totalEstimatedCost: (state) => {
      return state.budgetItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
    },

    /**
     * Get total actual cost
     * @returns {number} Total actual cost
     */
    totalActualCost: (state) => {
      return state.budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0)
    },

    /**
     * Get total paid amount
     * @returns {number} Total paid amount
     */
    totalPaid: (state) => {
      return state.budgetItems
        .filter(item => item.paid)
        .reduce((sum, item) => sum + (item.actualCost || 0), 0)
    },

    /**
     * Get total remaining amount
     * @returns {number} Total remaining amount
     */
    totalRemaining: (state, getters) => {
      return getters.totalActualCost - getters.totalPaid
    },

    /**
     * Get budget status
     * @returns {Object} Budget status object with status and class
     */
    budgetStatus: (state, getters) => {
      const diff = getters.totalEstimatedCost - getters.totalActualCost
      if (diff > 0) return { status: 'Under Budget', class: 'text-green-500' }
      if (diff < 0) return { status: 'Over Budget', class: 'text-red-500' }
      return { status: 'On Budget', class: 'text-blue-500' }
    },

    /**
     * Check if there are any budget items
     * @returns {boolean} True if there are budget items
     */
    hasBudgetItems: (state) => {
      return state.budgetItems.length > 0
    }
  }
})
