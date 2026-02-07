<template>
  <div class="seating-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="relative mb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <CHeading :level="1" weight="black" class="text-4xl md:text-5xl text-gray-900 dark:text-white tracking-tight mb-3">
            Seat <span class="text-purple-600 dark:text-purple-400">Accommodation</span>
          </CHeading>
          <p class="text-gray-500 dark:text-gray-400 max-w-xl text-lg leading-relaxed">
            Manage your event's seating arrangements by creating tables and assigning guests.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Tables Management -->
      <div class="lg:col-span-1">
        <CCard class="mb-6">
          <template #title>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Create Table</h2>
          </template>
          <template #content>
            <form @submit.prevent="createTable">
              <div class="space-y-4">
                <CInput
                  id="table-name"
                  v-model="newTable.name"
                  name="tableName"
                  label="Table Name"
                  placeholder="e.g. VIP Table, Family Table"
                  :show-error="true"
                />
                <CInput
                  id="table-capacity"
                  v-model="newTable.capacity"
                  name="tableCapacity"
                  label="Seating Capacity"
                  type="number"
                  placeholder="e.g. 8"
                  :show-error="true"
                />
                <CButton type="submit" variant="primary" :disabled="!isFormValid">
                  Create Table
                </CButton>
              </div>
            </form>
          </template>
        </CCard>

        <CCard>
          <template #title>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Tables</h2>
          </template>
          <template #content>
            <div v-if="tables.length === 0" class="text-center py-6">
              <p class="text-gray-500 dark:text-gray-400">No tables created yet.</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Create a table to start assigning guests.
              </p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="table in tables"
                :key="table.id"
                class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                :class="{ 'bg-gray-50 dark:bg-gray-800': selectedTable?.id === table.id }"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">{{ table.name }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ table.assignedGuests.length }}/{{ table.capacity }} seats filled
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      class="text-primary hover:text-pink-600 dark:text-primary dark:hover:text-pink-400"
                      @click="selectTable(table)"
                    >
                      <span class="sr-only">Select</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fill-rule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                      @click="editTable(table)"
                    >
                      <span class="sr-only">Edit</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                        />
                      </svg>
                    </button>
                    <button
                      class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      @click="deleteTable(table.id)"
                    >
                      <span class="sr-only">Delete</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </CCard>
      </div>

      <!-- Middle Column: Selected Table Details -->
      <div class="lg:col-span-1">
        <CCard v-if="selectedTable" class="h-full">
          <template #title>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ selectedTable.name }} Details
              </h2>
              <span
                class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              >
                {{ selectedTable.assignedGuests.length }}/{{ selectedTable.capacity }}
              </span>
            </div>
          </template>
          <template #content>
            <div class="space-y-4">
              <div v-if="selectedTable.assignedGuests.length === 0" class="text-center py-6">
                <p class="text-gray-500 dark:text-gray-400">No guests assigned to this table.</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Assign guests from the unassigned guests list.
                </p>
              </div>
              <div v-else>
                <h3 class="font-medium text-gray-900 dark:text-white mb-2">Assigned Guests</h3>
                <div class="space-y-2">
                  <div
                    v-for="guest in selectedTable.assignedGuests"
                    :key="guest.id"
                    class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ guest.name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ guest.seatNumber }}
                      </p>
                      <div class="flex items-center mt-1">
                        <span
                          class="px-2 py-0.5 text-xs rounded-full"
                          :class="{
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300':
                              guest.rsvpStatus === 'confirmed',
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300':
                              guest.rsvpStatus === 'pending',
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300':
                              guest.rsvpStatus === 'declined'
                          }"
                        >
                          {{ guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1) }}
                        </span>
                        <span
                          v-if="guest.isCompanion"
                          class="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        >
                          Companion
                        </span>
                      </div>
                    </div>
                    <button
                      class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      @click="removeGuestFromTable(guest.id)"
                    >
                      <span class="sr-only">Remove</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </CCard>
        <div v-else class="h-full flex items-center justify-center">
          <div class="text-center p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No Table Selected
            </h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              Select a table from the list or create a new one to view and manage its details.
            </p>
          </div>
        </div>
      </div>

      <!-- Right Column: Unassigned Guests -->
      <div class="lg:col-span-1">
        <CCard class="h-full">
          <template #title>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Unassigned Guests</h2>
              <div class="flex space-x-2">
                <button
                  v-for="status in ['all', 'confirmed', 'pending', 'declined']"
                  :key="status"
                  class="px-2 py-1 text-xs rounded-full"
                  :class="{
                    'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white':
                      filterStatus === status,
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400':
                      filterStatus !== status
                  }"
                  @click="filterStatus = status"
                >
                  {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                </button>
              </div>
            </div>
          </template>
          <template #content>
            <div class="mb-4">
              <CInput
                id="search-guests"
                v-model="searchQuery"
                name="searchGuests"
                placeholder="Search guests..."
                :show-error="false"
              >
                <template #icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </template>
              </CInput>
            </div>

            <div v-if="filteredUnassignedGuests.length === 0" class="text-center py-6">
              <p class="text-gray-500 dark:text-gray-400">No unassigned guests found.</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                All guests have been assigned or no guests match your filter.
              </p>
            </div>
            <div v-else class="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              <div
                v-for="guest in filteredUnassignedGuests"
                :key="guest.id"
                class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ guest.name }}
                  </p>
                  <div class="flex items-center mt-1">
                    <span
                      class="px-2 py-0.5 text-xs rounded-full"
                      :class="{
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300':
                          guest.rsvpStatus === 'confirmed',
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300':
                          guest.rsvpStatus === 'pending',
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300':
                          guest.rsvpStatus === 'declined'
                      }"
                    >
                      {{ guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1) }}
                    </span>
                    <span
                      v-if="guest.isCompanion"
                      class="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      Companion
                    </span>
                  </div>
                </div>
                <CButton
                  v-if="
                    selectedTable && selectedTable.assignedGuests.length < selectedTable.capacity
                  "
                  variant="outline"
                  size="sm"
                  @click="assignGuestToTable(guest.id)"
                >
                  Assign
                </CButton>
                <span v-else class="text-xs text-gray-500 dark:text-gray-400">
                  Select a table with space
                </span>
              </div>
            </div>
          </template>
        </CCard>
      </div>
    </div>

    <!-- Edit Table Modal -->
    <CModal v-model="showEditModal" show-close-icon>
      <template #title>Edit Table</template>
      <form @submit.prevent="updateTable">
        <div class="space-y-4">
          <CInput
            id="edit-table-name"
            v-model="editingTable.name"
            name="editTableName"
            label="Table Name"
            placeholder="e.g. VIP Table, Family Table"
            :show-error="true"
          />
          <CInput
            id="edit-table-capacity"
            v-model="editingTable.capacity"
            name="editTableCapacity"
            label="Seating Capacity"
            type="number"
            placeholder="e.g. 8"
            :show-error="true"
          />
          <p
            v-if="parseInt(editingTable.capacity) < editingTable.assignedGuests.length"
            class="text-sm text-red-500"
          >
            Warning: Reducing capacity will not remove assigned guests, but you won't be able to add
            more.
          </p>
        </div>
      </form>
      <template #footer>
        <CButton variant="ghost" @click="showEditModal = false">Cancel</CButton>
        <CButton @click="updateTable">Save Changes</CButton>
      </template>
    </CModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CCard from '@/components/UI/cards/CCard.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CHeading from '@/components/UI/headings/CHeading.vue'
