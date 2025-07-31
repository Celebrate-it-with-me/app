<template>
  <CModal v-model="showModal">
    <template #title> RSVP Details </template>

    <div v-if="loadingGuestData" class="space-y-5 text-sm text-gray-700 dark:text-gray-300">
      <CLoading :size="10" />
    </div>

    <div v-else class="space-y-6 text-sm text-gray-700 dark:text-gray-300">
      <!-- Guest Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="font-semibold">Name:</p>
          <p>{{ guestData.name }}</p>
        </div>
        <div>
          <p class="font-semibold">Email:</p>
          <p>{{ guestData.email || 'N/A' }}</p>
        </div>
        <div>
          <p class="font-semibold">Phone:</p>
          <p>{{ guestData.phone || 'N/A' }}</p>
        </div>
        <div>
          <p class="font-semibold">Status:</p>
          <p :class="statusClass">
            {{
              guestData.rsvpStatus === 'attending'
                ? 'Attending'
                : guestData.rsvpStatus === 'not-attending'
                  ? 'Not Attending'
                  : guestData.rsvpStatus === 'pending'
                    ? 'Pending'
                    : 'Unknown'
            }}
          </p>
        </div>
        <div>
          <p class="font-semibold">Confirmed At:</p>
          <p>{{ guestData.rsvpStatusDate || 'Not confirmed' }}</p>
        </div>

        <div v-if="isCompleted">
          <p class="font-semibold">Revert Confirmation:</p>
          <CButton :disabled="reverting" variant="primary" size="sm" @click="revertConfirmation">
            <span v-if="reverting" class="flex gap-x-2">
              <CWMLoading size="w-5 h-5" />
              Reverting...
            </span>
            <span v-else> Revert Confirmation </span>
          </CButton>
        </div>
      </div>

      <div v-if="!isCompleted && guestData.invitationUrl">
        <p class="font-semibold mb-1">Invitation Link:</p>
        <div class="flex items-center gap-2">
          <input
            type="text"
            :value="guestData.invitationUrl"
            readonly
            class="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded w-full"
          />
          <CButton size="sm" @click="copyLink">Copy</CButton>
        </div>
      </div>

      <div v-if="!isCompleted && guestData.invitationQR">
        <p class="font-semibold mb-1">QR Code:</p>
        <img
          :src="'data:image/png;base64,' + guestData.invitationQR"
          alt="QR Code"
          class="w-36 h-36 object-contain rounded border border-gray-300 dark:border-gray-600"
        />
      </div>

      <div v-if="guestData.rsvpLogs?.length">
        <p class="font-semibold mb-1">Interaction History:</p>
        <ul class="list-disc list-inside space-y-1 text-xs">
          <li v-for="log in guestData.rsvpLogs" :key="log.id">
            {{ log.message }} - <span class="text-gray-500">{{ log.created_at }}</span>
          </li>
        </ul>
      </div>

      <div v-if="!isCompleted" class="space-y-2">
        <div>
          <p class="font-semibold mb-1">Select Channel:</p>
          <div class="flex items-center gap-3">
            <CCheckbox id="rsvp-email-checkbox" v-model="channel.email" label="Email" />
            <CCheckbox id="rsvp-sms-checkbox" v-model="channel.sms" label="SMS" />
          </div>
        </div>

        <div v-if="guestData?.invitations?.length" class="flex items-center gap-2">
          <span>Last invitation sent: {{ guestData.invitations[0].created_at }}</span>
          <CButton
            size="sm"
            variant="outline"
            :disabled="ableToSendInvitation"
            @click="resendInvitation"
            >Resend Invitation</CButton
          >
        </div>
        <div v-else class="flex items-center gap-2">
          <span>There is no previous invitation sent</span>
          <CButton
            size="sm"
            variant="primary"
            :disabled="ableToSendInvitation"
            @click="sendInvitation"
            >Send Invitation</CButton
          >
        </div>
      </div>
    </div>

    <template #footer>
      <CButton variant="outline" @click="close">Close</CButton>
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
import CWMLoading from '@/components/UI/loading/CWMLoading.vue'
import { useRsvpStore } from '@/stores/useRsvpStore'

const emit = defineEmits(['close', 'resend', 'confirmationReverted', 'send'])
const props = defineProps({
  modelValue: Boolean,
  guest: Object
})

const showModal = ref(false)
const guestData = ref({})
const loadingGuestData = ref(true)
const guestStore = useGuestsStore()
const rsvpStore = useRsvpStore()
const channel = ref({ email: true, sms: false })
const reverting = ref(false)

onMounted(() => {
  showModal.value = props.modelValue
})

const close = () => emit('close', false)

const isCompleted = computed(() => {
  return props.guest?.rsvpStatus === 'attending' || props.guest?.rsvpStatus === 'not-attending'
})

const statusClass = computed(() => {
  return (
    {
      pending: 'text-yellow-500',
      attending: 'text-green-600 dark:text-green-400',
      'not-attending': 'text-red-500'
    }[props.guest?.rsvpStatus] || 'text-gray-500'
  )
})

const ableToSendInvitation = computed(() => {
  let isAble = true
  Object.keys(channel.value).forEach(key => {
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

const revertConfirmation = async () => {
  try {
    reverting.value = true
    const response = await rsvpStore.revertConfirmation({
      guestId: props.guest.id
    })

    if (response.status === 200) {
      emit('confirmationReverted', props.guest.id)
    } else {
      console.error('Failed to revert confirmation:', response)
    }
  } catch (error) {
    console.error('Failed to revert confirmation:', error)
  } finally {
    reverting.value = false
  }
}

watch(showModal, newValue => {
  if (!newValue) emit('close', false)
})

watch(
  () => props.modelValue,
  async newValue => {
    showModal.value = newValue
    if (showModal.value) await loadGuestData()
  },
  { immediate: true }
)
</script>
