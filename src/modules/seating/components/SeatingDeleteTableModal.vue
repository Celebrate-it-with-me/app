<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  table: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const seatingStore = useSeatingStore()

const confirmDelete = async () => {
  if (props.table) {
    await seatingStore.deleteTable(props.table.id)
  }
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
          class="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="text-red-600 dark:text-red-400"
          >
            <path
              d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            ></path>
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
          </svg>
        </div>
        <span>Delete Table</span>
      </div>
    </template>

    <div class="py-4">
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        Are you sure you want to delete
        <span class="font-semibold">{{ table?.name }}</span
        >?
      </p>
      <div
        v-if="table?.assignedGuests?.length > 0"
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-4"
      >
        <div class="flex gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-yellow-600 dark:text-yellow-400 flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <p class="text-sm text-yellow-800 dark:text-yellow-200">
            This table has {{ table.assignedGuests.length }} assigned guest(s). They will be moved
            back to unassigned.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <CButton variant="outline" class="px-6 py-2 rounded-xl" @click="closeModal">
          Cancel
        </CButton>
        <CButton
          class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl"
          @click="confirmDelete"
        >
          Delete Table
        </CButton>
      </div>
    </template>
  </CModal>
</template>
