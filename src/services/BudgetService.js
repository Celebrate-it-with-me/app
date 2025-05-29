import { CWM_API } from './axios'

class BudgetService {
  /**
   * Get budget items for an event
   * @param {string|number} eventId - The ID of the event
   * @returns {Promise<Object>} API response
   */
  async getBudgetItems(eventId) {
    return CWM_API.get(`event/${eventId}/budget-items`)
  }

  /**
   * Create a new budget item
   * @param {string|number} eventId - The ID of the event
   * @param {Object} budgetItemData - The budget item data
   * @returns {Promise<Object>} API response
   */
  async createBudgetItem(eventId, budgetItemData) {
    return CWM_API.post(`event/${eventId}/budget-items`, budgetItemData)
  }

  /**
   * Update a budget item
   * @param {string|number} eventId - The ID of the event
   * @param {string|number} itemId - The ID of the budget item
   * @param {Object} budgetItemData - The updated budget item data
   * @returns {Promise<Object>} API response
   */
  async updateBudgetItem(eventId, itemId, budgetItemData) {
    return CWM_API.put(`event/${eventId}/budget-items/${itemId}`, budgetItemData)
  }

  /**
   * Delete a budget item
   * @param {string|number} eventId - The ID of the event
   * @param {string|number} itemId - The ID of the budget item
   * @returns {Promise<Object>} API response
   */
  async deleteBudgetItem(eventId, itemId) {
    return CWM_API.delete(`event/${eventId}/budget-items/${itemId}`)
  }

  /**
   * Mark a budget item as paid
   * @param {string|number} eventId - The ID of the event
   * @param {string|number} itemId - The ID of the budget item
   * @returns {Promise<Object>} API response
   */
  async markBudgetItemAsPaid(eventId, itemId) {
    return CWM_API.patch(`event/${eventId}/budget-items/${itemId}/mark-as-paid`)
  }

  /**
   * Get budget summary for an event
   * @param {string|number} eventId - The ID of the event
   * @returns {Promise<Object>} API response
   */
  async getBudgetSummary(eventId) {
    return CWM_API.get(`event/${eventId}/budget-summary`)
  }
}

export default new BudgetService()