import CModal from '@/components/UI/modals/CModal.vue'

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

// State
const tables = ref([])
const selectedTable = ref(null)
const newTable = ref({ name: '', capacity: '' })
const editingTable = ref({ id: null, name: '', capacity: '', assignedGuests: [] })
const showEditModal = ref(false)
const searchQuery = ref('')
const filterStatus = ref('all')
const nextTableId = ref(1)

// Computed properties
const isFormValid = computed(() => {
  return (
    newTable.value.name.trim() !== '' &&
    newTable.value.capacity !== '' &&
    parseInt(newTable.value.capacity) > 0
  )
})

const unassignedGuests = computed(() => {
  // Get all guest IDs that are assigned to tables
  const assignedGuestIds = tables.value.flatMap(table =>
    table.assignedGuests.map(guest => guest.id)
  )

  // Return guests that are not assigned to any table
  return mockGuests.filter(guest => !assignedGuestIds.includes(guest.id))
})

const filteredUnassignedGuests = computed(() => {
  let filtered = unassignedGuests.value

  // Apply search filter
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(guest => guest.name.toLowerCase().includes(query))
  }

  // Apply status filter
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(guest => guest.rsvpStatus === filterStatus.value)
  }

  return filtered
})

// Methods
const createTable = () => {
  if (!isFormValid.value) return

  const table = {
    id: nextTableId.value++,
    name: newTable.value.name,
    capacity: parseInt(newTable.value.capacity),
    assignedGuests: []
  }

  tables.value.push(table)
  newTable.value = { name: '', capacity: '' }

  // Select the newly created table
  selectTable(table)
}

