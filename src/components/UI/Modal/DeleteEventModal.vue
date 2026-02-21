<script setup>
import CWMModal from '@/components/UI/Modal/CWMModal.vue'
import { ref, watch } from 'vue'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const emit = defineEmits(['closeModal'])
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const loading = ref(false)
const eventStore = useEventsStore()
const notificationStore = useNotificationStore()
const showModal = ref(props.open)

const handleClose = () => {
  emit('closeModal')
}

const confirmedDelete = async () => {
  try {
    loading.value = true
    const response = await eventStore.removeCurrentEvent()

    if (response.status === 200) {
      emit('closeModal')
      notificationStore.addNotification({
        type: 'success',
        message: 'Event Deleted successfully!'
      })

      await eventStore.initEvents()
    } else {
      console.log(response)
    }
  } catch (err) {
    console.log(err)
  } finally {
    eventStore.currentEvent = null
    loading.value = false
  }
}

watch(
  () => props.open,
  newValue => {
    showModal.value = newValue
  }
)
</script>

<template>
  <CWMModal :show-modal="showModal" @close="handleClose">
    <template #header> Confirm Delete Event </template>

    <template #body>
      <p>
        Are you sure you want to delete this event? This action cannot be undone. If you need to
        restore the event later, please contact our support team for assistance.
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <div class="action-container flex gap-x-2">
          <button
            type="button"
            class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-6 rounded-md"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="text-white text-sm font-medium py-2 px-6 rounded-md bg-red-500 hover:bg-red-600 cursor-pointer"
            @click="confirmedDelete"
          >
            Confirm Deletion
          </button>
        </div>
      </div>
    </template>
  </CWMModal>
</template>

<style scoped></style>
