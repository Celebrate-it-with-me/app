import { defineStore } from 'pinia'
import SeatingService from '@/modules/seating/services/SeatingService'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

// Mock data for guests
const mockGuests = [
  { id: 1, name: 'John Smith', rsvpStatus: 'confirmed', isCompanion: false },
  { id: 2, name: 'Jane Doe', rsvpStatus: 'confirmed', isCompanion: false },
  { id: 3, name: 'Michael Johnson', rsvpStatus: 'pending', isCompanion: false },
  { id: 4, name: 'Emily Davis', rsvpStatus: 'confirmed', isCompanion: false },
  { id: 5, name: 'Robert Wilson', rsvpStatus: 'declined', isCompanion: false },
  { id: 6, name: 'Sarah Thompson', rsvpStatus: 'confirmed', isCompanion: false },
  { id: 7, name: 'David Martinez', rsvpStatus: 'pending', isCompanion: false },
  { id: 8, name: 'Jennifer Garcia', rsvpStatus: 'confirmed', isCompanion: false },
  { id: 9, name: 'James Rodriguez', rsvpStatus: 'confirmed', isCompanion: false },
  { id: 10, name: 'Lisa Brown', rsvpStatus: 'declined', isCompanion: false },
  { id: 11, name: 'Daniel Lee', rsvpStatus: 'pending', isCompanion: true },
  { id: 12, name: 'Michelle Clark', rsvpStatus: 'confirmed', isCompanion: true },
  { id: 13, name: 'Christopher Lewis', rsvpStatus: 'confirmed', isCompanion: true },
  { id: 14, name: 'Amanda Walker', rsvpStatus: 'pending', isCompanion: true },
  { id: 15, name: 'Matthew Hall', rsvpStatus: 'declined', isCompanion: true }
]