const selectTable = table => {
  selectedTable.value = table
}

const editTable = table => {
  editingTable.value = { ...table }
  showEditModal.value = true
}

const updateTable = () => {
  if (
    editingTable.value.name.trim() === '' ||
    editingTable.value.capacity === '' ||
    parseInt(editingTable.value.capacity) <= 0
  ) {
    return
  }

  const index = tables.value.findIndex(t => t.id === editingTable.value.id)
  if (index !== -1) {
    const oldName = tables.value[index].name
    const newName = editingTable.value.name
    const nameChanged = oldName !== newName

    // Update the table properties
    tables.value[index] = {
      ...tables.value[index],
      name: newName,
      capacity: parseInt(editingTable.value.capacity)
    }

    // If the table name changed, update all seat numbers
    if (nameChanged && tables.value[index].assignedGuests.length > 0) {
      tables.value[index].assignedGuests = tables.value[index].assignedGuests.map((guest, idx) => {
        return {
          ...guest,
          seatNumber: `${newName} - s ${idx + 1}`
        }
      })
    }

    // Update selected table if it's the one being edited
    if (selectedTable.value && selectedTable.value.id === editingTable.value.id) {
      selectedTable.value = tables.value[index]
    }
  }

  showEditModal.value = false
}

const deleteTable = tableId => {
  // Find the table to delete
  const tableToDelete = tables.value.find(t => t.id === tableId)

  // If the table has assigned guests, move them back to unassigned
  // (In a real app, this would be handled by the store)

  // Remove the table
  tables.value = tables.value.filter(t => t.id !== tableId)

  // If the deleted table was selected, clear the selection
  if (selectedTable.value && selectedTable.value.id === tableId) {
    selectedTable.value = null
  }
}

const assignGuestToTable = guestId => {
  if (!selectedTable.value) return

  // Check if the table has space
  if (selectedTable.value.assignedGuests.length >= selectedTable.value.capacity) {
    return
  }

  // Find the guest
  const guest = mockGuests.find(g => g.id === guestId)
  if (!guest) return

  // Create a copy of the guest with a seat number
  const guestWithSeat = {
    ...guest,
    seatNumber: `${selectedTable.value.name} - s ${selectedTable.value.assignedGuests.length + 1}`
  }

  // Add the guest to the selected table
  const tableIndex = tables.value.findIndex(t => t.id === selectedTable.value.id)
  if (tableIndex !== -1) {
    tables.value[tableIndex].assignedGuests.push(guestWithSeat)
    selectedTable.value = tables.value[tableIndex]
  }
}

const removeGuestFromTable = guestId => {
  if (!selectedTable.value) return

  // Remove the guest from the selected table
  const tableIndex = tables.value.findIndex(t => t.id === selectedTable.value.id)
  if (tableIndex !== -1) {
    // First remove the guest
    tables.value[tableIndex].assignedGuests = tables.value[tableIndex].assignedGuests.filter(
      g => g.id !== guestId
    )

    // Then update seat numbers for all remaining guests
    const tableName = tables.value[tableIndex].name
    tables.value[tableIndex].assignedGuests = tables.value[tableIndex].assignedGuests.map(
      (guest, index) => {
        return {
          ...guest,
          seatNumber: `${tableName} - s ${index + 1}`
        }
      }
    )

    selectedTable.value = tables.value[tableIndex]
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
