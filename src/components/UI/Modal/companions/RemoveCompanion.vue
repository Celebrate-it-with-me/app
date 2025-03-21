<script setup>
import { ref } from 'vue'
import GuestsService from '@/services/GuestsService'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useNotificationStore } from '@/stores/useNotificationStore'

const emit = defineEmits(['removedCompanion'])
const props = defineProps({
  companion: {
    type: [Object, null],
    required: true
  }
})

const removing = ref(false)
const guestStore = useGuestsStore()
const notificationStore = useNotificationStore()

const removeCompanion = async () => {
  try {
    removing.value = true

    const response = await GuestsService.removeCompanion(props.companion.id)

    if (response.status === 200) {
      await guestStore.loadGuests()
      await guestStore.updateCurrentGuest()
      emit('removedCompanion')
      notificationStore.addNotification({
        type: 'success',
        message: 'Companion removed successfully!'
      })

    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }

  } catch (error) {
    console.error(error)
    // show error notification
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div class="remove-companion-template">
    <p>You are about to remove a companion. Are you sure you want to proceed?</p>
    <div
      class="w-full flex justify-end"
    >
      <button
        class="mt-4 text-white text-sm font-medium py-2 px-6 rounded-md bg-red-500 hover:bg-red-600 cursor-pointer"
        @click="removeCompanion"
        :disabled="removing"
      >
      <span
        v-if="removing"
      >
        Removing...
      </span>
        <span
          v-else
        >
        Remove
      </span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
