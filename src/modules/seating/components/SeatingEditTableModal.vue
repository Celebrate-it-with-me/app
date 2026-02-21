<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CInput from '@/components/UI/form2/CInput.vue'
import CSelect from '@/components/UI/form2/CSelect.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  table: {
    type: Object,
    default: () => ({
      id: null,
      name: '',
      capacity: '',
      type: 'general',
      priority: 5,
      reserved_for: '',
      location: null,
      assigned_guests: []
    })
  }
})

const emit = defineEmits(['update:modelValue', 'update:table'])

const seatingStore = useSeatingStore()

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

const updateTable = async () => {
  if (
    props.table.name.trim() === '' ||
    props.table.capacity === '' ||
    parseInt(props.table.capacity) <= 0
  ) {
    return
  }

  await seatingStore.updateTable(
    props.table.id,
    props.table.name,
    parseInt(props.table.capacity),
    props.table.type,
    props.table.priority,
    props.table.reserved_for || null,
    props.table.location
  )
  emit('update:modelValue', false)
}

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <CModal :model-value="modelValue" show-close-icon @update:model-value="closeModal">
    <template #title>
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </div>
        <span>Edit Table</span>
      </div>
    </template>

    <form class="space-y-3" @submit.prevent="updateTable">
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
          id="edit-table-name"
          :model-value="table.name"
          name="editTableName"
          placeholder="e.g. VIP Table, Family Table"
          :show-error="false"
          @update:model-value="emit('update:table', { ...table, name: $event })"
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
            id="edit-table-capacity"
            :model-value="table.capacity"
            name="editTableCapacity"
            type="number"
            placeholder="e.g. 8"
            :show-error="false"
            @update:model-value="emit('update:table', { ...table, capacity: $event })"
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
            id="edit-table-type"
            :model-value="table.type"
            name="editTableType"
            :options="tableTypeOptions"
            :show-error="false"
            description=""
            label=""
            @update:model-value="emit('update:table', { ...table, type: $event })"
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
          <span class="text-sm font-normal text-gray-500 ml-auto">{{ table.priority }}</span>
        </label>

        <div class="relative">
          <input
            id="edit-table-priority"
            :value="table.priority"
            type="range"
            min="1"
            max="10"
            step="1"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            @input="emit('update:table', { ...table, priority: parseInt($event.target.value) })"
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
          id="edit-reserved-for"
          :model-value="table.reserved_for"
          name="editReservedFor"
          placeholder="e.g. familia_paterna, amigos_escuela"
          :show-error="false"
          @update:model-value="emit('update:table', { ...table, reserved_for: $event })"
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
          id="edit-table-location"
          :model-value="table.location"
          name="editTableLocation"
          :options="locationOptions"
          placeholder="Select location"
          :show-error="false"
          description=""
          label=""
          @update:model-value="emit('update:table', { ...table, location: $event })"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Physical location in the venue</p>
      </div>

      <!-- Capacity Warning -->
      <div
        v-if="parseInt(table.capacity) < table.assigned_guests?.length"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4"
      >
        <div class="flex gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-red-500 flex-shrink-0"
          >
            <path
              d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            ></path>
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
          </svg>
          <p class="text-sm text-red-700 dark:text-red-300">
            Reducing capacity will not remove assigned guests, but you won't be able to add more.
          </p>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <CButton variant="outline" class="px-6 py-2 rounded-xl" @click="closeModal">
          Cancel
        </CButton>
        <CButton
          class="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl"
          @click="updateTable"
        >
          Save Changes
        </CButton>
      </div>
    </template>
  </CModal>
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
