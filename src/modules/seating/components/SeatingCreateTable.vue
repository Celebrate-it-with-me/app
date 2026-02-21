<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import { computed, ref } from 'vue'
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'

const seatingStore = useSeatingStore()

const newTable = ref({
  name: '',
  capacity: '',
  type: 'general',
  priority: 5,
  reserved_for: '',
  location: null
})

// Options for dropdowns
const tableTypeOptions = [
  { label: 'VIP', value: 'vip' },
  { label: 'Family', value: 'family' },
  { label: 'Friends', value: 'friends' },
  { label: 'General', value: 'general' }
]

const locationOptions = [
  { label: 'Front', value: 'front' },
  { label: 'Center', value: 'center' },
  { label: 'Back', value: 'back' },
  { label: 'Side', value: 'side' },
  { label: 'Entrance', value: 'entrance' }
]

const isFormValid = computed(() => {
  return (
    newTable.value.name.trim() !== '' &&
    newTable.value.capacity !== '' &&
    parseInt(newTable.value.capacity) > 0 &&
    newTable.value.type !== ''
  )
})

const createTable = async () => {
  if (!isFormValid.value) return

  await seatingStore.createTable({
    name: newTable.value.name,
    capacity: parseInt(newTable.value.capacity),
    type: newTable.value.type,
    priority: newTable.value.priority,
    reserved_for: newTable.value.reserved_for || null,
    location: newTable.value.location
  })

  // Reset form
  newTable.value = {
    name: '',
    capacity: '',
    type: 'general',
    priority: 5,
    reserved_for: '',
    location: null
  }
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800"
  >
    <div
      class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Create Table</h2>
      </div>
    </div>

    <form class="p-4 space-y-3" @submit.prevent="createTable">
      <!-- Table Name -->
      <div>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2"
        >
          <div
            class="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="text-purple-600 dark:text-purple-400"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          Table Name
          <span class="text-red-500">*</span>
        </label>
        <CInput
          id="table-name"
          v-model="newTable.name"
          name="tableName"
          placeholder="e.g. VIP Table, Family Table"
          :show-error="false"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Give your table a descriptive name
        </p>
      </div>

      <!-- Capacity & Type (Row) -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Seating Capacity -->
        <div>
          <label
            class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2"
          >
            <div
              class="w-6 h-6 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-pink-600 dark:text-pink-400"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            Capacity
            <span class="text-red-500">*</span>
          </label>
          <CInput
            id="table-capacity"
            v-model="newTable.capacity"
            name="tableCapacity"
            type="number"
            placeholder="e.g. 8"
            :show-error="false"
          />
        </div>

        <!-- Table Type -->
        <div>
          <label
            class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2"
          >
            <div
              class="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-purple-600 dark:text-purple-400"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                ></path>
              </svg>
            </div>
            Type
            <span class="text-red-500">*</span>
          </label>
          <CSelect
            id="table-type"
            v-model="newTable.type"
            name="tableType"
            :options="tableTypeOptions"
            :show-error="false"
            description=""
            label=""
          />
        </div>
      </div>

      <!-- Priority Slider -->
      <div>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2"
        >
          <div
            class="w-6 h-6 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="text-pink-600 dark:text-pink-400"
            >
              <line x1="12" y1="20" x2="12" y2="10"></line>
              <line x1="18" y1="20" x2="18" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
          </div>
          Priority
          <span class="text-sm font-normal text-gray-500 ml-auto">{{ newTable.priority }}</span>
        </label>

        <div class="relative">
          <input
            id="table-priority"
            v-model.number="newTable.priority"
            type="range"
            min="1"
            max="10"
            step="1"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 (Low)</span>
            <span>5</span>
            <span>10 (High)</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Higher priority tables are filled first
        </p>
      </div>

      <!-- Reserved For -->
      <div>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2"
        >
          <div
            class="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="text-purple-600 dark:text-purple-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
          </div>
          Reserved For
          <span class="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <CInput
          id="reserved-for"
          v-model="newTable.reserved_for"
          name="reservedFor"
          placeholder="e.g. familia_paterna, amigos_escuela"
          :show-error="false"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Reserve this table for a specific group
        </p>
      </div>

      <!-- Location -->
      <div>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2"
        >
          <div
            class="w-6 h-6 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="text-pink-600 dark:text-pink-400"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          Location
          <span class="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <CSelect
          id="table-location"
          v-model="newTable.location"
          name="tableLocation"
          :options="locationOptions"
          placeholder="Select location"
          :show-error="false"
          description=""
          label=""
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Physical location in the venue</p>
      </div>

      <!-- Submit Button -->
      <CButton
        type="submit"
        :disabled="!isFormValid"
        class="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          class="inline-block mr-2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create Table
      </CButton>
    </form>
  </div>
</template>

<style scoped>
/* Custom range slider styling */
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899 0%, #9333ea 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(147, 51, 234, 0.3);
  transition: all 0.2s;
}

input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(147, 51, 234, 0.4);
}

input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899 0%, #9333ea 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(147, 51, 234, 0.3);
  transition: all 0.2s;
}

input[type='range']::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(147, 51, 234, 0.4);
}

/* Dark mode slider track */
.dark input[type='range'] {
  background: #374151;
}
</style>
