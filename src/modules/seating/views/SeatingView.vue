<template>
  <div class="seating-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="relative mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Seat
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
            >
              Accommodation
            </span>
          </h1>
          <p class="text-gray-500 font-medium">
            Manage your event's seating arrangements by creating tables and assigning guests
          </p>
        </div>
      </div>
    </div>

    <!-- Tables List - Full Width -->
    <div class="mb-4">
      <SeatingTablesList @edit="openEditModal" @delete="openDeleteModal" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Left Column: Create Table -->
      <div class="lg:col-span-1">
        <SeatingCreateTable />
      </div>

      <!-- Middle Column: Selected Table Details -->
      <div class="lg:col-span-1">
        <SeatingTableDetails @remove-guest="openRemoveGuestModal" />
      </div>

      <!-- Right Column: Unassigned Guests -->
      <div class="lg:col-span-1">
        <SeatingUnassignedGuests />
      </div>
    </div>

    <!-- Modals -->
    <SeatingEditTableModal
      v-model="showEditModal"
      :table="editingTable"
      @update:table="editingTable = $event"
    />

    <SeatingDeleteTableModal v-model="showDeleteModal" :table="tableToDelete" />

    <SeatingRemoveGuestModal v-model="showRemoveGuestModal" :guest="guestToRemove" />

    <!-- Toast Notification -->
    <SeatingToast />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import SeatingCreateTable from '@/modules/seating/components/SeatingCreateTable.vue'
import SeatingTablesList from '@/modules/seating/components/SeatingTablesList.vue'
import SeatingTableDetails from '@/modules/seating/components/SeatingTableDetails.vue'
import SeatingUnassignedGuests from '@/modules/seating/components/SeatingUnassignedGuests.vue'
import SeatingEditTableModal from '@/modules/seating/components/SeatingEditTableModal.vue'
import SeatingDeleteTableModal from '@/modules/seating/components/SeatingDeleteTableModal.vue'
import SeatingRemoveGuestModal from '@/modules/seating/components/SeatingRemoveGuestModal.vue'
import SeatingToast from '@/modules/seating/components/SeatingToast.vue'
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'

const seatingStore = useSeatingStore()

// Modal state
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showRemoveGuestModal = ref(false)

const editingTable = ref({ id: null, name: '', capacity: '', assignedGuests: [] })
const tableToDelete = ref(null)
const guestToRemove = ref(null)

const openEditModal = table => {
  editingTable.value = { ...table }
  showEditModal.value = true
}

const openDeleteModal = table => {
  tableToDelete.value = table
  showDeleteModal.value = true
}

const openRemoveGuestModal = guest => {
  guestToRemove.value = guest
  showRemoveGuestModal.value = true
}

onMounted(async () => {
  await seatingStore.loadEventTables()
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4a5568;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
