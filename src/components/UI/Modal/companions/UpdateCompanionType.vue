<script setup>
import { computed, onMounted, ref } from 'vue'
import RadioPlain from '@/components/UI/plain-ui/RadioPlain.vue'
import { useGuestsStore } from '@/modules/guests/stores/useGuestStore'
import { FwbButton } from 'flowbite-vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

const emit = defineEmits(['cancel', 'completed'])

const companionType = ref('')
const guestStore = useGuestsStore()
const updating = ref(false)
const notificationStore = useNotificationStore()

const saveDisabled = computed(() => {
  return companionType.value === guestStore.currentGuest.companionType
})

onMounted(() => {
  companionType.value = guestStore.currentGuest.companionType
})

const cancelChangeType = () => {
  emit('cancel')
}

const changeCompanionType = async () => {
  try {
    updating.value = true
    const response = await guestStore.updateCompanionType(companionType.value)

    if (response.status === 200) {
      await guestStore.loadGuests()
      await guestStore.updateCurrentGuest()
      notificationStore.addNotification({
        type: 'success',
        message: 'Companion removed successfully!'
      })

      emit('completed')
    } else {
      notificationStore.addNotification({
        type: 'error',
        message: 'Oops something went wrong!'
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    updating.value = false
  }
}
</script>

<template>
  <h5 class="text-lg font-normal mb-2">Type:</h5>
  <div class="select-companion-type flex flex-row gap-x-4">
    <RadioPlain
      id="option1"
      v-model="companionType"
      name="companionType"
      value="no_companion"
      label="No Companion"
    />

    <RadioPlain
      id="option2"
      v-model="companionType"
      name="companionType"
      value="no_named"
      label="No Named"
    />

    <RadioPlain
      id="option3"
      v-model="companionType"
      name="companionType"
      value="named"
      label="Named"
    />
  </div>
  <div class="flex flex-row justify-end gap-x-4">
    <fwb-button color="dark" @click="cancelChangeType"> Cancel </fwb-button>
    <fwb-button
      color="default"
      :disabled="saveDisabled"
      :loading="updating"
      @click="changeCompanionType"
    >
      Save
    </fwb-button>
  </div>
</template>

<style scoped></style>
