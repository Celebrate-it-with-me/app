import { CWM_API } from '@/services/axios'

class BudgetService {
  /**
   * Get event budget information
   * @param {string|number} eventId - The ID of the event
   * @returns {Promise<Object>} API response
   */
  async getEventBudget(eventId) {
    return CWM_API.get(`/event/${eventId}/budget`)
  }

  /**
   * Create event budget with initial budget cap
   * @param {string|number} eventId - The ID of the event
   * @param {Object} budgetData - The budget data with budget_cap
   * @returns {Promise<Object>} API response
   */
  async createEventBudget(eventId, budgetData) {
    return CWM_API.post(`/event/${eventId}/budget`, budgetData)
  }

  async updateEventBudget(eventId, eventBudgetId, budgetData) {
    return CWM_API.put(`/event/${eventId}/budget/${eventBudgetId}`, budgetData)
  }

  /**
   * Get budget items for an event budget
   * @param {string|number} eventId - The ID of the event
   * @param {string|number} eventBudgetId - The ID of the event budget
   * @returns {Promise<Object>} API response
   */
  async getBudgetItems(eventId, eventBudgetId) {
    return CWM_API.get(`/event/${eventId}/budget/${eventBudgetId}/items`)
  }

  /**
   * Create a new budget item
   * @param {string|number} eventId - The ID of the event
   * @param {string|number} eventBudgetId - The ID of the event budget
   * @param {Object} budgetItemData - The budget item data
   * @returns {Promise<Object>} API response
   */
  async createBudgetItem(eventId, eventBudgetId, budgetItemData) {
    return CWM_API.post(`/event/${eventId}/budget/${eventBudgetId}/items`, budgetItemData)
  }

  /**
   * Update a budget item
   * @param {string|number} eventId - The ID of the event
   * @param {string|number} eventBudgetId - The ID of the event budget
   * @param {string|number} budgetItemId - The ID of the budget item
   * @param {Object} budgetItemData - The updated budget item data
   * @returns {Promise<Object>} API response
   */
  async updateBudgetItem(eventId, eventBudgetId, budgetItemId, budgetItemData) {
    return CWM_API.put(
      `/event/${eventId}/budget/${eventBudgetId}/items/${budgetItemId}`,
      budgetItemData
    )
  }

  /**
   * Delete a budget item
   * @param {string|number} eventId - The ID of the event
   * @param {string|number} eventBudgetId - The ID of the event budget
   * @param {string|number} budgetItemId - The ID of the budget item
   * @returns {Promise<Object>} API response
   */
  async deleteBudgetItem(eventId, eventBudgetId, budgetItemId) {
    return CWM_API.delete(`/event/${eventId}/budget/${eventBudgetId}/items/${budgetItemId}`)
  }
}

export default new BudgetService()
