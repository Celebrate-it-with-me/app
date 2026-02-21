<script setup>
import { useGuestsStore } from '@/modules/guests/stores/useGuestStore'
import { onMounted, ref } from 'vue'
import NumberPlain from '@/components/UI/plain-ui/NumberPlain.vue'
import { FwbButton } from 'flowbite-vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

const emit = defineEmits(['cancel', 'completed'])
const guestStore = useGuestsStore()
const updating = ref(false)

const companionQty = ref(0)
const notificationStore = useNotificationStore()

onMounted(() => {
  companionQty.value = guestStore.currentGuest.companionQty
})

const cancelUpdate = () => {
  emit('cancel')
}

const updateCompanionQty = async () => {
  try {
    updating.value = true

    const response = await guestStore.updateCompanionQty(companionQty.value)

    if (response.status === 200) {
      await guestStore.loadGuests()
      await guestStore.updateCurrentGuest()
      notificationStore.addNotification({
        type: 'success',
        message: 'Updated companion type successfully!'
      })
      emit('cancel')
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops Something went wrong!'
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    updating.value = false
  }
}
</script>

<template>
  <h5 class="text-xl font-semibold">Update Companion Qty</h5>
  <div class="form-group">
    <NumberPlain id="companion-qty" v-model="companionQty" />

    <div class="flex items-center justify-start w-full gap-x-2">
      <fwb-button color="dark" @click="cancelUpdate"> Cancel </fwb-button>

      <fwb-button color="default" @click="updateCompanionQty"> Update </fwb-button>
    </div>
  </div>
</template>

<style scoped></style>