export const useSeatingStore = defineStore('seatingStore', {
  state: () => ({
    tables: [],
    unassigned: [],
    selectedTable: null,
    searchQuery: '',
    filterStatus: 'all',
    showToast: false,
    toastMessage: ''
  }),

  getters: {
    unassignedGuests: state => {
      const assignedGuestIds = state.tables.flatMap(table =>
        table.assigned_guests?.map(guest => guest.id)
      )
      return mockGuests.filter(guest => !assignedGuestIds.includes(guest.id))
    },

    filteredUnassignedGuests(state) {
      let filtered = this.unassigned

      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(guest => guest.name.toLowerCase().includes(query))
      }

      if (state.filterStatus !== 'all') {
        filtered = filtered.filter(guest => guest.rsvpStatus === state.filterStatus)
      }

      return filtered
    }
  },

  actions: {
    async fetchUnassignedGuests() {
      try {
        const eventStore = useEventsStore()
        const eventId = eventStore.activeEvent?.id || 0
        const response = await SeatingService.getUnassignedGuests(eventId)
        this.unassigned = response.data?.data || []
      } catch (e) {
        this.showNotification('Oops something went wrong, please try again later!')
      }
    },

    showNotification(message) {
      this.toastMessage = message
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 3000)
    },

    async createTable({ name, capacity, type, priority, reserved_for, location }) {
      const table = {
        name,
        capacity: parseInt(capacity),
        type,
        priority,
        reserved_for,
        location,
        assigned_guests: []
      }

      const eventStore = useEventsStore()

      const response = await SeatingService.createTable({
        eventId: eventStore.activeEvent?.id || 0,
        ...table
      })

      if (!response || !response.data) {
        throw new Error('Failed to create table')
      }

      const tableResponse = response.data?.data || {}

      this.tables.push(tableResponse)
      this.selectTable(tableResponse)
      this.showNotification(`Table "${tableResponse.name}" created successfully!`)
      return table
    },

    async loadEventTables() {
      const eventStore = useEventsStore()
      try {
        const response = await SeatingService.loadTables({
          eventId: eventStore.activeEvent.id || 0
        })

        if (response.status === 200) {
          this.tables = response.data.data
        } else {
          this.showNotification('Failed to load tables', 'error')
        }
      } catch (e) {
        this.showNotification('Failed to load tables', 'error')
      }
    },

    selectTable(table) {
      this.selectedTable = table
    },

    async updateTable(tableId, name, capacity, type, priority, reserved_for, location) {
      const index = this.tables.findIndex(t => t.id === tableId)
      if (index !== -1) {
        try {
          const eventStore = useEventsStore()
          const eventId = eventStore.activeEvent?.id || 0
          const response = await SeatingService.updateTable({
            eventId,
            tableId,
            name,
            capacity: parseInt(capacity),
            type,
            priority,
            reserved_for,
            location
          })

          if (response.status === 200) {
            await this.loadEventTables()
            await this.fetchUnassignedGuests()

            const selectedTable = this.tables.find(table => table.id === this.selectedTable.id)

            this.selectTable(selectedTable)
            this.showNotification(`${name} table was updated successfully!`)
          }

          console.log(response)
        } catch (e) {
          this.showNotification('Oops something went wrong, please try again later!')
        }
      }
    },

    async deleteTable(tableId) {
      const eventStore = useEventsStore()
      const eventId = eventStore.activeEvent?.id || 0

      try {
        const response = await SeatingService.deleteTable({
          eventId,
          tableId
        })

        if (response.status === 200) {
          await this.loadEventTables()
          await this.fetchUnassignedGuests()

          const selectedTable = this.tables.find(table => table.id === tableId)

          this.selectTable(selectedTable)
          this.showNotification(`${name} table was deleted successfully!`)
        }

        this.showNotification(`Table deleted successfully!`)
      } catch (error) {
        console.error('Error deleting table:', error)
        this.showNotification(`Failed to delete table. Please try again.`, 'error')
      }
    },

    async assignGuestToTable(guestId) {
      if (!this.selectedTable) return
      if (this.selectedTable.assigned_guests.length >= this.selectedTable.capacity) return

      //const guest = mockGuests.find(g => g.id === guestId)
      const guest = this.unassigned.find(g => g.id === guestId)
      if (!guest) return

      const tableIndex = this.tables.findIndex(t => t.id === this.selectedTable.id)
      if (tableIndex !== -1) {
        try {
          const eventStore = useEventsStore()
          const eventId = eventStore.activeEvent?.id || 0
          const response = await SeatingService.assignGuestToTable({
            eventId,
            guestId,
            tableId: this.selectedTable.id
          })

          if (response.status === 200) {
            await this.loadEventTables()
            await this.fetchUnassignedGuests()

            const selectedTable = this.tables.find(table => table.id === this.selectedTable.id)

            this.selectTable(selectedTable)
            this.showNotification(`${guest.name} assigned to ${this.selectedTable.name}`)
          }

          console.log(response)
        } catch (e) {
          this.showNotification('Oops something went wrong, please try again later!')
        }
      }
    },

    async removeGuestFromTable(guestId) {
      if (!this.selectedTable) return

      const tableIndex = this.tables.findIndex(t => t.id === this.selectedTable.id)
      if (tableIndex !== -1) {
        const guestName = this.tables[tableIndex].assigned_guests.find(g => g.id === guestId)?.name
        const eventStore = useEventsStore()
        const eventId = eventStore.activeEvent?.id || 0

        try {
          const response = await SeatingService.removeGuestFromTable({
            eventId,
            tableId: this.selectedTable.id,
            guestId
          })

          if (response.status === 200) {
            await this.loadEventTables()
            await this.fetchUnassignedGuests()

            const selectedTable = this.tables.find(table => table.id === this.selectedTable.id)

            this.selectTable(selectedTable)
            this.showNotification(`${guestName} was removed from ${this.selectedTable.name}`)
          }

          console.log(response)
        } catch (e) {
          this.showNotification('Oops something went wrong, please try again later!')
        }
      }
    },

    // Helper methods
    getInitials(name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    getProgressColor(table) {
      let percentage = 0

      if (table.assigned_guests?.length) {
        percentage = (table.assigned_guests?.length / table.capacity) * 100
      }

      if (percentage >= 100) return 'bg-gradient-to-r from-pink-500 to-purple-600'
      if (percentage >= 75) return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      if (percentage >= 50) return 'bg-gradient-to-r from-blue-400 to-cyan-500'
      return 'bg-gradient-to-r from-green-400 to-emerald-500'
    }
  }
})
