import { defineStore } from 'pinia'
import BudgetService from '../services/BudgetService'
import { useEventsStore } from './useEventsStore'

export const useBudgetStore = defineStore('budgetStore', {
  state: () => ({
    eventBudget: null,
    budgetItems: [],
    loading: false,
    error: null,
    categories: []
  }),
  actions: {
    /**
     * Get event budget for the active event
     * @returns {Promise<Object>} API response or error object
     */
    async getEventBudget() {
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
        const response = await BudgetService.getEventBudget(eventsStore.activeEvent.id)

        if (response.status === 200) {
          const { data } = response
          this.eventBudget = data.data || null
        }

        this.loading = false
        return response
      } catch (error) {
        console.error('Error getting event budget:', error)
        this.error = error.message || 'An unexpected error occurred'
        this.loading = false

        return {
          status: error.response?.status || 500,
          message: this.error
        }
      }
    },

    /**
     * Create event budget with initial budget cap
     * @param {Object} budgetData - The budget data with budget_cap
     * @returns {Promise<Object>} API response or error object
     */
    async createEventBudget(budgetData) {
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
        const response = await BudgetService.createEventBudget(
          eventsStore.activeEvent.id,
          budgetData
        )

        if (response.status === 201) {
          const { data } = response
          this.eventBudget = data.data || null
        }

        this.loading = false
        return response
      } catch (error) {
        console.error('Error creating event budget:', error)
        this.error = error.message || 'An unexpected error occurred'
        this.loading = false

        return {
          status: error.response?.status || 500,
          message: this.error
        }
      }
    },

    /**
     * Load budget items for the active event
     * @returns {Promise<Object>} API response or error object
     */
    async loadBudgetItems() {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent || !this.eventBudget) {
        return {
          status: 400,
          message: 'No active event or event budget selected'
        }
      }

      this.loading = true
      this.error = null

      try {
        const response = await BudgetService.getBudgetItems(
          eventsStore.activeEvent.id,
          this.eventBudget.id
        )

        if (response.status === 200) {
          const { data } = response
          this.budgetItems = data.data?.items || []

          const categorySet = new Set()
          this.budgetItems.forEach(item => {
            if (item.category_id) {
              categorySet.add(item.category_id)
            }
          })
          this.categories = Array.from(categorySet)
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
     * Create a new budget item
     * @param {Object} budgetItemData - The budget item data
     * @returns {Promise<Object>} API response or error object
     */
    async createBudgetItem(budgetItemData) {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent || !this.eventBudget) {
        return {
          status: 400,
          message: 'No active event or event budget selected'
        }
      }

      try {
        const response = await BudgetService.createBudgetItem(
          eventsStore.activeEvent.id,
          this.eventBudget.id,
          budgetItemData
        )

        if (response.status === 201) {
          // Reload budget items to get the updated list
          await this.loadBudgetItems()
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
     * @param {string|number} budgetItemId - The ID of the budget item
     * @param {Object} budgetItemData - The updated budget item data
     * @returns {Promise<Object>} API response or error object
     */
    async updateBudgetItem(budgetItemId, budgetItemData) {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent || !this.eventBudget) {
        return {
          status: 400,
          message: 'No active event or event budget selected'
        }
      }

      try {
        const response = await BudgetService.updateBudgetItem(
          eventsStore.activeEvent.id,
          this.eventBudget.id,
          budgetItemId,
          budgetItemData
        )

        if (response.status === 200) {
          // Reload budget items to get the updated list
          await this.loadBudgetItems()
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
     * @param {string|number} budgetItemId - The ID of the budget item
     * @returns {Promise<Object>} API response or error object
     */
    async deleteBudgetItem(budgetItemId) {
      const eventsStore = useEventsStore()
      if (!eventsStore.activeEvent || !this.eventBudget) {
        return {
          status: 400,
          message: 'No active event or event budget selected'
        }
      }

      try {
        const response = await BudgetService.deleteBudgetItem(
          eventsStore.activeEvent.id,
          this.eventBudget.id,
          budgetItemId
        )

        if (response.status === 200) {
          // Reload budget items to get the updated list
          await this.loadBudgetItems()
        }

        return response
      } catch (error) {
        console.error('Error deleting budget item:', error)

        return {
          status: error.response?.status || 500,
          message: error.message || 'An unexpected error occurred'
        }
      }
    }
  },
  getters: {
    /**
     * Check if event has a budget
     * @returns {boolean} True if event has a budget
     */
    hasEventBudget: (state) => {
      return state.eventBudget !== null
    },

    /**
     * Get budget cap
     * @returns {number} Budget cap
     */
    budgetCap: (state) => {
      return state.eventBudget?.budgetCap || 0
    },

    /**
     * Get total estimated cost
     * @returns {number} Total estimated cost
     */
    totalEstimatedCost: (state) => {
      return state.budgetItems.reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
    },

    /**
     * Get total actual cost
     * @returns {number} Total actual cost
     */
    totalActualCost: (state) => {
      return state.budgetItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0)
    },

    /**
     * Get budget status
     * @returns {Object} Budget status object with status and class
     */
    budgetStatus: (state, getters) => {
      const diff = getters?.budgetCap - getters?.totalActualCost
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
    },

    /**
     * Group budget items by category
     * @returns {Object} Budget items grouped by category
     */
    budgetItemsByCategory: (state) => {
      const grouped = {}

      // Initialize with empty arrays for each category
      state.categories.forEach(categoryId => {
        grouped[categoryId] = []
      })

      // Add "Uncategorized" group
      grouped['uncategorized'] = []

      // Group items by category
      state.budgetItems.forEach(item => {
        if (item.category_id) {
          if (!grouped[item.category_id]) {
            grouped[item.category_id] = []
          }
          grouped[item.category_id].push(item)
        } else {
          grouped['uncategorized'].push(item)
        }
      })

      return grouped
    }
  }
})
