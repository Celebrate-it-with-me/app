<script setup>
import CWMModal from '@/components/UI/Modal/CWMModal.vue'
import { computed, ref, watch } from 'vue'
import { useGuestsStore } from '@/stores/useGuestStore'
import { useEventsStore } from '@/stores/useEventsStore'
import { FwbButton } from 'flowbite-vue'

const emit = defineEmits(['closeModal'])
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const eventStore = useEventsStore()
const guestStore = useGuestsStore()
const showModal = ref(props.open)

const eventLink = computed(() => {
  return `${import.meta.env.VITE_BASE_URL}event/${eventStore.currentEvent.id}/guest/${guestStore.currentGuest.accessCode}`
})

const qrInvitationUrl = computed(() => {
  return `data:image/png;base64,${guestStore.currentGuest?.invitationQR}`
})

const handleClose = () => {
  emit('closeModal')
}

watch(
  () => props.open,
  newValue => {
    showModal.value = newValue
  }
)
</script>

<template>
  <CWMModal :show-modal="showModal" :size="'6xl'" @close="handleClose">
    <template #header> Guest More Info </template>

    <template #body>
      <div class="flex justify-between items-center gap-x-4 px-16">
        <div class="guest-info-view flex flex-col gap-y-4">
          <div class="guest-info-item">
            <span class="label">First Name: </span>
            <span class="value">{{ guestStore.currentGuest?.firstName || 'N/A' }}</span>
          </div>
          <div class="guest-info-item">
            <span class="label">Last Name: </span>
            <span class="value">{{ guestStore.currentGuest?.lastName || 'N/A' }}</span>
          </div>
          <div class="guest-info-item">
            <span class="label">Email: </span>
            <span class="value">{{ guestStore.currentGuest?.email || 'N/A' }}</span>
          </div>
          <div class="guest-info-item">
            <span class="label">Phone Number: </span>
            <span class="value">{{ guestStore.currentGuest?.phoneNumber || 'N/A' }}</span>
          </div>
          <div class="guest-info-item">
            <span class="label">Access Link: </span>
            <a class="access-link text-blue-500 hover:underline" :href="eventLink" target="_blank">
              {{ eventLink }}
            </a>
          </div>
        </div>
        <div class="invitation-qr flex flex-col gap-x-4 px-16">
          <img :src="qrInvitationUrl" alt="Invitation QR" />
          <a
            :href="qrInvitationUrl"
            download="QRCode.png"
            class="text-white bg-blue-600 hover:bg-blue-700 text-center px-1 py-2 mt-2 rounded-lg"
            >Download</a
          >
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <div class="action-container flex gap-x-2">
          <button
            type="button"
            class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-6 rounded-md"
            @click="handleClose"
          >
            Close
          </button>
        </div>
      </div>
    </template>
  </CWMModal>
</template>

<style scoped></style>
