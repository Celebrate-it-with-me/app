<script setup>
import CButton from '@/components/UI/buttons/CButton.vue'
import CModal from '@/components/UI/modals/CModal.vue'
import { useSeatingStore } from '@/modules/seating/stores/useSeatingStore'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  guest: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const seatingStore = useSeatingStore()
const { selectedTable } = storeToRefs(seatingStore)

const confirmRemove = async () => {
  if (props.guest) {
    await seatingStore.removeGuestFromTable(props.guest.id)
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
          class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="text-yellow-600 dark:text-yellow-400"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        </div>
        <span>Remove Guest</span>
      </div>
    </template>

    <div class="py-4">
      <p class="text-gray-700 dark:text-gray-300">
        Remove <span class="font-semibold">{{ guest?.name }}</span> from
        <span class="font-semibold">{{ selectedTable?.name }}</span
        >?
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <CButton variant="outline" class="px-6 py-2 rounded-xl" @click="closeModal">
          Cancel
        </CButton>
        <CButton
          class="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
          @click="confirmRemove"
        >
          Remove Guest
        </CButton>
      </div>
    </template>
  </CModal>
</template>
