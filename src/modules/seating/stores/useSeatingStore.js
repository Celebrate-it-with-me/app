import { defineStore } from 'pinia'
import SeatingService from '@/modules/seating/services/SeatingService'
import { indexGuests } from '@/modules/seating/utils/seating'
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
    /** Every guest the screen knows (seated and not), by id: lets rows say whose companion someone is. */
    guestIndex: state => indexGuests(state.unassigned, ...state.tables.map(t => t.assigned_guests)),
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
      const response = await SeatingService.deleteTable({ eventId: currentEventId(), tableId })
      if (this.selectedTableId === tableId) this.selectedTableId = null
      await this.refresh()
      return Number(response?.data?.meta?.guests_unassigned) || 0
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
    },

    async moveGuest(guestId, toTableId) {
      try {
        await SeatingService.moveGuest({ eventId: currentEventId(), guestId, toTableId })
      } finally {
        // Success or not, show what the server has.
        await this.refresh().catch(() => {})
      }
    },

    /** Seats `guestIds` at one table. Returns `{ seated, failed }` counts read from the API answer. */
    async bulkAssign(tableId, guestIds) {
      let response
      try {
        response = await SeatingService.bulkAssign({
          eventId: currentEventId(),
          assignments: [{ table_id: tableId, guest_ids: guestIds }]
        })
      } finally {
        await this.refresh().catch(() => {})
      }
      const meta = response?.data?.meta || {}
      const seated = Number(meta.total_assigned ?? meta.assigned ?? 0)
      const failed = Number(meta.total_skipped ?? (Array.isArray(meta.errors) ? meta.errors.length : meta.failed) ?? 0)
      return { seated, failed }
    },

    /** Unseats everybody. Returns how many guests lost their seat. */
    async clearAll() {
      const response = await SeatingService.clearAll({ eventId: currentEventId() })
      await this.refresh()
      return Number(response?.data?.meta?.guests_unassigned) || 0
    }
  }
})
