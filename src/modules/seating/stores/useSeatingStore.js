import { defineStore } from 'pinia'
import SeatingService from '@/modules/seating/services/SeatingService'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const currentEventId = () => useEventsStore().activeEvent?.id || 0

/**
 * Pure data store: actions reload state and throw on API errors.
 * User feedback (toasts, i18n) lives in useSeatingController.
 */
export const useSeatingStore = defineStore('seatingStore', {
  state: () => ({
    tables: [],
    unassigned: [],
    selectedTableId: null
  }),

  getters: {
    selectedTable: state => state.tables.find(t => t.id === state.selectedTableId) || null
  },

  actions: {
    selectTable(table) {
      this.selectedTableId = table?.id ?? null
    },

    async loadEventTables() {
      const response = await SeatingService.loadTables({ eventId: currentEventId() })
      this.tables = response.data?.data || []
      if (this.selectedTableId && !this.tables.some(t => t.id === this.selectedTableId)) {
        this.selectedTableId = null
      }
    },

    async fetchUnassignedGuests() {
      const response = await SeatingService.getUnassignedGuests(currentEventId())
      this.unassigned = response.data?.data || []
    },

    async refresh() {
      await this.loadEventTables()
      await this.fetchUnassignedGuests()
    },

    async createTable(payload) {
      const response = await SeatingService.createTable({ eventId: currentEventId(), ...payload })
      const table = response?.data?.data
      if (!table) throw new Error('Failed to create table')
      this.tables.push(table)
      this.selectTable(table)
      return table
    },

    async updateTable(tableId, payload) {
      await SeatingService.updateTable({ eventId: currentEventId(), tableId, ...payload })
      await this.refresh()
    },

    async deleteTable(tableId) {
      await SeatingService.deleteTable({ eventId: currentEventId(), tableId })
      if (this.selectedTableId === tableId) this.selectedTableId = null
      await this.refresh()
    },

    async assignGuestToTable(guestId, tableId = this.selectedTableId) {
      if (!tableId) return
      await SeatingService.assignGuestToTable({ eventId: currentEventId(), guestId, tableId })
      await this.refresh()
    },

    async removeGuestFromTable(guestId, tableId = this.selectedTableId) {
      if (!tableId) return
      await SeatingService.removeGuestFromTable({ eventId: currentEventId(), tableId, guestId })
      await this.refresh()
    }
  }
})
