<template>
  <CModal v-model="showModal">
    <template #title>
      RSVP Details
    </template>

    <div v-if="loadingGuestData" class="space-y-5 text-sm text-gray-700 dark:text-gray-300">
      <CLoading :size="10" />
    </div>

    <div v-else class="space-y-6 text-sm text-gray-700 dark:text-gray-300">
      <!-- Guest Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><p class="font-semibold">Name:</p><p>{{ guestData.name }}</p></div>
        <div><p class="font-semibold">Email:</p><p>{{ guestData.email || 'N/A' }}</p></div>
        <div><p class="font-semibold">Phone:</p><p>{{ guestData.phone || 'N/A' }}</p></div>
        <div><p class="font-semibold">Status:</p><p :class="statusClass">{{ guestData.rsvpStatus }}</p></div>
        <div><p class="font-semibold">Confirmed At:</p><p>{{ guestData.confirmedDate || 'Not confirmed' }}</p></div>
      </div>

      <!-- Invitation Link -->
      <div v-if="guestData.invitationUrl">
        <p class="font-semibold mb-1">Invitation Link:</p>
        <div class="flex items-center gap-2">
          <input type="text" :value="guestData.invitationUrl" readonly class="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded w-full" />
          <CButton size="sm" @click="copyLink">Copy</CButton>
        </div>
      </div>

      <!-- QR Code -->
      <div v-if="guestData.invitationQR">
        <p class="font-semibold mb-1">QR Code:</p>
        <img :src="'data:image/png;base64,' + guestData.invitationQR" alt="QR Code" class="w-36 h-36 object-contain rounded border border-gray-300 dark:border-gray-600" />
      </div>

      <!-- RSVP Logs -->
      <div v-if="guestData.rsvpLogs?.length">
        <p class="font-semibold mb-1">Interaction History:</p>
        <ul class="list-disc list-inside space-y-1 text-xs">
          <li v-for="log in guestData.rsvpLogs" :key="log.id">
            {{ log.message }} - <span class="text-gray-500">{{ log.created_at }}</span>
          </li>
        </ul>
      </div>

      <!-- Send/Resend Invitation -->
      <div class="space-y-2">
        <div>
          <p class="font-semibold mb-1">Select Channel:</p>
          <div class="flex items-center gap-3">
            <CCheckbox
              v-model="channel.email"
              label="Email" id="rsvp-email-checkbox"
            />
            <CCheckbox
              v-model="channel.sms"
              label="SMS"
              id="rsvp-sms-checkbox"
            />
          </div>
        </div>

        <div v-if="guestData?.invitations?.length" class="flex items-center gap-2">
          <span>Last invitation sent: {{ guestData.invitations[0].created_at }}</span>
          <CButton
            size="sm"
            variant="outline"
            @click="resendInvitation"
            :disabled="ableToSendInvitation"
          >Resend Invitation</CButton>
        </div>
        <div v-else class="flex items-center gap-2">
          <span>There is no previous invitation sent</span>
          <CButton
            size="sm"
            variant="outline"
            @click="sendInvitation"
            :disabled="ableToSendInvitation"
          >Send Invitation</CButton>
        </div>
      </div>
    </div>

    <template #footer>
      <CButton variant="ghost" @click="close">Close</CButton>
    </template>
  </CModal>
</template>

<script setup>
import CModal from '@/components/UI/modals/CModal.vue'
import CButton from '@/components/UI/buttons/CButton.vue'
import CLoading from '@/components/UI/loading/CLoading.vue'
import CCheckbox from '@/components/UI/form2/CCheckbox.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useGuestsStore } from '@/stores/useGuestStore'

const emit = defineEmits(['close', 'resend'])
const props = defineProps({
  modelValue: Boolean,
  guest: Object
})

const showModal = ref(false)
const guestData = ref({})
const loadingGuestData = ref(true)
const guestStore = useGuestsStore()
const channel = ref({ email: true, sms: false })

onMounted(() => {
  showModal.value = props.modelValue
})

const close = () => emit('close', false)

const statusClass = computed(() => {
  return {
    pending: 'text-yellow-500',
    confirmed: 'text-green-600 dark:text-green-400',
    declined: 'text-red-500'
  }[props.guest?.rsvpStatus] || 'text-gray-500'
})

const ableToSendInvitation = computed(() => {
  let isAble = true
  Object.keys(channel.value).forEach((key) => {
    if (channel.value[key]) {
      isAble = false
    }
  })

  return isAble
})

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.guest.invitationUrl)
  } catch {
    alert('Failed to copy the link.')
  }
}

const sendInvitation = () => emit('send', { id: props.guest.id, channel: channel.value })
const resendInvitation = () => emit('resend', { id: props.guest.id, channel: channel.value })

const loadGuestData = async () => {
  loadingGuestData.value = true
  const response = await guestStore.loadGuestData(props.guest.id)
  if (response.status === 200) {
    guestData.value = response.data?.data ?? {}
  } else {
    console.error('Failed to load guest data:', response)
  }
  loadingGuestData.value = false
}

watch(showModal, (newValue) => {
  if (!newValue) emit('close', false)
})

watch(() => props.modelValue, async (newValue) => {
  showModal.value = newValue
  if (showModal.value) await loadGuestData()
}, { immediate: true })
</script>
